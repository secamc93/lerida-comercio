package handlers

import (
	"net/http"
	"sort"

	"github.com/gin-gonic/gin"
	"github.com/secamc93/lerida-comercio/back/central/internal/auth"
	"github.com/secamc93/lerida-comercio/back/migration/shared/models"
	"gorm.io/gorm"
)

type TorneoHandler struct {
	DB *gorm.DB
}

// ===== EQUIPOS =====

func (h *TorneoHandler) ListEquipos(c *gin.Context) {
	var equipos []models.Equipo
	if err := h.DB.Order("id ASC").Find(&equipos).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": equipos})
}

// ===== TABLA DE POSICIONES =====

type FilaTabla struct {
	EquipoID uint   `json:"equipo_id"`
	Nombre   string `json:"nombre"`
	Color    string `json:"color"`
	PJ       int    `json:"pj"`
	PG       int    `json:"pg"`
	PE       int    `json:"pe"`
	PP       int    `json:"pp"`
	GF       int    `json:"gf"`
	GC       int    `json:"gc"`
	DG       int    `json:"dg"`
	Pts      int    `json:"pts"`
}

func (h *TorneoHandler) Tabla(c *gin.Context) {
	var equipos []models.Equipo
	h.DB.Order("id ASC").Find(&equipos)

	var partidos []models.Partido
	h.DB.Where("jugado = ?", true).Find(&partidos)

	stats := make(map[uint]*FilaTabla)
	for _, e := range equipos {
		stats[e.ID] = &FilaTabla{EquipoID: e.ID, Nombre: e.Nombre, Color: e.Color}
	}

	for _, p := range partidos {
		if p.GolLocal == nil || p.GolVisita == nil {
			continue
		}
		gl, gv := *p.GolLocal, *p.GolVisita
		L, V := stats[p.LocalEquipoID], stats[p.VisitaEquipoID]
		if L == nil || V == nil {
			continue
		}
		L.PJ++
		V.PJ++
		L.GF += gl
		L.GC += gv
		V.GF += gv
		V.GC += gl
		if gl > gv {
			L.PG++
			V.PP++
		} else if gl < gv {
			V.PG++
			L.PP++
		} else {
			L.PE++
			V.PE++
		}
	}

	tabla := make([]*FilaTabla, 0, len(stats))
	for _, s := range stats {
		s.DG = s.GF - s.GC
		s.Pts = s.PG*3 + s.PE
		tabla = append(tabla, s)
	}
	sort.SliceStable(tabla, func(i, j int) bool {
		if tabla[i].Pts != tabla[j].Pts {
			return tabla[i].Pts > tabla[j].Pts
		}
		if tabla[i].DG != tabla[j].DG {
			return tabla[i].DG > tabla[j].DG
		}
		if tabla[i].GF != tabla[j].GF {
			return tabla[i].GF > tabla[j].GF
		}
		return tabla[i].Nombre < tabla[j].Nombre
	})
	c.JSON(http.StatusOK, gin.H{"data": tabla})
}

// ===== PARTIDOS / FIXTURE =====

func (h *TorneoHandler) ListPartidos(c *gin.Context) {
	q := h.DB.Preload("Local").Preload("Visita")
	if jornada := c.Query("jornada"); jornada != "" {
		q = q.Where("jornada = ?", jornada)
	}
	var partidos []models.Partido
	if err := q.Order("jornada ASC, orden_jornada ASC").Find(&partidos).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": partidos})
}

type updateResultadoReq struct {
	GolLocal  *int `json:"gol_local"`
	GolVisita *int `json:"gol_visita"`
}

func (h *TorneoHandler) UpdateResultado(c *gin.Context) {
	id := c.Param("id")
	var p models.Partido
	if err := h.DB.First(&p, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "partido no encontrado"})
		return
	}
	var req updateResultadoReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	p.GolLocal = req.GolLocal
	p.GolVisita = req.GolVisita
	p.Jugado = req.GolLocal != nil && req.GolVisita != nil
	if err := h.DB.Save(&p).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, p)
}

// ===== JUGADORES =====

func (h *TorneoHandler) ListJugadores(c *gin.Context) {
	q := h.DB.Preload("Equipo").Preload("Stats")
	if eq := c.Query("equipo_id"); eq != "" {
		q = q.Where("equipo_id = ?", eq)
	}
	var jugadores []models.Jugador
	if err := q.Order("equipo_id ASC, dorsal ASC").Find(&jugadores).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": jugadores})
}

func (h *TorneoHandler) GetJugador(c *gin.Context) {
	id := c.Param("id")
	var j models.Jugador
	if err := h.DB.Preload("Equipo").Preload("Stats").First(&j, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "jugador no encontrado"})
		return
	}
	c.JSON(http.StatusOK, j)
}

func (h *TorneoHandler) DeleteJugador(c *gin.Context) {
	id := c.Param("id")
	h.DB.Where("jugador_id = ?", id).Delete(&models.JugadorStats{})
	if err := h.DB.Delete(&models.Jugador{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

// ===== STATS DE JUGADOR =====

type statsInput struct {
	Goles       int `json:"goles"`
	Asistencias int `json:"asistencias"`
	Amarillas   int `json:"amarillas"`
	Rojas       int `json:"rojas"`
	Partidos    int `json:"partidos"`
}

func (h *TorneoHandler) GetStats(c *gin.Context) {
	id := c.Param("id")
	var s models.JugadorStats
	if err := h.DB.Where("jugador_id = ?", id).First(&s).Error; err != nil {
		// si no existe, devolver vacío
		c.JSON(http.StatusOK, models.JugadorStats{})
		return
	}
	c.JSON(http.StatusOK, s)
}

func (h *TorneoHandler) UpdateStats(c *gin.Context) {
	id := c.Param("id")
	var in statsInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// upsert
	var s models.JugadorStats
	if err := h.DB.Where("jugador_id = ?", id).First(&s).Error; err != nil {
		s = models.JugadorStats{}
	}
	s.Goles = max0(in.Goles)
	s.Asistencias = max0(in.Asistencias)
	s.Amarillas = max0(in.Amarillas)
	s.Rojas = max0(in.Rojas)
	s.Partidos = max0(in.Partidos)
	if s.JugadorID == 0 {
		var j models.Jugador
		if err := h.DB.First(&j, id).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "jugador no encontrado"})
			return
		}
		s.JugadorID = j.ID
		if err := h.DB.Create(&s).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	} else {
		if err := h.DB.Save(&s).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}
	c.JSON(http.StatusOK, s)
}

func (h *TorneoHandler) MiEquipo(c *gin.Context) {
	claims, _ := auth.GetClaims(c)
	var me models.Jugador
	if err := h.DB.Preload("Equipo").First(&me, claims.UserID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "jugador no encontrado"})
		return
	}
	var teammates []models.Jugador
	h.DB.Preload("Stats").Where("equipo_id = ?", me.EquipoID).Order("dorsal ASC").Find(&teammates)
	c.JSON(http.StatusOK, gin.H{"equipo": me.Equipo, "jugadores": teammates})
}

func max0(v int) int {
	if v < 0 {
		return 0
	}
	return v
}
