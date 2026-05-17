package repository

import (
	"github.com/secamc93/lerida-comercio/back/central/services/modules/torneo/internal/domain"
	"github.com/secamc93/lerida-comercio/back/central/shared/db"
	"github.com/secamc93/lerida-comercio/back/central/shared/log"
)

// Repository implementa el puerto de persistencia del módulo de torneo.
type Repository struct {
	database db.IDatabase
	logger   log.ILogger
}

// New crea una nueva instancia del repositorio de torneo.
func New(database db.IDatabase, logger log.ILogger) domain.ITorneoRepository {
	return &Repository{
		database: database,
		logger:   logger,
	}
}
