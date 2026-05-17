package repository

import (
	"context"
	"errors"

	"github.com/secamc93/lerida-comercio/back/central/services/modules/torneo/internal/domain"
	"github.com/secamc93/lerida-comercio/back/models"
	"gorm.io/gorm"
)

// CreatePartido crea un partido en la base de datos.
func (r *Repository) CreatePartido(ctx context.Context, dto domain.CreatePartidoDTO) (*domain.Partido, error) {
	partido := models.Partido{
		TorneoID:       dto.TorneoID,
		Jornada:        dto.Jornada,
		LocalEquipoID:  dto.LocalEquipoID,
		VisitaEquipoID: dto.VisitaEquipoID,
	}
	if err := r.database.Conn(ctx).Create(&partido).Error; err != nil {
		return nil, err
	}
	return r.GetPartidoByID(ctx, dto.TorneoID, partido.ID)
}

// UpdatePartido actualiza un partido de un torneo.
func (r *Repository) UpdatePartido(ctx context.Context, torneoID, id uint, dto domain.UpdatePartidoDTO) (*domain.Partido, error) {
	updates := map[string]any{}
	if dto.Jornada != nil {
		updates["jornada"] = *dto.Jornada
	}
	if dto.LocalEquipoID != nil {
		updates["local_equipo_id"] = *dto.LocalEquipoID
	}
	if dto.VisitaEquipoID != nil {
		updates["visita_equipo_id"] = *dto.VisitaEquipoID
	}
	if len(updates) > 0 {
		if err := r.database.Conn(ctx).Model(&models.Partido{}).
			Where("id = ? AND torneo_id = ?", id, torneoID).
			Updates(updates).Error; err != nil {
			return nil, err
		}
	}
	return r.GetPartidoByID(ctx, torneoID, id)
}

// DeletePartido elimina (soft delete) un partido de un torneo.
func (r *Repository) DeletePartido(ctx context.Context, torneoID, id uint) error {
	return r.database.Conn(ctx).
		Where("id = ? AND torneo_id = ?", id, torneoID).
		Delete(&models.Partido{}).Error
}

// GetPartidoByID obtiene un partido (con equipos y eventos) por su ID.
func (r *Repository) GetPartidoByID(ctx context.Context, torneoID, id uint) (*domain.Partido, error) {
	var partido models.Partido
	err := r.database.Conn(ctx).
		Preload("LocalEquipo").
		Preload("VisitaEquipo").
		Preload("Eventos").
		Preload("Eventos.Jugador").
		Where("id = ? AND torneo_id = ?", id, torneoID).
		First(&partido).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, domain.ErrPartidoNoEncontrado
	}
	if err != nil {
		return nil, err
	}
	result := toPartidoDomain(partido)
	return &result, nil
}

// GetPartidos obtiene la lista paginada de partidos de un torneo.
func (r *Repository) GetPartidos(ctx context.Context, filters domain.PartidoFilters, p domain.PaginationParams) ([]domain.Partido, int, error) {
	var partidos []models.Partido
	var total int64

	query := r.database.Conn(ctx).Model(&models.Partido{}).Where("torneo_id = ?", filters.TorneoID)
	if filters.Jornada != nil {
		query = query.Where("jornada = ?", *filters.Jornada)
	}
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := query.
		Preload("LocalEquipo").
		Preload("VisitaEquipo").
		Order("jornada ASC, id ASC").
		Limit(p.PageSize).Offset(p.Offset()).
		Find(&partidos).Error; err != nil {
		return nil, 0, err
	}

	result := make([]domain.Partido, 0, len(partidos))
	for _, pt := range partidos {
		result = append(result, toPartidoDomain(pt))
	}
	return result, int(total), nil
}

// SetResultado registra el resultado de un partido y lo marca como jugado.
func (r *Repository) SetResultado(ctx context.Context, torneoID, id uint, dto domain.ResultadoPartidoDTO) (*domain.Partido, error) {
	if err := r.database.Conn(ctx).Model(&models.Partido{}).
		Where("id = ? AND torneo_id = ?", id, torneoID).
		Updates(map[string]any{
			"gol_local":  dto.GolLocal,
			"gol_visita": dto.GolVisita,
			"jugado":     true,
		}).Error; err != nil {
		return nil, err
	}
	return r.GetPartidoByID(ctx, torneoID, id)
}

// DeletePartidosNoJugados elimina (soft delete) los partidos no jugados del torneo.
func (r *Repository) DeletePartidosNoJugados(ctx context.Context, torneoID uint) error {
	return r.database.Conn(ctx).
		Where("torneo_id = ? AND jugado = ?", torneoID, false).
		Delete(&models.Partido{}).Error
}

// CountPartidosJugados cuenta los partidos jugados del torneo.
func (r *Repository) CountPartidosJugados(ctx context.Context, torneoID uint) (int, error) {
	var total int64
	if err := r.database.Conn(ctx).Model(&models.Partido{}).
		Where("torneo_id = ? AND jugado = ?", torneoID, true).
		Count(&total).Error; err != nil {
		return 0, err
	}
	return int(total), nil
}

// CreatePartidos crea varios partidos en una sola transacción.
func (r *Repository) CreatePartidos(ctx context.Context, partidos []domain.CreatePartidoDTO) ([]domain.Partido, error) {
	if len(partidos) == 0 {
		return []domain.Partido{}, nil
	}
	rows := make([]models.Partido, 0, len(partidos))
	for _, p := range partidos {
		rows = append(rows, models.Partido{
			TorneoID:       p.TorneoID,
			Jornada:        p.Jornada,
			LocalEquipoID:  p.LocalEquipoID,
			VisitaEquipoID: p.VisitaEquipoID,
		})
	}
	if err := r.database.Conn(ctx).Create(&rows).Error; err != nil {
		return nil, err
	}
	result := make([]domain.Partido, 0, len(rows))
	for _, row := range rows {
		result = append(result, toPartidoDomain(row))
	}
	return result, nil
}
