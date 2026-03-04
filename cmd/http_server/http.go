package http_server

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/gofreego/helpdesk/api/helpdesk_v1"
	"github.com/gofreego/helpdesk/internal/configs"
	"github.com/gofreego/helpdesk/internal/middleware"
	"github.com/gofreego/helpdesk/internal/repository"
	"github.com/gofreego/helpdesk/internal/service"

	"github.com/gofreego/goutils/api"
	"github.com/gofreego/goutils/api/debug"

	"github.com/gofreego/goutils/logger"
	"github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"google.golang.org/protobuf/encoding/protojson"
)

// customCORSMiddleware adds CORS headers to allow requests from the frontend
func customCORSMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Allow requests from the React dev server
		origin := r.Header.Get("Origin")
		if origin == "http://localhost:3006" || origin == "http://127.0.0.1:3006" {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		} else {
			w.Header().Set("Access-Control-Allow-Origin", "*")
		}

		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-User-Id, X-User-Perms, x-user-id, x-user-perms")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Max-Age", "3600")

		// Handle preflight requests
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

type HTTPServer struct {
	cfg       *configs.Configuration
	uifs      http.FileSystem
	indexHTML []byte
	server    *http.Server
}

func (a *HTTPServer) Name() string {
	return "HTTP_Server"
}

func (a *HTTPServer) Shutdown(ctx context.Context) {
	if err := a.server.Shutdown(ctx); err != nil {
		logger.Panic(ctx, "failed to shutdown %s : %v", a.Name(), err)
	}
}

func NewHTTPServer(cfg *configs.Configuration, uifs http.FileSystem, indexHTML []byte) *HTTPServer {
	return &HTTPServer{
		cfg:       cfg,
		uifs:      uifs,
		indexHTML: indexHTML,
	}
}

func (a *HTTPServer) Run(ctx context.Context) error {

	if a.cfg.Server.HTTPPort == 0 {
		logger.Panic(ctx, "http port is not provided")
	}

	service := service.NewService(ctx, &a.cfg.Service, repository.GetInstance(ctx, &a.cfg.Repository))

	// Create mux with custom header matching to forward auth headers
	mux := runtime.NewServeMux(
		runtime.WithMarshalerOption(runtime.MIMEWildcard, &runtime.JSONPb{
			MarshalOptions: protojson.MarshalOptions{
				UseProtoNames: false,
			},
			UnmarshalOptions: protojson.UnmarshalOptions{
				DiscardUnknown: true,
			},
		}),
		runtime.WithIncomingHeaderMatcher(func(key string) (string, bool) {
			switch key {
			case "X-User-Id", "x-user-id":
				return "x-user-id", true
			case "X-User-Perms", "x-user-perms":
				return "x-user-perms", true
			default:
				return runtime.DefaultHeaderMatcher(key)
			}
		}),
	)

	api.RegisterSwaggerHandler(ctx, mux, "/helpdesk/v1/swagger", "./api/docs/proto", "/helpdesk/v1/helpdesk.swagger.json")
	err := helpdesk_v1.RegisterBaseServiceHandlerServer(ctx, mux, service)
	if err != nil {
		logger.Panic(ctx, "failed to register ping service : %v", err)
	}

	// Register debug endpoints if enabled
	if a.cfg.Debug.Enabled {
		debug.RegisterDebugHandlersWithGateway(ctx, &a.cfg.Debug, mux, a.cfg.Logger.AppName, string(a.cfg.Logger.Build), "/helpdesk/v1")
	}

	// UI Handler with SPA Fallback
	uiHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// If requesting /, redirect to /helpdesk/
		if r.URL.Path == "/" {
			http.Redirect(w, r, "/helpdesk/", http.StatusFound)
			return
		}

		// Try to serve static file
		prefix := "/helpdesk"
		f, err := a.uifs.Open(r.URL.Path[len(prefix):])
		if err == nil {
			f.Close()
			http.StripPrefix(prefix, http.FileServer(a.uifs)).ServeHTTP(w, r)
			return
		}

		// Fallback to index.html for SPA routes
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.WriteHeader(http.StatusOK)
		w.Write(a.indexHTML)
	})

	finalHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path
		// Direct API and Swagger to mux
		if strings.HasPrefix(path, "/helpdesk/v1") || strings.HasPrefix(path, "/helpdesk/swagger") {
			customCORSMiddleware(middleware.HTTPAuthMiddleware(mux)).ServeHTTP(w, r)
			return
		}

		// Direct UI requests or fallback routes to uiHandler
		if strings.HasPrefix(path, "/helpdesk") || path == "/" {
			uiHandler.ServeHTTP(w, r)
			return
		}

		// Deny other paths or redirect
		http.Redirect(w, r, "/helpdesk/", http.StatusFound)
	})

	a.server = &http.Server{
		Addr:    fmt.Sprintf(":%d", a.cfg.Server.HTTPPort),
		Handler: logger.WithRequestMiddleware(logger.WithRequestTimeMiddleware(finalHandler)),
	}

	logger.Info(ctx, "Starting HTTP server on port %d", a.cfg.Server.HTTPPort)
	logger.Info(ctx, "Swagger UI is available at `http://localhost:%d/helpdesk/v1/swagger`", a.cfg.Server.HTTPPort)
	if a.cfg.Debug.Enabled {
		logger.Info(ctx, "Debug dashboard available at `http://localhost:%d/helpdesk/v1/debug`", a.cfg.Server.HTTPPort)
	}
	// Start HTTP server (and proxy calls to gRPC server endpoint)
	err = a.server.ListenAndServe()
	if err != nil && err != http.ErrServerClosed {
		logger.Panic(ctx, "failed to start http server : %v", err)
	}
	return nil
}
