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

// GetPartidos obtiene la lista paginada de partidos del torneo.
func (h *TorneoHandler) GetPartidos(c *gin.Context) {
	torneoID, ok := h.resolveTorneoID(c)
	if !ok {
		respondError(c, http.StatusBadRequest, "Se requiere el parámetro torneo_id")
		return
	}
	filters := domain.PartidoFilters{TorneoID: torneoID}
	if v := c.Query("jornada"); v != "" {
		if jornada, err := strconv.Atoi(v); err == nil {
			filters.Jornada = &jornada
		}
	}
	page := parsePagination(c)
	result, err := h.usecase.GetPartidos(c.Request.Context(), filters, page)
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Error al obtener los partidos")
		return
	}
	paged := mapper.ToPaginatedResponse(result, mapper.ToPartidoResponseList)
	respondSuccess(c, http.StatusOK, "Partidos obtenidos exitosamente", paged)
}

// GetPartidoByID obtiene un partido (con equipos y eventos) por su ID.
func (h *TorneoHandler) GetPartidoByID(c *gin.Context) {
	torneoID, ok := h.resolveTorneoID(c)
	if !ok {
		respondError(c, http.StatusBadRequest, "Se requiere el parámetro torneo_id")
		return
	}
	id, ok := parseUintParam(c, "id")
	if !ok {
		respondError(c, http.StatusBadRequest, "ID de partido inválido")
		return
	}
	partido, err := h.usecase.GetPartidoByID(c.Request.Context(), torneoID, id)
	if err != nil {
		respondError(c, statusForDomainError(err), err.Error())
		return
	}
	respondSuccess(c, http.StatusOK, "Partido obtenido exitosamente", mapper.ToPartidoResponse(partido))
}

// CreatePartido crea un partido en el torneo.
func (h *TorneoHandler) CreatePartido(c *gin.Context) {
	torneoID, ok := h.resolveTorneoID(c)
	if !ok {
		respondError(c, http.StatusBadRequest, "Se requiere el parámetro torneo_id")
		return
	}
	var req request.CreatePartidoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "Datos de entrada inválidos: "+err.Error())
		return
	}
	partido, err := h.usecase.CreatePartido(c.Request.Context(), mapper.ToCreatePartidoDTO(torneoID, req))
	if err != nil {
		respondError(c, statusForDomainError(err), err.Error())
		return
	}
	respondSuccess(c, http.StatusCreated, "Partido creado exitosamente", mapper.ToPartidoResponse(partido))
}

// UpdatePartido actualiza un partido del torneo.
func (h *TorneoHandler) UpdatePartido(c *gin.Context) {
	torneoID, ok := h.resolveTorneoID(c)
	if !ok {
		respondError(c, http.StatusBadRequest, "Se requiere el parámetro torneo_id")
		return
	}
	id, ok := parseUintParam(c, "id")
	if !ok {
		respondError(c, http.StatusBadRequest, "ID de partido inválido")
		return
	}
	var req request.UpdatePartidoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "Datos de entrada inválidos: "+err.Error())
		return
	}
	partido, err := h.usecase.UpdatePartido(c.Request.Context(), torneoID, id, mapper.ToUpdatePartidoDTO(req))
	if err != nil {
		respondError(c, statusForDomainError(err), err.Error())
		return
	}
	respondSuccess(c, http.StatusOK, "Partido actualizado exitosamente", mapper.ToPartidoResponse(partido))
}

// DeletePartido elimina un partido del torneo.
func (h *TorneoHandler) DeletePartido(c *gin.Context) {
	torneoID, ok := h.resolveTorneoID(c)
	if !ok {
		respondError(c, http.StatusBadRequest, "Se requiere el parámetro torneo_id")
		return
	}
	id, ok := parseUintParam(c, "id")
	if !ok {
		respondError(c, http.StatusBadRequest, "ID de partido inválido")
		return
	}
	if err := h.usecase.DeletePartido(c.Request.Context(), torneoID, id); err != nil {
		respondError(c, statusForDomainError(err), err.Error())
		return
	}
	respondSuccess(c, http.StatusOK, "Partido eliminado exitosamente", response.PartidoResponse{ID: id})
}

// SetResultado registra el resultado de un partido y lo marca como jugado.
func (h *TorneoHandler) SetResultado(c *gin.Context) {
	torneoID, ok := h.resolveTorneoID(c)
	if !ok {
		respondError(c, http.StatusBadRequest, "Se requiere el parámetro torneo_id")
		return
	}
	id, ok := parseUintParam(c, "id")
	if !ok {
		respondError(c, http.StatusBadRequest, "ID de partido inválido")
		return
	}
	var req request.ResultadoPartidoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "Datos de entrada inválidos: "+err.Error())
		return
	}
	if req.GolLocal < 0 || req.GolVisita < 0 {
		respondError(c, http.StatusBadRequest, "Los goles no pueden ser negativos")
		return
	}
	partido, err := h.usecase.SetResultado(c.Request.Context(), torneoID, id, mapper.ToResultadoPartidoDTO(req))
	if err != nil {
		respondError(c, statusForDomainError(err), err.Error())
		return
	}
	respondSuccess(c, http.StatusOK, "Resultado registrado exitosamente", mapper.ToPartidoResponse(partido))
}
