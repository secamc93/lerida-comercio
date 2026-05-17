package torneohandler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/secamc93/lerida-comercio/back/central/services/modules/torneo/internal/infra/primary/handlers/mapper"
)

// GetTabla obtiene la tabla de posiciones calculada del torneo.
func (h *TorneoHandler) GetTabla(c *gin.Context) {
	torneoID, ok := h.resolveTorneoID(c)
	if !ok {
		respondError(c, http.StatusBadRequest, "Se requiere el parámetro torneo_id")
		return
	}
	tabla, err := h.usecase.GetTablaPosiciones(c.Request.Context(), torneoID)
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Error al calcular la tabla de posiciones")
		return
	}
	respondSuccess(c, http.StatusOK, "Tabla de posiciones obtenida exitosamente", mapper.ToTablaResponseList(tabla))
}

// GetGoleadores obtiene el ranking de goleadores calculado del torneo.
func (h *TorneoHandler) GetGoleadores(c *gin.Context) {
	torneoID, ok := h.resolveTorneoID(c)
	if !ok {
		respondError(c, http.StatusBadRequest, "Se requiere el parámetro torneo_id")
		return
	}
	goleadores, err := h.usecase.GetGoleadores(c.Request.Context(), torneoID)
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Error al calcular los goleadores")
		return
	}
	respondSuccess(c, http.StatusOK, "Goleadores obtenidos exitosamente", mapper.ToGoleadorResponseList(goleadores))
}

// GenerarFixture genera el fixture round-robin del torneo.
func (h *TorneoHandler) GenerarFixture(c *gin.Context) {
	torneoID, ok := h.resolveTorneoID(c)
	if !ok {
		respondError(c, http.StatusBadRequest, "Se requiere el parámetro torneo_id")
		return
	}
	partidos, err := h.usecase.GenerarFixture(c.Request.Context(), torneoID)
	if err != nil {
		respondError(c, statusForDomainError(err), err.Error())
		return
	}
	respondSuccess(c, http.StatusCreated, "Fixture generado exitosamente", mapper.ToPartidoResponseList(partidos))
}
