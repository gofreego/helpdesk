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

// -- Products (not implemented in memory) --

func (r *MemoryRepository) GetProduct(_ context.Context, _ int64) (*dao.Product, error) {
	logger.Warn(context.Background(), "GetProduct not implemented in memory repository")
	return nil, status.Errorf(codes.Unimplemented, "products not implemented in memory repository")
}

func (r *MemoryRepository) ListProducts(_ context.Context, _ *filter.ProductFilter) ([]*dao.Product, error) {
	logger.Warn(context.Background(), "ListProducts not implemented in memory repository")
	return nil, status.Errorf(codes.Unimplemented, "products not implemented in memory repository")
}

func (r *MemoryRepository) CreateProduct(_ context.Context, _ *dao.Product) error {
	logger.Warn(context.Background(), "CreateProduct not implemented in memory repository")
	return status.Errorf(codes.Unimplemented, "products not implemented in memory repository")
}

func (r *MemoryRepository) UpdateProduct(_ context.Context, _ *dao.Product) error {
	logger.Warn(context.Background(), "UpdateProduct not implemented in memory repository")
	return status.Errorf(codes.Unimplemented, "products not implemented in memory repository")
}

func (r *MemoryRepository) DeleteProduct(_ context.Context, _ int64) error {
	logger.Warn(context.Background(), "DeleteProduct not implemented in memory repository")
	return status.Errorf(codes.Unimplemented, "products not implemented in memory repository")
}

// -- Product Entities (not implemented in memory) --

func (r *MemoryRepository) ListProductEntities(_ context.Context, _ *filter.ProductEntityFilter) ([]*dao.ProductEntity, error) {
	logger.Warn(context.Background(), "ListProductEntities not implemented in memory repository")
	return nil, status.Errorf(codes.Unimplemented, "product entities not implemented in memory repository")
}

func (r *MemoryRepository) CreateProductEntity(_ context.Context, _ *dao.ProductEntity) error {
	logger.Warn(context.Background(), "CreateProductEntity not implemented in memory repository")
	return status.Errorf(codes.Unimplemented, "product entities not implemented in memory repository")
}

func (r *MemoryRepository) DeleteProductEntity(_ context.Context, _ int64) error {
	logger.Warn(context.Background(), "DeleteProductEntity not implemented in memory repository")
	return status.Errorf(codes.Unimplemented, "product entities not implemented in memory repository")
}

// -- Product Issue Types (not implemented in memory) --

func (r *MemoryRepository) ListProductIssueTypes(_ context.Context, _ *filter.ProductIssueTypeFilter) ([]*dao.ProductIssueType, error) {
	logger.Warn(context.Background(), "ListProductIssueTypes not implemented in memory repository")
	return nil, status.Errorf(codes.Unimplemented, "product issue types not implemented in memory repository")
}

func (r *MemoryRepository) CreateProductIssueType(_ context.Context, _ *dao.ProductIssueType) error {
	logger.Warn(context.Background(), "CreateProductIssueType not implemented in memory repository")
	return status.Errorf(codes.Unimplemented, "product issue types not implemented in memory repository")
}

func (r *MemoryRepository) DeleteProductIssueType(_ context.Context, _ int64) error {
	logger.Warn(context.Background(), "DeleteProductIssueType not implemented in memory repository")
	return status.Errorf(codes.Unimplemented, "product issue types not implemented in memory repository")
}
