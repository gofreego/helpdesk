package postgres

import (
	"context"
	"database/sql"
	"strconv"

	"github.com/gofreego/goutils/logger"
	"github.com/gofreego/helpdesk/internal/models/dao"
	"github.com/gofreego/helpdesk/internal/models/filter"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (r *PostgresRepository) GetProduct(ctx context.Context, id int64) (*dao.Product, error) {
	row := r.db.QueryRowContext(ctx,
		"SELECT id, name, description, is_active, created_at, updated_at FROM products WHERE id = $1",
		id,
	)
	product := &dao.Product{}
	err := product.Scan(row)
	if err == sql.ErrNoRows {
		return nil, status.Errorf(codes.NotFound, "product not found")
	}
	if err != nil {
		logger.Error(ctx, "failed to get product: %v", err)
		return nil, status.Errorf(codes.Internal, "failed to get product: %v", err)
	}
	return product, nil
}

func (r *PostgresRepository) ListProducts(ctx context.Context, f *filter.ProductFilter) ([]*dao.Product, error) {
	f.WithDefaults()

	query := "SELECT id, name, description, is_active, created_at, updated_at FROM products WHERE 1=1"
	args := []any{}

	if f.ID > 0 {
		args = append(args, f.ID)
		query += " AND id = $" + strconv.Itoa(len(args))
	}
	if f.Name != "" {
		args = append(args, "%"+f.Name+"%")
		query += " AND name ILIKE $" + strconv.Itoa(len(args))
	}

	args = append(args, f.PageSize)
	query += " ORDER BY created_at DESC LIMIT $" + strconv.Itoa(len(args))
	args = append(args, f.Offset())
	query += " OFFSET $" + strconv.Itoa(len(args))

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		logger.Error(ctx, "failed to list products: %v", err)
		return nil, status.Errorf(codes.Internal, "failed to list products: %v", err)
	}
	defer rows.Close()

	products := make([]*dao.Product, 0)
	for rows.Next() {
		product := &dao.Product{}
		if err := product.Scan(rows); err != nil {
			logger.Error(ctx, "failed to scan product: %v", err)
			return nil, status.Errorf(codes.Internal, "failed to scan product: %v", err)
		}
		products = append(products, product)
	}
	if err := rows.Err(); err != nil {
		logger.Error(ctx, "failed to list products: %v", err)
		return nil, status.Errorf(codes.Internal, "failed to list products: %v", err)
	}

	return products, nil
}

func (r *PostgresRepository) CreateProduct(ctx context.Context, product *dao.Product) error {
	_, err := r.db.ExecContext(ctx,
		"INSERT INTO products (id, name, description, is_active) VALUES ($1, $2, $3, $4)",
		product.ID, product.Name, product.Description, product.IsActive,
	)
	if err != nil {
		logger.Error(ctx, "failed to create product: %v", err)
		return status.Errorf(codes.Internal, "failed to create product: %v", err)
	}
	return nil
}

func (r *PostgresRepository) UpdateProduct(ctx context.Context, product *dao.Product) error {
	result, err := r.db.ExecContext(ctx,
		"UPDATE products SET name = $1, description = $2, is_active = $3, updated_at = (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT WHERE id = $4",
		product.Name, product.Description, product.IsActive, product.ID,
	)
	if err != nil {
		logger.Error(ctx, "failed to update product: %v", err)
		return status.Errorf(codes.Internal, "failed to update product: %v", err)
	}
	rows, err := result.RowsAffected()
	if err != nil {
		logger.Error(ctx, "failed to update product: %v", err)
		return status.Errorf(codes.Internal, "failed to update product: %v", err)
	}
	if rows == 0 {
		return status.Errorf(codes.NotFound, "product not found")
	}
	return nil
}

func (r *PostgresRepository) DeleteProduct(ctx context.Context, id int64) error {
	result, err := r.db.ExecContext(ctx, "DELETE FROM products WHERE id = $1", id)
	if err != nil {
		logger.Error(ctx, "failed to delete product: %v", err)
		return status.Errorf(codes.Internal, "failed to delete product: %v", err)
	}
	rows, err := result.RowsAffected()
	if err != nil {
		logger.Error(ctx, "failed to delete product: %v", err)
		return status.Errorf(codes.Internal, "failed to delete product: %v", err)
	}
	if rows == 0 {
		return status.Errorf(codes.NotFound, "product not found")
	}
	return nil
}
