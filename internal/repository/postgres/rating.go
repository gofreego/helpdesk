package postgres

import (
	"context"
	"database/sql"
	"time"

	"github.com/gofreego/goutils/logger"
	"github.com/gofreego/helpdesk/internal/models/dao"
	"github.com/gofreego/helpdesk/internal/models/filter"
	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (r *PostgresRepository) CreateRating(ctx context.Context, rating *dao.Rating) error {
	if rating.ID == "" {
		rating.ID = uuid.New().String()
	}
	now := time.Now().UnixMilli()
	rating.CreatedAt = now
	rating.UpdatedAt = now

	query := `
		INSERT INTO ratings (id, user_id, type, entity_id, rating, comment, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`

	_, err := r.db.ExecContext(ctx, query,
		rating.ID, rating.UserID, rating.Type, rating.EntityID,
		rating.Rating, rating.Comment, rating.CreatedAt, rating.UpdatedAt)

	if err != nil {
		logger.Error(ctx, "failed to create rating: %v", err)
		return status.Errorf(codes.Internal, "failed to create rating: %v", err)
	}

	return nil
}

func (r *PostgresRepository) GetRating(ctx context.Context, id string) (*dao.Rating, error) {
	query := `
		SELECT id, user_id, type, entity_id, rating, comment, created_at, updated_at
		FROM ratings
		WHERE id::text = $1`

	row := r.db.QueryRowContext(ctx, query, id)

	if err := row.Err(); err == sql.ErrNoRows {
		return nil, status.Errorf(codes.NotFound, "rating not found")
	}

	rating := new(dao.Rating)
	if err := rating.Scan(row); err != nil {
		if err == sql.ErrNoRows {
			return nil, status.Errorf(codes.NotFound, "rating not found")
		}
		logger.Error(ctx, "failed to get rating: %v", err)
		return nil, status.Errorf(codes.Internal, "failed to get rating: %v", err)
	}

	return rating, nil
}

func (r *PostgresRepository) ListRatings(ctx context.Context, f *filter.RatingFilter) ([]*dao.Rating, error) {
	f.WithDefaults()

	query := `
		SELECT id, user_id, type, entity_id, rating, comment, created_at, updated_at
		FROM ratings
		WHERE ($1::text = '' OR id::text = $1)
		  AND ($2::bigint = 0 OR user_id = $2)
		  AND ($3::text = '' OR type = $3)
		  AND ($4::text = '' OR entity_id = $4)
		ORDER BY created_at DESC
		LIMIT $5 OFFSET $6`

	rows, err := r.db.QueryContext(ctx, query,
		f.ID, f.UserID, f.Type, f.EntityID, f.PageSize, f.Offset())

	if err != nil {
		logger.Error(ctx, "failed to list ratings: %v", err)
		return nil, status.Errorf(codes.Internal, "failed to list ratings: %v", err)
	}
	defer rows.Close()

	var ratings []*dao.Rating
	for rows.Next() {
		rating := new(dao.Rating)
		if err := rating.Scan(rows); err != nil {
			logger.Error(ctx, "failed to scan rating: %v", err)
			return nil, status.Errorf(codes.Internal, "failed to scan rating: %v", err)
		}
		ratings = append(ratings, rating)
	}

	return ratings, rows.Err()
}

func (r *PostgresRepository) UpdateRating(ctx context.Context, rating *dao.Rating) error {
	rating.UpdatedAt = time.Now().UnixMilli()

	query := `
		UPDATE ratings
		SET rating = $1, comment = $2, updated_at = $3
		WHERE id = $4`

	res, err := r.db.ExecContext(ctx, query,
		rating.Rating, rating.Comment, rating.UpdatedAt, rating.ID)

	if err != nil {
		logger.Error(ctx, "failed to update rating: %v", err)
		return status.Errorf(codes.Internal, "failed to update rating: %v", err)
	}

	n, _ := res.RowsAffected()
	if n == 0 {
		return status.Errorf(codes.NotFound, "rating not found")
	}

	return nil
}

func (r *PostgresRepository) DeleteRating(ctx context.Context, id string) error {
	query := `DELETE FROM ratings WHERE id::text = $1`

	res, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		logger.Error(ctx, "failed to delete rating: %v", err)
		return status.Errorf(codes.Internal, "failed to delete rating: %v", err)
	}

	n, _ := res.RowsAffected()
	if n == 0 {
		return status.Errorf(codes.NotFound, "rating not found")
	}

	return nil
}
