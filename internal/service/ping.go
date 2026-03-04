package service

import (
	"context"

	"github.com/gofreego/goutils/logger"
	"github.com/gofreego/helpdesk/api/helpdesk_v1"
)

func (s *Service) Ping(ctx context.Context, req *helpdesk_v1.HDPingRequest) (*helpdesk_v1.HDPingResponse, error) {
	logger.Debug(ctx, "Ping request received, %v", req.Message)
	err := s.repo.Ping(ctx)
	if err != nil {
		return nil, err
	}
	return &helpdesk_v1.HDPingResponse{
		Message: "Its fine here...!",
	}, nil
}
