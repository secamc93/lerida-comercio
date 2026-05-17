package torneo

import (
	"github.com/gin-gonic/gin"
	"github.com/secamc93/lerida-comercio/back/central/services/modules/torneo/internal/app"
	torneohandler "github.com/secamc93/lerida-comercio/back/central/services/modules/torneo/internal/infra/primary/handlers"
	"github.com/secamc93/lerida-comercio/back/central/services/modules/torneo/internal/infra/secondary/repository"
	"github.com/secamc93/lerida-comercio/back/central/shared/db"
	"github.com/secamc93/lerida-comercio/back/central/shared/log"
)

// New inicializa el módulo de torneo.
func New(router *gin.RouterGroup, database db.IDatabase, logger log.ILogger) {
	// 1. Inicializar Repositorio
	repo := repository.New(database, logger)

	// 2. Inicializar Caso de Uso
	torneoUC := app.New(repo, logger)

	// 3. Inicializar Handler
	torneoH := torneohandler.New(torneoUC, logger)

	// 4. Registrar Rutas
	torneoH.RegisterRoutes(router, torneoH)
}
