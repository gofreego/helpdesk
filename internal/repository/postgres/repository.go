package postgres

import (
	"context"
	"database/sql"

	"github.com/gofreego/goutils/databases/connections/pgsql"
	"github.com/gofreego/goutils/logger"
)

type Config struct {
	pgsql.Config `yaml:",inline"`
}

type PostgresRepository struct {
	db *sql.DB
}

func NewRepository(ctx context.Context, cfg *Config) (*PostgresRepository, error) {
	db, err := pgsql.GetConnection(&cfg.Config)
	if err != nil {
		return nil, err
	}
	logger.Info(ctx, "PostgresRepository: connected to PostgreSQL")
	return &PostgresRepository{db: db}, nil
}

func (r *PostgresRepository) Ping(ctx context.Context) error {
	return r.db.PingContext(ctx)
}
