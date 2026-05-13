package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/secamc93/lerida-comercio/back/central/internal/auth"
	"github.com/secamc93/lerida-comercio/back/central/internal/config"
	"github.com/secamc93/lerida-comercio/back/migration/shared/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthHandler struct {
	DB  *gorm.DB
	Cfg *config.Config
}

type loginAdminReq struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type loginJugadorReq struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type registerJugadorReq struct {
	Username string `json:"username" binding:"required,min=3"`
	Password string `json:"password" binding:"required,min=4"`
	Nombre   string `json:"nombre" binding:"required"`
	EquipoID uint   `json:"equipo_id" binding:"required"`
	Posicion string `json:"posicion" binding:"required,oneof=portero defensa medio delantero"`
	Dorsal   int    `json:"dorsal" binding:"required,min=1,max=99"`
}

type authResponse struct {
	Token string      `json:"token"`
	Role  string      `json:"role"`
	User  interface{} `json:"user"`
}

func (h *AuthHandler) LoginAdmin(c *gin.Context) {
	var req loginAdminReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	var admin models.Admin
	if err := h.DB.Where("username = ?", req.Username).First(&admin).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "credenciales inválidas"})
		return
	}
	if bcrypt.CompareHashAndPassword([]byte(admin.PasswordHash), []byte(req.Password)) != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "credenciales inválidas"})
		return
	}
	tok, err := auth.Generate(h.Cfg.JWTSecret, h.Cfg.JWTExpiration, admin.ID, admin.Username, "admin")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "no se pudo generar token"})
		return
	}
	c.JSON(http.StatusOK, authResponse{Token: tok, Role: "admin", User: gin.H{"id": admin.ID, "username": admin.Username}})
}

func (h *AuthHandler) LoginJugador(c *gin.Context) {
	var req loginJugadorReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	var j models.Jugador
	if err := h.DB.Preload("Equipo").Where("username = ?", req.Username).First(&j).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "credenciales inválidas"})
		return
	}
	if bcrypt.CompareHashAndPassword([]byte(j.PasswordHash), []byte(req.Password)) != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "credenciales inválidas"})
		return
	}
	tok, err := auth.Generate(h.Cfg.JWTSecret, h.Cfg.JWTExpiration, j.ID, j.Username, "jugador")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "no se pudo generar token"})
		return
	}
	c.JSON(http.StatusOK, authResponse{Token: tok, Role: "jugador", User: j})
}

func (h *AuthHandler) RegisterJugador(c *gin.Context) {
	var req registerJugadorReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var existing models.Jugador
	if err := h.DB.Where("username = ?", req.Username).First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "el usuario ya existe"})
		return
	}

	var equipo models.Equipo
	if err := h.DB.First(&equipo, req.EquipoID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "equipo inválido"})
		return
	}

	// dorsal único por equipo
	var dup models.Jugador
	if err := h.DB.Where("equipo_id = ? AND dorsal = ?", req.EquipoID, req.Dorsal).First(&dup).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "ya existe un jugador con ese dorsal en el equipo"})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error generando hash"})
		return
	}

	jugador := models.Jugador{
		Username:     req.Username,
		PasswordHash: string(hash),
		Nombre:       req.Nombre,
		EquipoID:     req.EquipoID,
		Posicion:     req.Posicion,
		Dorsal:       req.Dorsal,
	}
	if err := h.DB.Create(&jugador).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	// crear stats vacías
	h.DB.Create(&models.JugadorStats{JugadorID: jugador.ID})

	tok, _ := auth.Generate(h.Cfg.JWTSecret, h.Cfg.JWTExpiration, jugador.ID, jugador.Username, "jugador")
	h.DB.Preload("Equipo").First(&jugador, jugador.ID)
	c.JSON(http.StatusCreated, authResponse{Token: tok, Role: "jugador", User: jugador})
}

func (h *AuthHandler) Me(c *gin.Context) {
	claims, ok := auth.GetClaims(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "no auth"})
		return
	}
	if claims.Role == "admin" {
		var admin models.Admin
		h.DB.First(&admin, claims.UserID)
		c.JSON(http.StatusOK, gin.H{"role": "admin", "user": gin.H{"id": admin.ID, "username": admin.Username}})
		return
	}
	var j models.Jugador
	if err := h.DB.Preload("Equipo").Preload("Stats").First(&j, claims.UserID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "jugador no encontrado"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"role": "jugador", "user": j})
}
