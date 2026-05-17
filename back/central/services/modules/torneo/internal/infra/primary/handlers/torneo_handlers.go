package torneohandler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/secamc93/lerida-comercio/back/central/services/modules/torneo/internal/infra/primary/handlers/mapper"
	"github.com/secamc93/lerida-comercio/back/central/services/modules/torneo/internal/infra/primary/handlers/request"
	"github.com/secamc93/lerida-comercio/back/central/services/modules/torneo/internal/infra/primary/handlers/response"
)

// GetTorneos obtiene la lista paginada de torneos de un negocio.
func (h *TorneoHandler) GetTorneos(c *gin.Context) {
	businessID, ok := h.resolveBusinessID(c)
	if !ok {
		respondError(c, http.StatusBadRequest, "Se requiere el parámetro business_id")
		return
	}
	page := parsePagination(c)
	result, err := h.usecase.GetTorneos(c.Request.Context(), businessID, page)
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Error al obtener los torneos")
		return
	}
	paged := mapper.ToPaginatedResponse(result, mapper.ToTorneoResponseList)
	respondSuccess(c, http.StatusOK, "Torneos obtenidos exitosamente", paged)
}

// GetTorneoByID obtiene un torneo por su ID.
func (h *TorneoHandler) GetTorneoByID(c *gin.Context) {
	id, ok := parseUintParam(c, "id")
	if !ok {
		respondError(c, http.StatusBadRequest, "ID de torneo inválido")
		return
	}
	torneo, err := h.usecase.GetTorneoByID(c.Request.Context(), id)
	if err != nil {
		respondError(c, statusForDomainError(err), err.Error())
		return
	}
	respondSuccess(c, http.StatusOK, "Torneo obtenido exitosamente", mapper.ToTorneoResponse(torneo))
}

// CreateTorneo crea un torneo para un negocio.
func (h *TorneoHandler) CreateTorneo(c *gin.Context) {
	businessID, ok := h.resolveBusinessID(c)
	if !ok {
		respondError(c, http.StatusBadRequest, "Se requiere el parámetro business_id")
		return
	}
	var req request.CreateTorneoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "Datos de entrada inválidos: "+err.Error())
		return
	}
	torneo, err := h.usecase.CreateTorneo(c.Request.Context(), mapper.ToCreateTorneoDTO(businessID, req))
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Error al crear el torneo")
		return
	}
	respondSuccess(c, http.StatusCreated, "Torneo creado exitosamente", mapper.ToTorneoResponse(torneo))
}

// UpdateTorneo actualiza un torneo.
func (h *TorneoHandler) UpdateTorneo(c *gin.Context) {
	id, ok := parseUintParam(c, "id")
	if !ok {
		respondError(c, http.StatusBadRequest, "ID de torneo inválido")
		return
	}
	var req request.UpdateTorneoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "Datos de entrada inválidos: "+err.Error())
		return
	}
	torneo, err := h.usecase.UpdateTorneo(c.Request.Context(), id, mapper.ToUpdateTorneoDTO(req))
	if err != nil {
		respondError(c, statusForDomainError(err), err.Error())
		return
	}
	respondSuccess(c, http.StatusOK, "Torneo actualizado exitosamente", mapper.ToTorneoResponse(torneo))
}

// DeleteTorneo elimina un torneo.
func (h *TorneoHandler) DeleteTorneo(c *gin.Context) {
	id, ok := parseUintParam(c, "id")
	if !ok {
		respondError(c, http.StatusBadRequest, "ID de torneo inválido")
		return
	}
	if err := h.usecase.DeleteTorneo(c.Request.Context(), id); err != nil {
		respondError(c, statusForDomainError(err), err.Error())
		return
	}
	respondSuccess(c, http.StatusOK, "Torneo eliminado exitosamente", response.TorneoResponse{ID: id})
}
