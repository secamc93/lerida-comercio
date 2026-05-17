package torneohandler

import (
	"github.com/gin-gonic/gin"
	"github.com/secamc93/lerida-comercio/back/central/services/modules/torneo/internal/app"
	"github.com/secamc93/lerida-comercio/back/central/shared/log"
)

// ITorneoHandler define la interfaz del handler del módulo de torneo.
type ITorneoHandler interface {
	// Torneos
	GetTorneos(c *gin.Context)
	GetTorneoByID(c *gin.Context)
	CreateTorneo(c *gin.Context)
	UpdateTorneo(c *gin.Context)
	DeleteTorneo(c *gin.Context)

	// Equipos
	GetEquipos(c *gin.Context)
	GetEquipoByID(c *gin.Context)
	CreateEquipo(c *gin.Context)
	UpdateEquipo(c *gin.Context)
	DeleteEquipo(c *gin.Context)

	// Jugadores
	GetJugadores(c *gin.Context)
	GetJugadorByID(c *gin.Context)
	CreateJugador(c *gin.Context)
	UpdateJugador(c *gin.Context)
	DeleteJugador(c *gin.Context)

	// Partidos
	GetPartidos(c *gin.Context)
	GetPartidoByID(c *gin.Context)
	CreatePartido(c *gin.Context)
	UpdatePartido(c *gin.Context)
	DeletePartido(c *gin.Context)
	SetResultado(c *gin.Context)

	// Eventos
	GetEventos(c *gin.Context)
	CreateEvento(c *gin.Context)
	DeleteEvento(c *gin.Context)

	// Calculados
	GetTabla(c *gin.Context)
	GetGoleadores(c *gin.Context)
	GenerarFixture(c *gin.Context)

	RegisterRoutes(router *gin.RouterGroup, handler ITorneoHandler)
}

// TorneoHandler maneja las solicitudes HTTP del módulo de torneo.
type TorneoHandler struct {
	usecase app.IUseCaseTorneo
	logger  log.ILogger
}

// New crea una nueva instancia del handler de torneo.
func New(usecase app.IUseCaseTorneo, logger log.ILogger) ITorneoHandler {
	return &TorneoHandler{
		usecase: usecase,
		logger:  logger,
	}
}
