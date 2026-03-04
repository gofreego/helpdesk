package repository

import (
	"context"
	"sync"

	"github.com/gofreego/helpdesk/internal/repository/memory"
	"github.com/gofreego/helpdesk/internal/repository/postgres"
	"github.com/gofreego/helpdesk/internal/service"
)

const (
	repoMemory   = "memory"
	repoPostgres = "postgres"
)

type Config struct {
	Name     string          `yaml:"Name"`
	Memory   memory.Config   `yaml:"Memory"`
	Postgres postgres.Config `yaml:"Postgres"`
}

var (
	instance service.Repository
	once     sync.Once
	mu       sync.RWMutex
)

// GetInstance returns the singleton instance of the repository
func GetInstance(ctx context.Context, cfg *Config) service.Repository {
	mu.RLock()
	if instance != nil {
		defer mu.RUnlock()
		return instance
	}
	mu.RUnlock()

	once.Do(func() {
		mu.Lock()
		defer mu.Unlock()
		if instance == nil {
			var err error
			switch cfg.Name {
			case repoPostgres:
				instance, err = postgres.NewRepository(ctx, &cfg.Postgres)
			default:
				instance, err = memory.NewRepository(ctx, &cfg.Memory)
			}
			if err != nil {
				panic("failed to create repository: " + err.Error())
			}
		}
	})

	return instance
}
