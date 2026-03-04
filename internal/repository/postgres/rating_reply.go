package postgres

import (
	"context"
	"time"

	"github.com/gofreego/goutils/logger"
	"github.com/gofreego/helpdesk/internal/models/dao"
	"github.com/gofreego/helpdesk/internal/models/filter"
	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (r *PostgresRepository) CreateRatingReply(ctx context.Context, reply *dao.RatingReply) error {
	if reply.ID == "" {
		reply.ID = uuid.New().String()
	}
	reply.CreatedAt = time.Now().UnixMilli()

	query := `
		INSERT INTO rating_replies (id, rating_id, user_id, role, message, is_deleted, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)`

	_, err := r.db.ExecContext(ctx, query,
		reply.ID, reply.RatingID, reply.UserID, reply.Role,
		reply.Message, reply.IsDeleted, reply.CreatedAt,
	)
	if err != nil {
		logger.Error(ctx, "failed to create rating reply: %v", err)
		return status.Errorf(codes.Internal, "failed to create rating reply: %v", err)
	}
	return nil
}

func (r *PostgresRepository) ListRatingReplies(ctx context.Context, f *filter.RatingReplyFilter) ([]*dao.RatingReply, error) {
	f.WithDefaults()

	query := `
		SELECT id, rating_id, user_id, role, message, is_deleted, created_at
		FROM rating_replies
		WHERE rating_id::text = $1
		  AND is_deleted = FALSE
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3`

	rows, err := r.db.QueryContext(ctx, query, f.RatingID, f.PageSize, f.Offset())
	if err != nil {
		logger.Error(ctx, "failed to list rating replies: %v", err)
		return nil, status.Errorf(codes.Internal, "failed to list rating replies: %v", err)
	}
	defer rows.Close()

	var replies []*dao.RatingReply
	for rows.Next() {
		reply := &dao.RatingReply{}
		if err := reply.Scan(rows); err != nil {
			logger.Error(ctx, "failed to scan rating reply: %v", err)
			return nil, status.Errorf(codes.Internal, "failed to scan rating reply: %v", err)
		}
		replies = append(replies, reply)
	}
	return replies, rows.Err()
}

// DeleteRatingReply performs a soft delete by setting is_deleted = TRUE.
func (r *PostgresRepository) DeleteRatingReply(ctx context.Context, id string) error {
	query := `UPDATE rating_replies SET is_deleted = TRUE WHERE id::text = $1`
	res, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		logger.Error(ctx, "failed to delete rating reply: %v", err)
		return status.Errorf(codes.Internal, "failed to delete rating reply: %v", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return status.Errorf(codes.NotFound, "rating reply not found")
	}
	return nil
}
