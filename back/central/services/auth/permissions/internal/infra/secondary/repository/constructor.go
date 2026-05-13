package repository

import (
	"github.com/secamc93/lerida-comercio/back/central/services/auth/permissions/internal/domain"
	"github.com/secamc93/lerida-comercio/back/central/shared/db"
	"github.com/secamc93/lerida-comercio/back/central/shared/log"
)

type Repository struct {
	database db.IDatabase
	logger   log.ILogger
}

func New(db db.IDatabase, logger log.ILogger) domain.IPermissionRepository {
	return &Repository{
		database: db,
		logger:   logger,
	}
}
