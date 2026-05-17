package repository

import (
	"context"
	"errors"

	"github.com/secamc93/lerida-comercio/back/central/services/modules/torneo/internal/domain"
	"github.com/secamc93/lerida-comercio/back/models"
	"gorm.io/gorm"
)

// CreateJugador crea un jugador en la base de datos.
func (r *Repository) CreateJugador(ctx context.Context, dto domain.CreateJugadorDTO) (*domain.Jugador, error) {
	jugador := models.Jugador{
		TorneoID: dto.TorneoID,
		EquipoID: dto.EquipoID,
		Name:     dto.Name,
		Position: dto.Position,
		Number:   dto.Number,
	}
	if err := r.database.Conn(ctx).Create(&jugador).Error; err != nil {
		return nil, err
	}
	return r.GetJugadorByID(ctx, dto.TorneoID, jugador.ID)
}

// UpdateJugador actualiza un jugador de un torneo.
func (r *Repository) UpdateJugador(ctx context.Context, torneoID, id uint, dto domain.UpdateJugadorDTO) (*domain.Jugador, error) {
	updates := map[string]any{}
	if dto.EquipoID != nil {
		updates["equipo_id"] = *dto.EquipoID
	}
	if dto.Name != nil {
		updates["name"] = *dto.Name
	}
	if dto.Position != nil {
		updates["position"] = *dto.Position
	}
	if dto.Number != nil {
		updates["number"] = *dto.Number
	}
	if len(updates) > 0 {
		if err := r.database.Conn(ctx).Model(&models.Jugador{}).
			Where("id = ? AND torneo_id = ?", id, torneoID).
			Updates(updates).Error; err != nil {
			return nil, err
		}
	}
	return r.GetJugadorByID(ctx, torneoID, id)
}

// DeleteJugador elimina (soft delete) un jugador de un torneo.
func (r *Repository) DeleteJugador(ctx context.Context, torneoID, id uint) error {
	return r.database.Conn(ctx).
		Where("id = ? AND torneo_id = ?", id, torneoID).
		Delete(&models.Jugador{}).Error
}

// GetJugadorByID obtiene un jugador por su ID dentro de un torneo.
func (r *Repository) GetJugadorByID(ctx context.Context, torneoID, id uint) (*domain.Jugador, error) {
	var jugador models.Jugador
	err := r.database.Conn(ctx).
		Preload("Equipo").
		Where("id = ? AND torneo_id = ?", id, torneoID).
		First(&jugador).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, domain.ErrJugadorNoEncontrado
	}
	if err != nil {
		return nil, err
	}
	result := toJugadorDomain(jugador)
	return &result, nil
}

// GetJugadores obtiene la lista paginada de jugadores de un torneo.
func (r *Repository) GetJugadores(ctx context.Context, filters domain.JugadorFilters, p domain.PaginationParams) ([]domain.Jugador, int, error) {
	var jugadores []models.Jugador
	var total int64

	query := r.database.Conn(ctx).Model(&models.Jugador{}).Where("torneo_id = ?", filters.TorneoID)
	if filters.EquipoID != nil {
		query = query.Where("equipo_id = ?", *filters.EquipoID)
	}
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := query.Preload("Equipo").
		Order("number ASC, name ASC").
		Limit(p.PageSize).Offset(p.Offset()).
		Find(&jugadores).Error; err != nil {
		return nil, 0, err
	}

	result := make([]domain.Jugador, 0, len(jugadores))
	for _, j := range jugadores {
		result = append(result, toJugadorDomain(j))
	}
	return result, int(total), nil
}
