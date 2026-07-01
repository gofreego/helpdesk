package postgres

import (
	"context"
	"strconv"

	"github.com/gofreego/goutils/logger"
	"github.com/gofreego/helpdesk/internal/models/dao"
	"github.com/gofreego/helpdesk/internal/models/filter"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (r *PostgresRepository) ListProductIssueTypes(ctx context.Context, f *filter.ProductIssueTypeFilter) ([]*dao.ProductIssueType, error) {
	f.WithDefaults()

	query := "SELECT id, product_id, type_name, description, created_at FROM product_issue_types WHERE 1=1"
	args := []any{}

	if f.ProductID > 0 {
		args = append(args, f.ProductID)
		query += " AND product_id = $" + strconv.Itoa(len(args))
	}
	if f.TypeName != "" {
		args = append(args, f.TypeName)
		query += " AND type_name = $" + strconv.Itoa(len(args))
	}

	args = append(args, f.PageSize)
	query += " ORDER BY created_at DESC LIMIT $" + strconv.Itoa(len(args))
	args = append(args, f.Offset())
	query += " OFFSET $" + strconv.Itoa(len(args))

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		logger.Error(ctx, "failed to list product issue types: %v", err)
		return nil, status.Errorf(codes.Internal, "failed to list product issue types: %v", err)
	}
	defer rows.Close()

	issueTypes := make([]*dao.ProductIssueType, 0)
	for rows.Next() {
		issueType := &dao.ProductIssueType{}
		if err := issueType.Scan(rows); err != nil {
			logger.Error(ctx, "failed to scan product issue type: %v", err)
			return nil, status.Errorf(codes.Internal, "failed to scan product issue type: %v", err)
		}
		issueTypes = append(issueTypes, issueType)
	}
	if err := rows.Err(); err != nil {
		logger.Error(ctx, "failed to list product issue types: %v", err)
		return nil, status.Errorf(codes.Internal, "failed to list product issue types: %v", err)
	}

	return issueTypes, nil
}

func (r *PostgresRepository) CreateProductIssueType(ctx context.Context, issueType *dao.ProductIssueType) error {
	_, err := r.db.ExecContext(ctx,
		"INSERT INTO product_issue_types (product_id, type_name, description) VALUES ($1, $2, $3)",
		issueType.ProductID, issueType.TypeName, issueType.Description,
	)
	if err != nil {
		logger.Error(ctx, "failed to create product issue type: %v", err)
		return status.Errorf(codes.Internal, "failed to create product issue type: %v", err)
	}
	return nil
}

func (r *PostgresRepository) DeleteProductIssueType(ctx context.Context, id int64) error {
	result, err := r.db.ExecContext(ctx, "DELETE FROM product_issue_types WHERE id = $1", id)
	if err != nil {
		logger.Error(ctx, "failed to delete product issue type: %v", err)
		return status.Errorf(codes.Internal, "failed to delete product issue type: %v", err)
	}
	rows, err := result.RowsAffected()
	if err != nil {
		logger.Error(ctx, "failed to delete product issue type: %v", err)
		return status.Errorf(codes.Internal, "failed to delete product issue type: %v", err)
	}
	if rows == 0 {
		return status.Errorf(codes.NotFound, "product issue type not found")
	}
	return nil
}
