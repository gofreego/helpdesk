package postgres

import (
	"context"

	"github.com/gofreego/helpdesk/internal/models/dao"
	"github.com/gofreego/helpdesk/internal/models/filter"
)

func (r *PostgresRepository) ListProductIssueTypes(ctx context.Context, f *filter.ProductIssueTypeFilter) ([]*dao.ProductIssueType, error) {
	f.WithDefaults()

	query := "SELECT id, product_id, type_name, description, created_at FROM product_issue_types WHERE 1=1"

	if f.ProductID > 0 {
		query += " AND product_id = $1"
	}

	query += " ORDER BY created_at DESC LIMIT $2 OFFSET $3"

	rows, err := r.db.QueryContext(ctx, query, f.ProductID, f.PageSize, f.Offset())
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	issueTypes := make([]*dao.ProductIssueType, 0)
	for rows.Next() {
		issueType := &dao.ProductIssueType{}
		if err := issueType.Scan(rows); err != nil {
			return nil, err
		}
		issueTypes = append(issueTypes, issueType)
	}

	return issueTypes, rows.Err()
}

func (r *PostgresRepository) CreateProductIssueType(ctx context.Context, issueType *dao.ProductIssueType) error {
	_, err := r.db.ExecContext(ctx,
		"INSERT INTO product_issue_types (product_id, type_name, description) VALUES ($1, $2, $3)",
		issueType.ProductID, issueType.TypeName, issueType.Description,
	)
	return err
}

func (r *PostgresRepository) DeleteProductIssueType(ctx context.Context, id int64) error {
	_, err := r.db.ExecContext(ctx, "DELETE FROM product_issue_types WHERE id = $1", id)
	return err
}
