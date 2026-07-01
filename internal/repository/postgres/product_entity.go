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

func (r *PostgresRepository) ListProductEntities(ctx context.Context, f *filter.ProductEntityFilter) ([]*dao.ProductEntity, error) {
	f.WithDefaults()

	query := "SELECT id, product_id, entity_name, description, created_at FROM product_entities WHERE 1=1"
	args := []any{}

	if f.ProductID > 0 {
		args = append(args, f.ProductID)
		query += " AND product_id = $" + strconv.Itoa(len(args))
	}
	if f.EntityName != "" {
		args = append(args, f.EntityName)
		query += " AND entity_name = $" + strconv.Itoa(len(args))
	}

	args = append(args, f.PageSize)
	query += " ORDER BY created_at DESC LIMIT $" + strconv.Itoa(len(args))
	args = append(args, f.Offset())
	query += " OFFSET $" + strconv.Itoa(len(args))

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		logger.Error(ctx, "failed to list product entities: %v", err)
		return nil, status.Errorf(codes.Internal, "failed to list product entities: %v", err)
	}
	defer rows.Close()

	entities := make([]*dao.ProductEntity, 0)
	for rows.Next() {
		entity := &dao.ProductEntity{}
		if err := entity.Scan(rows); err != nil {
			logger.Error(ctx, "failed to scan product entity: %v", err)
			return nil, status.Errorf(codes.Internal, "failed to scan product entity: %v", err)
		}
		entities = append(entities, entity)
	}
	if err := rows.Err(); err != nil {
		logger.Error(ctx, "failed to list product entities: %v", err)
		return nil, status.Errorf(codes.Internal, "failed to list product entities: %v", err)
	}

	return entities, nil
}

func (r *PostgresRepository) CreateProductEntity(ctx context.Context, entity *dao.ProductEntity) error {
	_, err := r.db.ExecContext(ctx,
		"INSERT INTO product_entities (product_id, entity_name, description) VALUES ($1, $2, $3)",
		entity.ProductID, entity.EntityName, entity.Description,
	)
	if err != nil {
		logger.Error(ctx, "failed to create product entity: %v", err)
		return status.Errorf(codes.Internal, "failed to create product entity: %v", err)
	}
	return nil
}

func (r *PostgresRepository) DeleteProductEntity(ctx context.Context, id int64) error {
	result, err := r.db.ExecContext(ctx, "DELETE FROM product_entities WHERE id = $1", id)
	if err != nil {
		logger.Error(ctx, "failed to delete product entity: %v", err)
		return status.Errorf(codes.Internal, "failed to delete product entity: %v", err)
	}
	rows, err := result.RowsAffected()
	if err != nil {
		logger.Error(ctx, "failed to delete product entity: %v", err)
		return status.Errorf(codes.Internal, "failed to delete product entity: %v", err)
	}
	if rows == 0 {
		return status.Errorf(codes.NotFound, "product entity not found")
	}
	return nil
}
