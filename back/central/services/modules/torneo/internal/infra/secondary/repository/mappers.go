package repository

import (
	"github.com/secamc93/lerida-comercio/back/central/services/modules/torneo/internal/domain"
	"github.com/secamc93/lerida-comercio/back/models"
)

func toTorneoDomain(m models.Torneo) domain.Torneo {
	return domain.Torneo{
		ID:          m.ID,
		BusinessID:  m.BusinessID,
		Name:        m.Name,
		Description: m.Description,
		Season:      m.Season,
		IsActive:    m.IsActive,
		CreatedAt:   m.CreatedAt,
		UpdatedAt:   m.UpdatedAt,
	}
}

func toEquipoDomain(m models.Equipo) domain.Equipo {
	return domain.Equipo{
		ID:        m.ID,
		TorneoID:  m.TorneoID,
		Name:      m.Name,
		Color:     m.Color,
		LogoURL:   m.LogoURL,
		CreatedAt: m.CreatedAt,
		UpdatedAt: m.UpdatedAt,
	}
}

func toJugadorDomain(m models.Jugador) domain.Jugador {
	j := domain.Jugador{
		ID:        m.ID,
		TorneoID:  m.TorneoID,
		EquipoID:  m.EquipoID,
		Name:      m.Name,
		Position:  m.Position,
		Number:    m.Number,
		CreatedAt: m.CreatedAt,
		UpdatedAt: m.UpdatedAt,
	}
	if m.Equipo.ID != 0 {
		j.EquipoName = m.Equipo.Name
	}
	return j
}

func toEventoDomain(m models.PartidoEvento) domain.PartidoEvento {
	e := domain.PartidoEvento{
		ID:        m.ID,
		PartidoID: m.PartidoID,
		JugadorID: m.JugadorID,
		EquipoID:  m.EquipoID,
		Tipo:      m.Tipo,
		Minuto:    m.Minuto,
		CreatedAt: m.CreatedAt,
	}
	if m.Jugador.ID != 0 {
		e.JugadorName = m.Jugador.Name
	}
	return e
}

func toPartidoDomain(m models.Partido) domain.Partido {
	p := domain.Partido{
		ID:             m.ID,
		TorneoID:       m.TorneoID,
		Jornada:        m.Jornada,
		LocalEquipoID:  m.LocalEquipoID,
		VisitaEquipoID: m.VisitaEquipoID,
		GolLocal:       m.GolLocal,
		GolVisita:      m.GolVisita,
		Jugado:         m.Jugado,
		CreatedAt:      m.CreatedAt,
		UpdatedAt:      m.UpdatedAt,
	}
	if m.LocalEquipo.ID != 0 {
		p.LocalEquipoName = m.LocalEquipo.Name
	}
	if m.VisitaEquipo.ID != 0 {
		p.VisitaEquipoName = m.VisitaEquipo.Name
	}
	for _, ev := range m.Eventos {
		p.Eventos = append(p.Eventos, toEventoDomain(ev))
	}
	return p
}
