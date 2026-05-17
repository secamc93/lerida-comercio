package torneohandler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/secamc93/lerida-comercio/back/central/services/auth/middleware"
	"github.com/secamc93/lerida-comercio/back/central/services/modules/torneo/internal/domain"
)

// resolveBusinessID determina el negocio sobre el que se opera (entidad
// Torneo): si el JWT trae business_id>0 se usa; si no, se lee del query
// param ?business_id=. Devuelve false si no se pudo resolver.
func (h *TorneoHandler) resolveBusinessID(c *gin.Context) (uint, bool) {
	if businessID, ok := middleware.GetBusinessID(c); ok && businessID > 0 {
		return businessID, true
	}
	if param := c.Query("business_id"); param != "" {
		if id, err := strconv.ParseUint(param, 10, 64); err == nil && id > 0 {
			return uint(id), true
		}
	}
	return 0, false
}

// resolveTorneoID lee el torneo sobre el que se opera desde el query param
// ?torneo_id=. El torneo no está en el JWT, por lo que el parámetro es
// obligatorio. Devuelve false si no se pudo resolver.
func (h *TorneoHandler) resolveTorneoID(c *gin.Context) (uint, bool) {
	if param := c.Query("torneo_id"); param != "" {
		if id, err := strconv.ParseUint(param, 10, 64); err == nil && id > 0 {
			return uint(id), true
		}
	}
	return 0, false
}

// parseUintParam lee un parámetro de ruta como uint.
func parseUintParam(c *gin.Context, name string) (uint, bool) {
	v, err := strconv.ParseUint(c.Param(name), 10, 64)
	if err != nil || v == 0 {
		return 0, false
	}
	return uint(v), true
}

// parsePagination lee los parámetros de paginación del query string.
func parsePagination(c *gin.Context) domain.PaginationParams {
	p := domain.PaginationParams{Page: 1, PageSize: 10}
	if v, err := strconv.Atoi(c.Query("page")); err == nil {
		p.Page = v
	}
	if v, err := strconv.Atoi(c.Query("page_size")); err == nil {
		p.PageSize = v
	}
	p.Normalize()
	return p
}

// respondError envía una respuesta de error con el código y mensaje dados.
func respondError(c *gin.Context, code int, message string) {
	c.JSON(code, gin.H{"error": message})
}

// respondSuccess envía una respuesta de éxito con el formato estándar.
func respondSuccess(c *gin.Context, code int, message string, data any) {
	c.JSON(code, gin.H{
		"success": true,
		"message": message,
		"data":    data,
	})
}

// statusForDomainError mapea un error de dominio a un código HTTP.
func statusForDomainError(err error) int {
	switch err {
	case domain.ErrTorneoNoEncontrado,
		domain.ErrEquipoNoEncontrado,
		domain.ErrJugadorNoEncontrado,
		domain.ErrPartidoNoEncontrado,
		domain.ErrEventoNoEncontrado:
		return http.StatusNotFound
	case domain.ErrFixtureExistente,
		domain.ErrEquiposInsuficientes:
		return http.StatusBadRequest
	default:
		return http.StatusInternalServerError
	}
}
