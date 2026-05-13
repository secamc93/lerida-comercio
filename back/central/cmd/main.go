package main

import (
	"log"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"github.com/secamc93/lerida-comercio/back/central/internal/auth"
	"github.com/secamc93/lerida-comercio/back/central/internal/config"
	"github.com/secamc93/lerida-comercio/back/central/internal/db"
	"github.com/secamc93/lerida-comercio/back/central/internal/handlers"
)

func main() {
	_ = godotenv.Load()

	cfg := config.Load()
	database := db.Open(cfg)

	if cfg.AppEnv == "production" {
		gin.SetMode(gin.ReleaseMode)
	}
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.CORSAllowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	api := r.Group("/api/v1")

	// Auth
	authH := &handlers.AuthHandler{DB: database, Cfg: cfg}
	api.POST("/auth/login/admin", authH.LoginAdmin)
	api.POST("/auth/login/jugador", authH.LoginJugador)
	api.POST("/auth/register/jugador", authH.RegisterJugador)
	api.GET("/auth/me", auth.RequireAuth(cfg.JWTSecret), authH.Me)

	// Catálogo público
	catH := &handlers.CategoriasHandler{DB: database}
	api.GET("/categorias", catH.List)

	comH := &handlers.ComerciosHandler{DB: database}
	api.GET("/comercios", comH.List)
	api.GET("/comercios/:id", comH.Get)

	// Admin (comercios)
	adminGroup := api.Group("")
	adminGroup.Use(auth.RequireAuth(cfg.JWTSecret), auth.RequireRole("admin"))
	adminGroup.POST("/comercios", comH.Create)
	adminGroup.PUT("/comercios/:id", comH.Update)
	adminGroup.DELETE("/comercios/:id", comH.Delete)

	// Torneo
	torH := &handlers.TorneoHandler{DB: database}
	api.GET("/torneo/equipos", torH.ListEquipos)
	api.GET("/torneo/tabla", torH.Tabla)
	api.GET("/torneo/partidos", torH.ListPartidos)
	api.GET("/torneo/jugadores", torH.ListJugadores)
	api.GET("/torneo/jugadores/:id", torH.GetJugador)
	api.GET("/torneo/jugadores/:id/stats", torH.GetStats)

	// Torneo - admin
	adminGroup.PUT("/torneo/partidos/:id", torH.UpdateResultado)
	adminGroup.PUT("/torneo/jugadores/:id/stats", torH.UpdateStats)
	adminGroup.DELETE("/torneo/jugadores/:id", torH.DeleteJugador)

	// Torneo - jugador autenticado
	jugadorGroup := api.Group("/torneo")
	jugadorGroup.Use(auth.RequireAuth(cfg.JWTSecret), auth.RequireRole("jugador"))
	jugadorGroup.GET("/mi-equipo", torH.MiEquipo)

	log.Printf("🚀 API escuchando en :%s", cfg.HTTPPort)
	if err := r.Run(":" + cfg.HTTPPort); err != nil {
		log.Fatalf("error arrancando server: %v", err)
	}
}
