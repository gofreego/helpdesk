package postgres

import (
	"context"

	"github.com/gofreego/helpdesk/internal/models/dao"
	"github.com/gofreego/helpdesk/internal/models/filter"
)

func (r *PostgresRepository) GetProduct(ctx context.Context, id int64) (*dao.Product, error) {
	row := r.db.QueryRowContext(ctx,
		"SELECT id, name, description, is_active, created_at, updated_at FROM products WHERE id = $1",
		id,
	)
	product := &dao.Product{}
	if err := product.Scan(row); err != nil {
		return nil, err
	}
	return product, nil
}

func (r *PostgresRepository) ListProducts(ctx context.Context, f *filter.ProductFilter) ([]*dao.Product, error) {
	f.WithDefaults()

	query := "SELECT id, name, description, is_active, created_at, updated_at FROM products WHERE is_active = true"
	args := []any{}

	if f.ID > 0 {
		args = append(args, f.ID)
		query += " AND id = $" + string(rune(len(args)))
	}
	if f.Name != "" {
		args = append(args, "%"+f.Name+"%")
		query += " AND name ILIKE $" + string(rune(len(args)))
	}

	args = append(args, f.PageSize)
	query += " ORDER BY created_at DESC LIMIT $" + string(rune(len(args)))
	args = append(args, f.Offset())
	query += " OFFSET $" + string(rune(len(args)))

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	products := make([]*dao.Product, 0)
	for rows.Next() {
		product := &dao.Product{}
		if err := product.Scan(rows); err != nil {
			return nil, err
		}
		products = append(products, product)
	}

	return products, rows.Err()
}

func (r *PostgresRepository) CreateProduct(ctx context.Context, product *dao.Product) error {
	_, err := r.db.ExecContext(ctx,
		"INSERT INTO products (id, name, description, is_active) VALUES ($1, $2, $3, $4)",
		product.ID, product.Name, product.Description, product.IsActive,
	)
	return err
}

func (r *PostgresRepository) UpdateProduct(ctx context.Context, product *dao.Product) error {
	_, err := r.db.ExecContext(ctx,
		"UPDATE products SET name = $1, description = $2, is_active = $3, updated_at = (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT WHERE id = $4",
		product.Name, product.Description, product.IsActive, product.ID,
	)
	return err
}

func (r *PostgresRepository) DeleteProduct(ctx context.Context, id int64) error {
	_, err := r.db.ExecContext(ctx, "DELETE FROM products WHERE id = $1", id)
	return err
}
