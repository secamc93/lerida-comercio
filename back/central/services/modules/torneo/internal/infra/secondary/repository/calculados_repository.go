package repository

import (
	"context"
	"sort"

	"github.com/secamc93/lerida-comercio/back/central/services/modules/torneo/internal/domain"
	"github.com/secamc93/lerida-comercio/back/models"
)

// GetTablaPosiciones calcula la tabla de posiciones a partir de los partidos
// jugados del torneo. Victoria=3, empate=1, derrota=0. Ordenada por puntos,
// luego diferencia de gol, luego goles a favor.
func (r *Repository) GetTablaPosiciones(ctx context.Context, torneoID uint) ([]domain.TablaPosicion, error) {
	var equipos []models.Equipo
	if err := r.database.Conn(ctx).
		Where("torneo_id = ?", torneoID).
		Find(&equipos).Error; err != nil {
		return nil, err
	}

	filas := make(map[uint]*domain.TablaPosicion, len(equipos))
	orden := make([]uint, 0, len(equipos))
	for _, e := range equipos {
		filas[e.ID] = &domain.TablaPosicion{
			EquipoID:   e.ID,
			EquipoName: e.Name,
			Color:      e.Color,
		}
		orden = append(orden, e.ID)
	}

	var partidos []models.Partido
	if err := r.database.Conn(ctx).
		Where("torneo_id = ? AND jugado = ? AND gol_local IS NOT NULL AND gol_visita IS NOT NULL", torneoID, true).
		Find(&partidos).Error; err != nil {
		return nil, err
	}

	for _, p := range partidos {
		local := filas[p.LocalEquipoID]
		visita := filas[p.VisitaEquipoID]
		if local == nil || visita == nil || p.GolLocal == nil || p.GolVisita == nil {
			continue
		}
		gl, gv := *p.GolLocal, *p.GolVisita

		local.PJ++
		visita.PJ++
		local.GF += gl
		local.GC += gv
		visita.GF += gv
		visita.GC += gl

		switch {
		case gl > gv:
			local.PG++
			local.Pts += 3
			visita.PP++
		case gl < gv:
			visita.PG++
			visita.Pts += 3
			local.PP++
		default:
			local.PE++
			visita.PE++
			local.Pts++
			visita.Pts++
		}
	}

	tabla := make([]domain.TablaPosicion, 0, len(orden))
	for _, id := range orden {
		f := filas[id]
		f.DG = f.GF - f.GC
		tabla = append(tabla, *f)
	}

	sort.SliceStable(tabla, func(i, j int) bool {
		if tabla[i].Pts != tabla[j].Pts {
			return tabla[i].Pts > tabla[j].Pts
		}
		if tabla[i].DG != tabla[j].DG {
			return tabla[i].DG > tabla[j].DG
		}
		return tabla[i].GF > tabla[j].GF
	})

	return tabla, nil
}

// GetGoleadores calcula el ranking de jugadores a partir de los eventos de los
// partidos del torneo. Devuelve goles, asistencias, amarillas y rojas.
func (r *Repository) GetGoleadores(ctx context.Context, torneoID uint) ([]domain.Goleador, error) {
	var jugadores []models.Jugador
	if err := r.database.Conn(ctx).
		Preload("Equipo").
		Where("torneo_id = ?", torneoID).
		Find(&jugadores).Error; err != nil {
		return nil, err
	}

	stats := make(map[uint]*domain.Goleador, len(jugadores))
	for _, j := range jugadores {
		g := &domain.Goleador{
			JugadorID:   j.ID,
			JugadorName: j.Name,
			EquipoID:    j.EquipoID,
		}
		if j.Equipo.ID != 0 {
			g.EquipoName = j.Equipo.Name
		}
		stats[j.ID] = g
	}

	// Eventos de los partidos del torneo.
	var eventos []models.PartidoEvento
	if err := r.database.Conn(ctx).
		Joins("JOIN partido ON partido.id = partido_evento.partido_id").
		Where("partido.torneo_id = ? AND partido.deleted_at IS NULL", torneoID).
		Find(&eventos).Error; err != nil {
		return nil, err
	}

	for _, e := range eventos {
		g := stats[e.JugadorID]
		if g == nil {
			continue
		}
		switch e.Tipo {
		case "gol":
			g.Goles++
		case "asistencia":
			g.Asistencias++
		case "amarilla":
			g.Amarillas++
		case "roja":
			g.Rojas++
		}
	}

	ranking := make([]domain.Goleador, 0, len(stats))
	for _, j := range jugadores {
		ranking = append(ranking, *stats[j.ID])
	}

	sort.SliceStable(ranking, func(i, j int) bool {
		if ranking[i].Goles != ranking[j].Goles {
			return ranking[i].Goles > ranking[j].Goles
		}
		return ranking[i].Asistencias > ranking[j].Asistencias
	})

	return ranking, nil
}
