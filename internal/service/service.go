package service

import (
	"context"

	"github.com/gofreego/helpdesk/api/helpdesk_v1"
	"github.com/gofreego/helpdesk/internal/constants"
	"github.com/gofreego/helpdesk/internal/models/dao"
	"github.com/gofreego/helpdesk/internal/models/filter"
	"github.com/gofreego/helpdesk/pkg/auth"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type Config struct {
	RatingEntities    []string `yaml:"RatingEntities"`
	IssueEntities     []string `yaml:"IssueEntities"`
	IssueTypes        []string `yaml:"IssueTypes"`
	AllowedProductIds []int    `yaml:"AllowedProductIds"`
	MaxRating         float32  `yaml:"MaxRating"`
}

type Repository interface {
	Ping(ctx context.Context) error

	// Ratings
	CreateRating(ctx context.Context, rating *dao.Rating) error
	GetRating(ctx context.Context, id string) (*dao.Rating, error)
	ListRatings(ctx context.Context, f *filter.RatingFilter) ([]*dao.Rating, error)
	UpdateRating(ctx context.Context, rating *dao.Rating) error
	DeleteRating(ctx context.Context, id string) error

	// Rating Replies
	CreateRatingReply(ctx context.Context, reply *dao.RatingReply) error
	ListRatingReplies(ctx context.Context, f *filter.RatingReplyFilter) ([]*dao.RatingReply, error)
	DeleteRatingReply(ctx context.Context, id string) error // soft delete

	// Issues
	CreateIssue(ctx context.Context, issue *dao.Issue) error
	GetIssue(ctx context.Context, id string) (*dao.Issue, error)
	ListIssues(ctx context.Context, f *filter.IssueFilter) ([]*dao.Issue, error)
	UpdateIssue(ctx context.Context, issue *dao.Issue) error
	DeleteIssue(ctx context.Context, id string) error

	// Issue Replies
	CreateIssueReply(ctx context.Context, reply *dao.IssueReply) error
	ListIssueReplies(ctx context.Context, f *filter.IssueReplyFilter) ([]*dao.IssueReply, error)
	DeleteIssueReply(ctx context.Context, id string) error // soft delete

	// Products
	GetProduct(ctx context.Context, id int64) (*dao.Product, error)
	ListProducts(ctx context.Context, f *filter.ProductFilter) ([]*dao.Product, error)
	CreateProduct(ctx context.Context, product *dao.Product) error
	UpdateProduct(ctx context.Context, product *dao.Product) error
	DeleteProduct(ctx context.Context, id int64) error

	// Product Entities
	ListProductEntities(ctx context.Context, f *filter.ProductEntityFilter) ([]*dao.ProductEntity, error)
	CreateProductEntity(ctx context.Context, entity *dao.ProductEntity) error
	DeleteProductEntity(ctx context.Context, id int64) error

	// Product Issue Types
	ListProductIssueTypes(ctx context.Context, f *filter.ProductIssueTypeFilter) ([]*dao.ProductIssueType, error)
	CreateProductIssueType(ctx context.Context, issueType *dao.ProductIssueType) error
	DeleteProductIssueType(ctx context.Context, id int64) error
}

type Service struct {
	repo Repository
	cfg  *Config
	helpdesk_v1.UnimplementedBaseServiceServer
}

func NewService(ctx context.Context, cfg *Config, repo Repository) *Service {
	return &Service{
		repo: repo,
		cfg:  cfg,
	}
}

// ===== Rating Handlers =====

func (s *Service) CreateRating(ctx context.Context, req *helpdesk_v1.CreateRatingRequest) (*helpdesk_v1.CreateRatingResponse, error) {
	// Validate product ID
	allowedProduct := false
	for _, id := range s.cfg.AllowedProductIds {
		if int32(id) == req.ProductId {
			allowedProduct = true
			break
		}
	}
	if !allowedProduct {
		return nil, status.Errorf(codes.InvalidArgument, "invalid product id: %d", req.ProductId)
	}

	// Validate rating entity
	allowed := false
	for _, t := range s.cfg.RatingEntities {
		if t == req.Entity {
			allowed = true
			break
		}
	}
	if !allowed {
		return nil, status.Errorf(codes.InvalidArgument, "invalid rating entity: %s. allowed entities: %v", req.Entity, s.cfg.RatingEntities)
	}

	if req.Rating < 1 || req.Rating > s.cfg.MaxRating {
		return nil, status.Errorf(codes.InvalidArgument, "invalid rating score: %.1f. rating must be between 1.0 and %.1f", req.Rating, s.cfg.MaxRating)
	}

	userID, err := auth.GetUserID(ctx)
	if err != nil {
		return nil, err
	}

	rating := &dao.Rating{
		UserID:    userID,
		ProductID: req.ProductId,
		Entity:    req.Entity,
		EntityID:  req.EntityId,
		Rating:    req.Rating,
		Comment:   req.Comment,
	}

	if err := s.repo.CreateRating(ctx, rating); err != nil {
		return nil, err
	}

	return &helpdesk_v1.CreateRatingResponse{
		Rating: rating.ToProto(),
	}, nil
}

func (s *Service) GetRating(ctx context.Context, req *helpdesk_v1.GetRatingRequest) (*helpdesk_v1.GetRatingResponse, error) {
	rating, err := s.repo.GetRating(ctx, req.Id)
	if err != nil {
		return nil, err
	}

	return &helpdesk_v1.GetRatingResponse{
		Rating: rating.ToProto(),
	}, nil
}

func (s *Service) ListRatings(ctx context.Context, req *helpdesk_v1.ListRatingsRequest) (*helpdesk_v1.ListRatingsResponse, error) {
	f := filter.FromProtoListRatingsRequest(req)
	ratings, err := s.repo.ListRatings(ctx, f)
	if err != nil {
		return nil, err
	}

	return &helpdesk_v1.ListRatingsResponse{
		Ratings: dao.ToProtoRatings(ratings),
	}, nil
}

func (s *Service) UpdateRating(ctx context.Context, req *helpdesk_v1.UpdateRatingRequest) (*helpdesk_v1.UpdateRatingResponse, error) {
	// Get existing rating first
	existing, err := s.repo.GetRating(ctx, req.Id)
	if err != nil {
		return nil, err
	}

	// Update fields
	existing.Rating = req.Rating
	existing.Comment = req.Comment

	if err := s.repo.UpdateRating(ctx, existing); err != nil {
		return nil, err
	}

	return &helpdesk_v1.UpdateRatingResponse{
		Rating: existing.ToProto(),
	}, nil
}

func (s *Service) DeleteRating(ctx context.Context, req *helpdesk_v1.DeleteRatingRequest) (*helpdesk_v1.DeleteRatingResponse, error) {
	if err := s.repo.DeleteRating(ctx, req.Id); err != nil {
		return nil, err
	}

	return &helpdesk_v1.DeleteRatingResponse{
		Success: true,
	}, nil
}

func (s *Service) GetRatingsConfig(ctx context.Context, req *helpdesk_v1.GetRatingsConfigRequest) (*helpdesk_v1.GetRatingsConfigResponse, error) {
	productIDs := make([]int32, len(s.cfg.AllowedProductIds))
	for i, id := range s.cfg.AllowedProductIds {
		productIDs[i] = int32(id)
	}
	return &helpdesk_v1.GetRatingsConfigResponse{
		Entities:   s.cfg.RatingEntities,
		MaxRating:  s.cfg.MaxRating,
		ProductIds: productIDs,
	}, nil
}

// ===== Rating Reply Handlers =====

func (s *Service) CreateRatingReply(ctx context.Context, req *helpdesk_v1.CreateRatingReplyRequest) (*helpdesk_v1.CreateRatingReplyResponse, error) {
	userID, err := auth.GetUserID(ctx)
	if err != nil {
		return nil, err
	}

	// Determine role based on permissions
	role := constants.RoleUser
	if auth.HasPermission(ctx, constants.PermissionManageRating) {
		role = constants.RoleAdmin
	}

	reply := &dao.RatingReply{
		RatingID: req.RatingId,
		UserID:   userID,
		Role:     role,
		Message:  req.Message,
	}

	if err := s.repo.CreateRatingReply(ctx, reply); err != nil {
		return nil, err
	}

	return &helpdesk_v1.CreateRatingReplyResponse{
		Reply: reply.ToProto(),
	}, nil
}

func (s *Service) ListRatingReplies(ctx context.Context, req *helpdesk_v1.ListRatingRepliesRequest) (*helpdesk_v1.ListRatingRepliesResponse, error) {
	f := filter.FromProtoListRatingRepliesRequest(req)
	replies, err := s.repo.ListRatingReplies(ctx, f)
	if err != nil {
		return nil, err
	}

	return &helpdesk_v1.ListRatingRepliesResponse{
		Replies: dao.ToProtoRatingReplies(replies),
	}, nil
}

func (s *Service) DeleteRatingReply(ctx context.Context, req *helpdesk_v1.DeleteRatingReplyRequest) (*helpdesk_v1.DeleteRatingReplyResponse, error) {
	if err := s.repo.DeleteRatingReply(ctx, req.Id); err != nil {
		return nil, err
	}

	return &helpdesk_v1.DeleteRatingReplyResponse{
		Success: true,
	}, nil
}

// ===== Issue Handlers =====

func (s *Service) CreateIssue(ctx context.Context, req *helpdesk_v1.CreateIssueRequest) (*helpdesk_v1.CreateIssueResponse, error) {
	// Validate product ID
	allowedProduct := false
	for _, id := range s.cfg.AllowedProductIds {
		if int32(id) == req.ProductId {
			allowedProduct = true
			break
		}
	}
	if !allowedProduct {
		return nil, status.Errorf(codes.InvalidArgument, "invalid product id: %d", req.ProductId)
	}

	if req.IssueType == "" {
		return nil, status.Errorf(codes.InvalidArgument, "issue_type is required")
	}

	// Validate issue type
	allowedType := false
	for _, t := range s.cfg.IssueTypes {
		if t == req.IssueType {
			allowedType = true
			break
		}
	}
	if !allowedType {
		return nil, status.Errorf(codes.InvalidArgument, "invalid issue type: %s. allowed types: %v", req.IssueType, s.cfg.IssueTypes)
	}

	// Validate issue entity
	allowedEntity := false
	for _, t := range s.cfg.IssueEntities {
		if t == req.Entity {
			allowedEntity = true
			break
		}
	}
	if !allowedEntity {
		return nil, status.Errorf(codes.InvalidArgument, "invalid issue entity: %s. allowed entities: %v", req.Entity, s.cfg.IssueEntities)
	}

	userID, err := auth.GetUserID(ctx)
	if err != nil {
		return nil, err
	}

	issue := &dao.Issue{
		UserID:      userID,
		ProductID:   req.ProductId,
		Entity:      req.Entity,
		EntityID:    req.EntityId,
		Title:       req.Title,
		Description: req.Description,
		IssueType:   req.IssueType,
	}

	if err := s.repo.CreateIssue(ctx, issue); err != nil {
		return nil, err
	}

	return &helpdesk_v1.CreateIssueResponse{
		Issue: issue.ToProto(),
	}, nil
}

func (s *Service) GetIssue(ctx context.Context, req *helpdesk_v1.GetIssueRequest) (*helpdesk_v1.GetIssueResponse, error) {
	issue, err := s.repo.GetIssue(ctx, req.Id)
	if err != nil {
		return nil, err
	}

	return &helpdesk_v1.GetIssueResponse{
		Issue: issue.ToProto(),
	}, nil
}

func (s *Service) ListIssues(ctx context.Context, req *helpdesk_v1.ListIssuesRequest) (*helpdesk_v1.ListIssuesResponse, error) {
	f := filter.FromProtoListIssuesRequest(req)
	issues, err := s.repo.ListIssues(ctx, f)
	if err != nil {
		return nil, err
	}

	return &helpdesk_v1.ListIssuesResponse{
		Issues: dao.ToProtoIssues(issues),
	}, nil
}

func (s *Service) UpdateIssue(ctx context.Context, req *helpdesk_v1.UpdateIssueRequest) (*helpdesk_v1.UpdateIssueResponse, error) {
	// Get existing issue first
	existing, err := s.repo.GetIssue(ctx, req.Id)
	if err != nil {
		return nil, err
	}

	// Update fields
	existing.Title = req.Title
	existing.Description = req.Description
	existing.Status = constants.IssueStatus(req.Status)

	if req.IssueType != "" {
		// Validate issue type
		allowedType := false
		for _, t := range s.cfg.IssueTypes {
			if t == req.IssueType {
				allowedType = true
				break
			}
		}
		if !allowedType {
			return nil, status.Errorf(codes.InvalidArgument, "invalid issue type: %s. allowed types: %v", req.IssueType, s.cfg.IssueTypes)
		}
		existing.IssueType = req.IssueType
	}

	if err := s.repo.UpdateIssue(ctx, existing); err != nil {
		return nil, err
	}

	return &helpdesk_v1.UpdateIssueResponse{
		Issue: existing.ToProto(),
	}, nil
}

func (s *Service) DeleteIssue(ctx context.Context, req *helpdesk_v1.DeleteIssueRequest) (*helpdesk_v1.DeleteIssueResponse, error) {
	if err := s.repo.DeleteIssue(ctx, req.Id); err != nil {
		return nil, err
	}

	return &helpdesk_v1.DeleteIssueResponse{
		Success: true,
	}, nil
}

func (s *Service) ListIssueConfig(ctx context.Context, req *helpdesk_v1.ListIssueConfigRequest) (*helpdesk_v1.ListIssueConfigResponse, error) {
	productIDs := make([]int32, len(s.cfg.AllowedProductIds))
	for i, id := range s.cfg.AllowedProductIds {
		productIDs[i] = int32(id)
	}
	return &helpdesk_v1.ListIssueConfigResponse{
		Entities:   s.cfg.IssueEntities,
		Types:      s.cfg.IssueTypes,
		ProductIds: productIDs,
	}, nil
}

func (s *Service) UpdateIssueStatus(ctx context.Context, req *helpdesk_v1.UpdateIssueStatusRequest) (*helpdesk_v1.UpdateIssueStatusResponse, error) {
	if err := auth.RequirePermission(ctx, constants.PermissionManageIssue); err != nil {
		return nil, err
	}

	issue, err := s.repo.GetIssue(ctx, req.Id)
	if err != nil {
		return nil, err
	}

	issue.Status = constants.IssueStatus(req.Status)

	if err := s.repo.UpdateIssue(ctx, issue); err != nil {
		return nil, err
	}

	return &helpdesk_v1.UpdateIssueStatusResponse{
		Issue: issue.ToProto(),
	}, nil
}

// ===== Admin Product Handlers =====

func (s *Service) GetProduct(ctx context.Context, req *helpdesk_v1.GetProductRequest) (*helpdesk_v1.GetProductResponse, error) {
	product, err := s.repo.GetProduct(ctx, req.Id)
	if err != nil {
		return nil, err
	}
	return &helpdesk_v1.GetProductResponse{
		Product: &helpdesk_v1.Product{
			Id:          product.ID,
			Name:        product.Name,
			Description: product.Description,
			IsActive:    product.IsActive,
			CreatedAt:   product.CreatedAt,
			UpdatedAt:   product.UpdatedAt,
		},
	}, nil
}

func (s *Service) ListProducts(ctx context.Context, req *helpdesk_v1.ListProductsRequest) (*helpdesk_v1.ListProductsResponse, error) {
	f := &filter.ProductFilter{
		Page:     int(req.Page),
		PageSize: int(req.PageSize),
	}
	products, err := s.repo.ListProducts(ctx, f)
	if err != nil {
		return nil, err
	}

	resp := &helpdesk_v1.ListProductsResponse{
		Products: make([]*helpdesk_v1.Product, 0, len(products)),
	}
	for _, p := range products {
		resp.Products = append(resp.Products, &helpdesk_v1.Product{
			Id:          p.ID,
			Name:        p.Name,
			Description: p.Description,
			IsActive:    p.IsActive,
			CreatedAt:   p.CreatedAt,
			UpdatedAt:   p.UpdatedAt,
		})
	}
	return resp, nil
}

func (s *Service) CreateProduct(ctx context.Context, req *helpdesk_v1.CreateProductRequest) (*helpdesk_v1.CreateProductResponse, error) {
	product := &dao.Product{
		ID:          req.Id,
		Name:        req.Name,
		Description: req.Description,
		IsActive:    req.IsActive,
	}
	if err := s.repo.CreateProduct(ctx, product); err != nil {
		return nil, err
	}
	return &helpdesk_v1.CreateProductResponse{
		Product: &helpdesk_v1.Product{
			Id:          product.ID,
			Name:        product.Name,
			Description: product.Description,
			IsActive:    product.IsActive,
			CreatedAt:   product.CreatedAt,
			UpdatedAt:   product.UpdatedAt,
		},
	}, nil
}

func (s *Service) UpdateProduct(ctx context.Context, req *helpdesk_v1.UpdateProductRequest) (*helpdesk_v1.UpdateProductResponse, error) {
	product, err := s.repo.GetProduct(ctx, req.Id)
	if err != nil {
		return nil, err
	}
	product.Name = req.Name
	product.Description = req.Description
	product.IsActive = req.IsActive

	if err := s.repo.UpdateProduct(ctx, product); err != nil {
		return nil, err
	}
	return &helpdesk_v1.UpdateProductResponse{
		Product: &helpdesk_v1.Product{
			Id:          product.ID,
			Name:        product.Name,
			Description: product.Description,
			IsActive:    product.IsActive,
			CreatedAt:   product.CreatedAt,
			UpdatedAt:   product.UpdatedAt,
		},
	}, nil
}

func (s *Service) DeleteProduct(ctx context.Context, req *helpdesk_v1.DeleteProductRequest) (*helpdesk_v1.DeleteProductResponse, error) {
	if err := s.repo.DeleteProduct(ctx, req.Id); err != nil {
		return nil, err
	}
	return &helpdesk_v1.DeleteProductResponse{Success: true}, nil
}

// ===== Admin Product Entity Handlers =====

func (s *Service) ListProductEntities(ctx context.Context, req *helpdesk_v1.ListProductEntitiesRequest) (*helpdesk_v1.ListProductEntitiesResponse, error) {
	f := &filter.ProductEntityFilter{
		ProductID:  req.ProductId,
		Page:       int(req.Page),
		PageSize:   int(req.PageSize),
	}
	entities, err := s.repo.ListProductEntities(ctx, f)
	if err != nil {
		return nil, err
	}

	resp := &helpdesk_v1.ListProductEntitiesResponse{
		Entities: make([]*helpdesk_v1.ProductEntity, 0, len(entities)),
	}
	for _, e := range entities {
		resp.Entities = append(resp.Entities, &helpdesk_v1.ProductEntity{
			Id:          e.ID,
			ProductId:   e.ProductID,
			EntityName:  e.EntityName,
			Description: e.Description,
			CreatedAt:   e.CreatedAt,
		})
	}
	return resp, nil
}

func (s *Service) CreateProductEntity(ctx context.Context, req *helpdesk_v1.CreateProductEntityRequest) (*helpdesk_v1.CreateProductEntityResponse, error) {
	entity := &dao.ProductEntity{
		ProductID:   req.ProductId,
		EntityName:  req.EntityName,
		Description: req.Description,
	}
	if err := s.repo.CreateProductEntity(ctx, entity); err != nil {
		return nil, err
	}
	return &helpdesk_v1.CreateProductEntityResponse{
		Entity: &helpdesk_v1.ProductEntity{
			Id:          entity.ID,
			ProductId:   entity.ProductID,
			EntityName:  entity.EntityName,
			Description: entity.Description,
			CreatedAt:   entity.CreatedAt,
		},
	}, nil
}

func (s *Service) DeleteProductEntity(ctx context.Context, req *helpdesk_v1.DeleteProductEntityRequest) (*helpdesk_v1.DeleteProductEntityResponse, error) {
	if err := s.repo.DeleteProductEntity(ctx, req.Id); err != nil {
		return nil, err
	}
	return &helpdesk_v1.DeleteProductEntityResponse{Success: true}, nil
}

// ===== Admin Product Issue Type Handlers =====

func (s *Service) ListProductIssueTypes(ctx context.Context, req *helpdesk_v1.ListProductIssueTypesRequest) (*helpdesk_v1.ListProductIssueTypesResponse, error) {
	f := &filter.ProductIssueTypeFilter{
		ProductID:  req.ProductId,
		Page:       int(req.Page),
		PageSize:   int(req.PageSize),
	}
	issueTypes, err := s.repo.ListProductIssueTypes(ctx, f)
	if err != nil {
		return nil, err
	}

	resp := &helpdesk_v1.ListProductIssueTypesResponse{
		IssueTypes: make([]*helpdesk_v1.ProductIssueType, 0, len(issueTypes)),
	}
	for _, it := range issueTypes {
		resp.IssueTypes = append(resp.IssueTypes, &helpdesk_v1.ProductIssueType{
			Id:          it.ID,
			ProductId:   it.ProductID,
			TypeName:    it.TypeName,
			Description: it.Description,
			CreatedAt:   it.CreatedAt,
		})
	}
	return resp, nil
}

func (s *Service) CreateProductIssueType(ctx context.Context, req *helpdesk_v1.CreateProductIssueTypeRequest) (*helpdesk_v1.CreateProductIssueTypeResponse, error) {
	issueType := &dao.ProductIssueType{
		ProductID:   req.ProductId,
		TypeName:    req.TypeName,
		Description: req.Description,
	}
	if err := s.repo.CreateProductIssueType(ctx, issueType); err != nil {
		return nil, err
	}
	return &helpdesk_v1.CreateProductIssueTypeResponse{
		IssueType: &helpdesk_v1.ProductIssueType{
			Id:          issueType.ID,
			ProductId:   issueType.ProductID,
			TypeName:    issueType.TypeName,
			Description: issueType.Description,
			CreatedAt:   issueType.CreatedAt,
		},
	}, nil
}

func (s *Service) DeleteProductIssueType(ctx context.Context, req *helpdesk_v1.DeleteProductIssueTypeRequest) (*helpdesk_v1.DeleteProductIssueTypeResponse, error) {
	if err := s.repo.DeleteProductIssueType(ctx, req.Id); err != nil {
		return nil, err
	}
	return &helpdesk_v1.DeleteProductIssueTypeResponse{Success: true}, nil
}

// ===== Issue Reply Handlers =====

func (s *Service) CreateIssueReply(ctx context.Context, req *helpdesk_v1.CreateIssueReplyRequest) (*helpdesk_v1.CreateIssueReplyResponse, error) {
	userID, err := auth.GetUserID(ctx)
	if err != nil {
		return nil, err
	}

	// Get the issue to check permissions
	issue, err := s.repo.GetIssue(ctx, req.IssueId)
	if err != nil {
		return nil, err
	}

	// Check if user can manage this issue
	canManage, err := auth.CanManageIssue(ctx, issue.UserID)
	if err != nil {
		return nil, err
	}
	if !canManage {
		return nil, auth.ErrCannotManageIssue
	}

	// Determine role based on permissions
	role := constants.RoleUser
	if auth.HasPermission(ctx, constants.PermissionManageIssue) {
		role = constants.RoleAdmin
	}

	reply := &dao.IssueReply{
		IssueID: req.IssueId,
		UserID:  userID,
		Role:    role,
		Message: req.Message,
	}

	if err := s.repo.CreateIssueReply(ctx, reply); err != nil {
		return nil, err
	}

	return &helpdesk_v1.CreateIssueReplyResponse{
		Reply: reply.ToProto(),
	}, nil
}

func (s *Service) ListIssueReplies(ctx context.Context, req *helpdesk_v1.ListIssueRepliesRequest) (*helpdesk_v1.ListIssueRepliesResponse, error) {
	f := filter.FromProtoListIssueRepliesRequest(req)
	replies, err := s.repo.ListIssueReplies(ctx, f)
	if err != nil {
		return nil, err
	}

	return &helpdesk_v1.ListIssueRepliesResponse{
		Replies: dao.ToProtoIssueReplies(replies),
	}, nil
}

func (s *Service) DeleteIssueReply(ctx context.Context, req *helpdesk_v1.DeleteIssueReplyRequest) (*helpdesk_v1.DeleteIssueReplyResponse, error) {
	if err := s.repo.DeleteIssueReply(ctx, req.Id); err != nil {
		return nil, err
	}

	return &helpdesk_v1.DeleteIssueReplyResponse{
		Success: true,
	}, nil
}
