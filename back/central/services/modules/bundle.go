package modules

import (
	"github.com/gin-gonic/gin"
	"github.com/secamc93/lerida-comercio/back/central/services/modules/torneo"
	"github.com/secamc93/lerida-comercio/back/central/shared/db"
	"github.com/secamc93/lerida-comercio/back/central/shared/log"
)

// New inicializa los módulos de negocio del sistema.
func New(router *gin.RouterGroup, database db.IDatabase, logger log.ILogger) {
	// Módulo de torneo de fútbol 8.
	torneo.New(router, database, logger)
}
