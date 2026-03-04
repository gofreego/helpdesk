package postgres

import (
	"context"
	"database/sql"
	"time"

	"github.com/gofreego/goutils/logger"
	"github.com/gofreego/helpdesk/internal/constants"
	"github.com/gofreego/helpdesk/internal/models/dao"
	"github.com/gofreego/helpdesk/internal/models/filter"
	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (r *PostgresRepository) CreateIssue(ctx context.Context, issue *dao.Issue) error {
	if issue.ID == "" {
		issue.ID = uuid.New().String()
	}
	now := time.Now().UnixMilli()
	issue.CreatedAt = now
	issue.UpdatedAt = now
	if issue.Status == 0 {
		issue.Status = constants.Open
	}

	query := `
		INSERT INTO issues (id, user_id, product_id, entity, entity_id, title, description, status, created_at, updated_at, issue_type)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`

	_, err := r.db.ExecContext(ctx, query,
		issue.ID, issue.UserID, issue.ProductID, issue.Entity, issue.EntityID,
		issue.Title, issue.Description, issue.Status,
		issue.CreatedAt, issue.UpdatedAt, issue.IssueType,
	)
	if err != nil {
		logger.Error(ctx, "failed to create issue: %v", err)
		return status.Errorf(codes.Internal, "failed to create issue: %v", err)
	}
	return nil
}

func (r *PostgresRepository) GetIssue(ctx context.Context, id string) (*dao.Issue, error) {
	query := `
		SELECT id, user_id, product_id, entity, entity_id, title, description, status, created_at, updated_at, issue_type
		FROM issues
		WHERE id::text = $1`

	row := r.db.QueryRowContext(ctx, query, id)
	issue := &dao.Issue{}
	err := issue.Scan(row)
	if err == sql.ErrNoRows {
		return nil, status.Errorf(codes.NotFound, "issue not found")
	}
	if err != nil {
		logger.Error(ctx, "failed to get issue: %v", err)
		return nil, status.Errorf(codes.Internal, "failed to get issue: %v", err)
	}
	return issue, nil
}

func (r *PostgresRepository) ListIssues(ctx context.Context, f *filter.IssueFilter) ([]*dao.Issue, error) {
	f.WithDefaults()

	query := `
		SELECT id, user_id, product_id, entity, entity_id, title, description, status, created_at, updated_at, issue_type
		FROM issues
		WHERE ($1::text = '' OR id::text = $1)
		  AND ($2::bigint = 0 OR user_id = $2)
		  AND ($3::text = '' OR entity = $3)
		  AND ($4::text = '' OR entity_id = $4)
		  AND ($5 = 0 OR status = $5)
		  AND ($8::text = '' OR issue_type = $8)
		ORDER BY created_at DESC
		LIMIT $6 OFFSET $7`

	rows, err := r.db.QueryContext(ctx, query,
		f.ID, f.UserID, f.Entity, f.EntityID, f.Status, f.PageSize, f.Offset(), f.IssueType)
	if err != nil {
		logger.Error(ctx, "failed to list issues: %v", err)
		return nil, status.Errorf(codes.Internal, "failed to list issues: %v", err)
	}
	defer rows.Close()

	var issues []*dao.Issue
	for rows.Next() {
		issue := &dao.Issue{}
		if err := issue.Scan(rows); err != nil {
			logger.Error(ctx, "failed to scan issue: %v", err)
			return nil, status.Errorf(codes.Internal, "failed to scan issue: %v", err)
		}
		issues = append(issues, issue)
	}
	return issues, rows.Err()
}

func (r *PostgresRepository) UpdateIssue(ctx context.Context, issue *dao.Issue) error {
	issue.UpdatedAt = time.Now().UnixMilli()

	query := `
		UPDATE issues
		SET title = $1, description = $2, status = $3, updated_at = $4, issue_type = $5
		WHERE id = $6`

	res, err := r.db.ExecContext(ctx, query,
		issue.Title, issue.Description, issue.Status, issue.UpdatedAt, issue.IssueType, issue.ID)
	if err != nil {
		logger.Error(ctx, "failed to update issue: %v", err)
		return status.Errorf(codes.Internal, "failed to update issue: %v", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return status.Errorf(codes.NotFound, "issue not found")
	}
	return nil
}

func (r *PostgresRepository) DeleteIssue(ctx context.Context, id string) error {
	query := `DELETE FROM issues WHERE id::text = $1`
	res, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		logger.Error(ctx, "failed to delete issue: %v", err)
		return status.Errorf(codes.Internal, "failed to delete issue: %v", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return status.Errorf(codes.NotFound, "issue not found")
	}
	return nil
}
