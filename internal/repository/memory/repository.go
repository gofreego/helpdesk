package memory

import (
	"context"

	"github.com/gofreego/goutils/logger"
	"github.com/gofreego/helpdesk/internal/models/dao"
	"github.com/gofreego/helpdesk/internal/models/filter"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type Config struct {
}

type MemoryRepository struct {
	cfg *Config
}

func NewRepository(ctx context.Context, cfg *Config) (*MemoryRepository, error) {
	return &MemoryRepository{
		cfg: cfg,
	}, nil
}

func (r *MemoryRepository) Ping(ctx context.Context) error {
	logger.Debug(ctx, "MemoryRepository.Ping called")
	return nil
}

// -- Ratings (not implemented in memory) --

func (r *MemoryRepository) CreateRating(_ context.Context, _ *dao.Rating) error {
	logger.Warn(context.Background(), "CreateRating not implemented in memory repository")
	return status.Errorf(codes.Unimplemented, "ratings not implemented in memory repository")
}

func (r *MemoryRepository) GetRating(_ context.Context, _ string) (*dao.Rating, error) {
	logger.Warn(context.Background(), "GetRating not implemented in memory repository")
	return nil, status.Errorf(codes.Unimplemented, "ratings not implemented in memory repository")
}

func (r *MemoryRepository) ListRatings(_ context.Context, _ *filter.RatingFilter) ([]*dao.Rating, error) {
	logger.Warn(context.Background(), "ListRatings not implemented in memory repository")
	return nil, status.Errorf(codes.Unimplemented, "ratings not implemented in memory repository")
}

func (r *MemoryRepository) UpdateRating(_ context.Context, _ *dao.Rating) error {
	logger.Warn(context.Background(), "UpdateRating not implemented in memory repository")
	return status.Errorf(codes.Unimplemented, "ratings not implemented in memory repository")
}

func (r *MemoryRepository) DeleteRating(_ context.Context, _ string) error {
	logger.Warn(context.Background(), "DeleteRating not implemented in memory repository")
	return status.Errorf(codes.Unimplemented, "ratings not implemented in memory repository")
}

// -- Rating Replies (not implemented in memory) --

func (r *MemoryRepository) CreateRatingReply(_ context.Context, _ *dao.RatingReply) error {
	logger.Warn(context.Background(), "CreateRatingReply not implemented in memory repository")
	return status.Errorf(codes.Unimplemented, "rating replies not implemented in memory repository")
}

func (r *MemoryRepository) ListRatingReplies(_ context.Context, _ *filter.RatingReplyFilter) ([]*dao.RatingReply, error) {
	logger.Warn(context.Background(), "ListRatingReplies not implemented in memory repository")
	return nil, status.Errorf(codes.Unimplemented, "rating replies not implemented in memory repository")
}

func (r *MemoryRepository) DeleteRatingReply(_ context.Context, _ string) error {
	logger.Warn(context.Background(), "DeleteRatingReply not implemented in memory repository")
	return status.Errorf(codes.Unimplemented, "rating replies not implemented in memory repository")
}

// -- Issues (not implemented in memory) --

func (r *MemoryRepository) CreateIssue(_ context.Context, _ *dao.Issue) error {
	logger.Warn(context.Background(), "CreateIssue not implemented in memory repository")
	return status.Errorf(codes.Unimplemented, "issues not implemented in memory repository")
}

func (r *MemoryRepository) GetIssue(_ context.Context, _ string) (*dao.Issue, error) {
	logger.Warn(context.Background(), "GetIssue not implemented in memory repository")
	return nil, status.Errorf(codes.Unimplemented, "issues not implemented in memory repository")
}

func (r *MemoryRepository) ListIssues(_ context.Context, _ *filter.IssueFilter) ([]*dao.Issue, error) {
	logger.Warn(context.Background(), "ListIssues not implemented in memory repository")
	return nil, status.Errorf(codes.Unimplemented, "issues not implemented in memory repository")
}

func (r *MemoryRepository) UpdateIssue(_ context.Context, _ *dao.Issue) error {
	logger.Warn(context.Background(), "UpdateIssue not implemented in memory repository")
	return status.Errorf(codes.Unimplemented, "issues not implemented in memory repository")
}

func (r *MemoryRepository) DeleteIssue(_ context.Context, _ string) error {
	logger.Warn(context.Background(), "DeleteIssue not implemented in memory repository")
	return status.Errorf(codes.Unimplemented, "issues not implemented in memory repository")
}

// -- Issue Replies (not implemented in memory) --

func (r *MemoryRepository) CreateIssueReply(_ context.Context, _ *dao.IssueReply) error {
	logger.Warn(context.Background(), "CreateIssueReply not implemented in memory repository")
	return status.Errorf(codes.Unimplemented, "issue replies not implemented in memory repository")
}

func (r *MemoryRepository) ListIssueReplies(_ context.Context, _ *filter.IssueReplyFilter) ([]*dao.IssueReply, error) {
	logger.Warn(context.Background(), "ListIssueReplies not implemented in memory repository")
	return nil, status.Errorf(codes.Unimplemented, "issue replies not implemented in memory repository")
}

func (r *MemoryRepository) DeleteIssueReply(_ context.Context, _ string) error {
	logger.Warn(context.Background(), "DeleteIssueReply not implemented in memory repository")
	return status.Errorf(codes.Unimplemented, "issue replies not implemented in memory repository")
}
