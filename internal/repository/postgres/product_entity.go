package postgres

import (
	"context"

	"github.com/gofreego/helpdesk/internal/models/dao"
	"github.com/gofreego/helpdesk/internal/models/filter"
)

func (r *PostgresRepository) ListProductEntities(ctx context.Context, f *filter.ProductEntityFilter) ([]*dao.ProductEntity, error) {
	f.WithDefaults()

	query := "SELECT id, product_id, entity_name, description, created_at FROM product_entities WHERE 1=1"

	if f.ProductID > 0 {
		query += " AND product_id = $1"
	}

	query += " ORDER BY created_at DESC LIMIT $2 OFFSET $3"

	rows, err := r.db.QueryContext(ctx, query, f.ProductID, f.PageSize, f.Offset())
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	entities := make([]*dao.ProductEntity, 0)
	for rows.Next() {
		entity := &dao.ProductEntity{}
		if err := entity.Scan(rows); err != nil {
			return nil, err
		}
		entities = append(entities, entity)
	}

	return entities, rows.Err()
}

func (r *PostgresRepository) CreateProductEntity(ctx context.Context, entity *dao.ProductEntity) error {
	_, err := r.db.ExecContext(ctx,
		"INSERT INTO product_entities (product_id, entity_name, description) VALUES ($1, $2, $3)",
		entity.ProductID, entity.EntityName, entity.Description,
	)
	return err
}

func (r *PostgresRepository) DeleteProductEntity(ctx context.Context, id int64) error {
	_, err := r.db.ExecContext(ctx, "DELETE FROM product_entities WHERE id = $1", id)
	return err
}
