package torneohandler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/secamc93/lerida-comercio/back/central/services/modules/torneo/internal/infra/primary/handlers/mapper"
	"github.com/secamc93/lerida-comercio/back/central/services/modules/torneo/internal/infra/primary/handlers/request"
	"github.com/secamc93/lerida-comercio/back/central/services/modules/torneo/internal/infra/primary/handlers/response"
)

// GetEquipos obtiene la lista paginada de equipos del torneo.
func (h *TorneoHandler) GetEquipos(c *gin.Context) {
	torneoID, ok := h.resolveTorneoID(c)
	if !ok {
		respondError(c, http.StatusBadRequest, "Se requiere el parámetro torneo_id")
		return
	}
	page := parsePagination(c)
	result, err := h.usecase.GetEquipos(c.Request.Context(), torneoID, page)
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Error al obtener los equipos")
		return
	}
	paged := mapper.ToPaginatedResponse(result, mapper.ToEquipoResponseList)
	respondSuccess(c, http.StatusOK, "Equipos obtenidos exitosamente", paged)
}

// GetEquipoByID obtiene un equipo por su ID.
func (h *TorneoHandler) GetEquipoByID(c *gin.Context) {
	torneoID, ok := h.resolveTorneoID(c)
	if !ok {
		respondError(c, http.StatusBadRequest, "Se requiere el parámetro torneo_id")
		return
	}
	id, ok := parseUintParam(c, "id")
	if !ok {
		respondError(c, http.StatusBadRequest, "ID de equipo inválido")
		return
	}
	equipo, err := h.usecase.GetEquipoByID(c.Request.Context(), torneoID, id)
	if err != nil {
		respondError(c, statusForDomainError(err), err.Error())
		return
	}
	respondSuccess(c, http.StatusOK, "Equipo obtenido exitosamente", mapper.ToEquipoResponse(equipo))
}

// CreateEquipo crea un equipo en el torneo.
func (h *TorneoHandler) CreateEquipo(c *gin.Context) {
	torneoID, ok := h.resolveTorneoID(c)
	if !ok {
		respondError(c, http.StatusBadRequest, "Se requiere el parámetro torneo_id")
		return
	}
	var req request.CreateEquipoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "Datos de entrada inválidos: "+err.Error())
		return
	}
	equipo, err := h.usecase.CreateEquipo(c.Request.Context(), mapper.ToCreateEquipoDTO(torneoID, req))
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Error al crear el equipo")
		return
	}
	respondSuccess(c, http.StatusCreated, "Equipo creado exitosamente", mapper.ToEquipoResponse(equipo))
}

// UpdateEquipo actualiza un equipo del torneo.
func (h *TorneoHandler) UpdateEquipo(c *gin.Context) {
	torneoID, ok := h.resolveTorneoID(c)
	if !ok {
		respondError(c, http.StatusBadRequest, "Se requiere el parámetro torneo_id")
		return
	}
	id, ok := parseUintParam(c, "id")
	if !ok {
		respondError(c, http.StatusBadRequest, "ID de equipo inválido")
		return
	}
	var req request.UpdateEquipoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "Datos de entrada inválidos: "+err.Error())
		return
	}
	equipo, err := h.usecase.UpdateEquipo(c.Request.Context(), torneoID, id, mapper.ToUpdateEquipoDTO(req))
	if err != nil {
		respondError(c, statusForDomainError(err), err.Error())
		return
	}
	respondSuccess(c, http.StatusOK, "Equipo actualizado exitosamente", mapper.ToEquipoResponse(equipo))
}

// DeleteEquipo elimina un equipo del torneo.
func (h *TorneoHandler) DeleteEquipo(c *gin.Context) {
	torneoID, ok := h.resolveTorneoID(c)
	if !ok {
		respondError(c, http.StatusBadRequest, "Se requiere el parámetro torneo_id")
		return
	}
	id, ok := parseUintParam(c, "id")
	if !ok {
		respondError(c, http.StatusBadRequest, "ID de equipo inválido")
		return
	}
	if err := h.usecase.DeleteEquipo(c.Request.Context(), torneoID, id); err != nil {
		respondError(c, statusForDomainError(err), err.Error())
		return
	}
	respondSuccess(c, http.StatusOK, "Equipo eliminado exitosamente", response.EquipoResponse{ID: id})
}
