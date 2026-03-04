package middleware

import (
	"context"
	"net/http"

	"github.com/gofreego/helpdesk/internal/constants"
	"google.golang.org/grpc"
	"google.golang.org/grpc/metadata"
)

// AuthInterceptor extracts user info from gRPC metadata and adds to context
func AuthInterceptor(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
	md, ok := metadata.FromIncomingContext(ctx)
	if ok {
		// Extract x-user-id
		if userIDs := md.Get(constants.HeaderUserID); len(userIDs) > 0 {
			ctx = context.WithValue(ctx, constants.ContextKeyUserID, userIDs[0])
		}

		// Extract x-user-perms
		if perms := md.Get(constants.HeaderUserPerms); len(perms) > 0 {
			ctx = context.WithValue(ctx, constants.ContextKeyUserPerms, perms[0])
		}
	}

	return handler(ctx, req)
}

// HTTPAuthMiddleware extracts user info from HTTP headers and adds to context
func HTTPAuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()

		// Extract x-user-id
		if userID := r.Header.Get(constants.HeaderUserID); userID != "" {
			ctx = context.WithValue(ctx, constants.ContextKeyUserID, userID)
		}

		// Extract x-user-perms
		if perms := r.Header.Get(constants.HeaderUserPerms); perms != "" {
			ctx = context.WithValue(ctx, constants.ContextKeyUserPerms, perms)
		}

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
