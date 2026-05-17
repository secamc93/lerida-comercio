package torneohandler

import (
	"github.com/gin-gonic/gin"
	"github.com/secamc93/lerida-comercio/back/central/services/auth/middleware"
)

// RegisterRoutes registra las rutas del módulo de torneo.
func (h *TorneoHandler) RegisterRoutes(router *gin.RouterGroup, handler ITorneoHandler) {
	g := router.Group("/torneo")
	{
		// Torneos
		g.GET("/torneos", middleware.JWT(), handler.GetTorneos)
		g.GET("/torneos/:id", middleware.JWT(), handler.GetTorneoByID)
		g.POST("/torneos", middleware.JWT(), handler.CreateTorneo)
		g.PUT("/torneos/:id", middleware.JWT(), handler.UpdateTorneo)
		g.DELETE("/torneos/:id", middleware.JWT(), handler.DeleteTorneo)

		// Equipos
		g.GET("/equipos", middleware.JWT(), handler.GetEquipos)
		g.GET("/equipos/:id", middleware.JWT(), handler.GetEquipoByID)
		g.POST("/equipos", middleware.JWT(), handler.CreateEquipo)
		g.PUT("/equipos/:id", middleware.JWT(), handler.UpdateEquipo)
		g.DELETE("/equipos/:id", middleware.JWT(), handler.DeleteEquipo)

		// Jugadores
		g.GET("/jugadores", middleware.JWT(), handler.GetJugadores)
		g.GET("/jugadores/:id", middleware.JWT(), handler.GetJugadorByID)
		g.POST("/jugadores", middleware.JWT(), handler.CreateJugador)
		g.PUT("/jugadores/:id", middleware.JWT(), handler.UpdateJugador)
		g.DELETE("/jugadores/:id", middleware.JWT(), handler.DeleteJugador)

		// Partidos
		g.GET("/partidos", middleware.JWT(), handler.GetPartidos)
		g.GET("/partidos/:id", middleware.JWT(), handler.GetPartidoByID)
		g.POST("/partidos", middleware.JWT(), handler.CreatePartido)
		g.PUT("/partidos/:id", middleware.JWT(), handler.UpdatePartido)
		g.DELETE("/partidos/:id", middleware.JWT(), handler.DeletePartido)
		g.PUT("/partidos/:id/resultado", middleware.JWT(), handler.SetResultado)

		// Eventos de partido
		g.GET("/partidos/:id/eventos", middleware.JWT(), handler.GetEventos)
		g.POST("/partidos/:id/eventos", middleware.JWT(), handler.CreateEvento)
		g.DELETE("/eventos/:id", middleware.JWT(), handler.DeleteEvento)

		// Calculados
		g.GET("/tabla", middleware.JWT(), handler.GetTabla)
		g.GET("/goleadores", middleware.JWT(), handler.GetGoleadores)
		g.POST("/fixture/generar", middleware.JWT(), handler.GenerarFixture)
	}
}
