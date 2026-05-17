package torneohandler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/secamc93/lerida-comercio/back/central/services/modules/torneo/internal/domain"
	"github.com/secamc93/lerida-comercio/back/central/services/modules/torneo/internal/infra/primary/handlers/mapper"
	"github.com/secamc93/lerida-comercio/back/central/services/modules/torneo/internal/infra/primary/handlers/request"
	"github.com/secamc93/lerida-comercio/back/central/services/modules/torneo/internal/infra/primary/handlers/response"
)

// GetEventos obtiene los eventos de un partido del torneo.
func (h *TorneoHandler) GetEventos(c *gin.Context) {
	torneoID, ok := h.resolveTorneoID(c)
	if !ok {
		respondError(c, http.StatusBadRequest, "Se requiere el parámetro torneo_id")
		return
	}
	partidoID, ok := parseUintParam(c, "id")
	if !ok {
		respondError(c, http.StatusBadRequest, "ID de partido inválido")
		return
	}
	eventos, err := h.usecase.GetEventosByPartido(c.Request.Context(), torneoID, partidoID)
	if err != nil {
		respondError(c, statusForDomainError(err), err.Error())
		return
	}
	respondSuccess(c, http.StatusOK, "Eventos obtenidos exitosamente", mapper.ToEventoResponseList(eventos))
}

// CreateEvento crea un evento en un partido del torneo.
func (h *TorneoHandler) CreateEvento(c *gin.Context) {
	torneoID, ok := h.resolveTorneoID(c)
	if !ok {
		respondError(c, http.StatusBadRequest, "Se requiere el parámetro torneo_id")
		return
	}
	partidoID, ok := parseUintParam(c, "id")
	if !ok {
		respondError(c, http.StatusBadRequest, "ID de partido inválido")
		return
	}
	var req request.CreateEventoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "Datos de entrada inválidos: "+err.Error())
		return
	}
	dto := domain.CreateEventoDTO{
		PartidoID: partidoID,
		JugadorID: req.JugadorID,
		EquipoID:  req.EquipoID,
		Tipo:      req.Tipo,
		Minuto:    req.Minuto,
	}
	evento, err := h.usecase.CreateEvento(c.Request.Context(), torneoID, dto)
	if err != nil {
		respondError(c, statusForDomainError(err), err.Error())
		return
	}
	respondSuccess(c, http.StatusCreated, "Evento creado exitosamente", mapper.ToEventoResponse(evento))
}

// DeleteEvento elimina un evento de partido.
func (h *TorneoHandler) DeleteEvento(c *gin.Context) {
	id, ok := parseUintParam(c, "id")
	if !ok {
		respondError(c, http.StatusBadRequest, "ID de evento inválido")
		return
	}
	if err := h.usecase.DeleteEvento(c.Request.Context(), id); err != nil {
		respondError(c, statusForDomainError(err), err.Error())
		return
	}
	respondSuccess(c, http.StatusOK, "Evento eliminado exitosamente", response.EventoResponse{ID: id})
}
