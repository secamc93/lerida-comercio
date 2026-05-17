package torneohandler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/secamc93/lerida-comercio/back/central/services/modules/torneo/internal/domain"
	"github.com/secamc93/lerida-comercio/back/central/services/modules/torneo/internal/infra/primary/handlers/mapper"
	"github.com/secamc93/lerida-comercio/back/central/services/modules/torneo/internal/infra/primary/handlers/request"
	"github.com/secamc93/lerida-comercio/back/central/services/modules/torneo/internal/infra/primary/handlers/response"
)

// GetJugadores obtiene la lista paginada de jugadores del torneo.
func (h *TorneoHandler) GetJugadores(c *gin.Context) {
	torneoID, ok := h.resolveTorneoID(c)
	if !ok {
		respondError(c, http.StatusBadRequest, "Se requiere el parámetro torneo_id")
		return
	}
	filters := domain.JugadorFilters{TorneoID: torneoID}
	if v := c.Query("equipo_id"); v != "" {
		if id, err := strconv.ParseUint(v, 10, 64); err == nil && id > 0 {
			equipoID := uint(id)
			filters.EquipoID = &equipoID
		}
	}
	page := parsePagination(c)
	result, err := h.usecase.GetJugadores(c.Request.Context(), filters, page)
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Error al obtener los jugadores")
		return
	}
	paged := mapper.ToPaginatedResponse(result, mapper.ToJugadorResponseList)
	respondSuccess(c, http.StatusOK, "Jugadores obtenidos exitosamente", paged)
}

// GetJugadorByID obtiene un jugador por su ID.
func (h *TorneoHandler) GetJugadorByID(c *gin.Context) {
	torneoID, ok := h.resolveTorneoID(c)
	if !ok {
		respondError(c, http.StatusBadRequest, "Se requiere el parámetro torneo_id")
		return
	}
	id, ok := parseUintParam(c, "id")
	if !ok {
		respondError(c, http.StatusBadRequest, "ID de jugador inválido")
		return
	}
	jugador, err := h.usecase.GetJugadorByID(c.Request.Context(), torneoID, id)
	if err != nil {
		respondError(c, statusForDomainError(err), err.Error())
		return
	}
	respondSuccess(c, http.StatusOK, "Jugador obtenido exitosamente", mapper.ToJugadorResponse(jugador))
}

// CreateJugador crea un jugador en el torneo.
func (h *TorneoHandler) CreateJugador(c *gin.Context) {
	torneoID, ok := h.resolveTorneoID(c)
	if !ok {
		respondError(c, http.StatusBadRequest, "Se requiere el parámetro torneo_id")
		return
	}
	var req request.CreateJugadorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "Datos de entrada inválidos: "+err.Error())
		return
	}
	jugador, err := h.usecase.CreateJugador(c.Request.Context(), mapper.ToCreateJugadorDTO(torneoID, req))
	if err != nil {
		respondError(c, statusForDomainError(err), err.Error())
		return
	}
	respondSuccess(c, http.StatusCreated, "Jugador creado exitosamente", mapper.ToJugadorResponse(jugador))
}

// UpdateJugador actualiza un jugador del torneo.
func (h *TorneoHandler) UpdateJugador(c *gin.Context) {
	torneoID, ok := h.resolveTorneoID(c)
	if !ok {
		respondError(c, http.StatusBadRequest, "Se requiere el parámetro torneo_id")
		return
	}
	id, ok := parseUintParam(c, "id")
	if !ok {
		respondError(c, http.StatusBadRequest, "ID de jugador inválido")
		return
	}
	var req request.UpdateJugadorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "Datos de entrada inválidos: "+err.Error())
		return
	}
	jugador, err := h.usecase.UpdateJugador(c.Request.Context(), torneoID, id, mapper.ToUpdateJugadorDTO(req))
	if err != nil {
		respondError(c, statusForDomainError(err), err.Error())
		return
	}
	respondSuccess(c, http.StatusOK, "Jugador actualizado exitosamente", mapper.ToJugadorResponse(jugador))
}

// DeleteJugador elimina un jugador del torneo.
func (h *TorneoHandler) DeleteJugador(c *gin.Context) {
	torneoID, ok := h.resolveTorneoID(c)
	if !ok {
		respondError(c, http.StatusBadRequest, "Se requiere el parámetro torneo_id")
		return
	}
	id, ok := parseUintParam(c, "id")
	if !ok {
		respondError(c, http.StatusBadRequest, "ID de jugador inválido")
		return
	}
	if err := h.usecase.DeleteJugador(c.Request.Context(), torneoID, id); err != nil {
		respondError(c, statusForDomainError(err), err.Error())
		return
	}
	respondSuccess(c, http.StatusOK, "Jugador eliminado exitosamente", response.JugadorResponse{ID: id})
}
