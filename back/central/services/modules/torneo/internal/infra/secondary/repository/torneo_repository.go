package repository

import (
	"context"
	"errors"

	"github.com/secamc93/lerida-comercio/back/central/services/modules/torneo/internal/domain"
	"github.com/secamc93/lerida-comercio/back/models"
	"gorm.io/gorm"
)

// CreateTorneo crea un torneo en la base de datos.
func (r *Repository) CreateTorneo(ctx context.Context, dto domain.CreateTorneoDTO) (*domain.Torneo, error) {
	torneo := models.Torneo{
		BusinessID:  dto.BusinessID,
		Name:        dto.Name,
		Description: dto.Description,
		Season:      dto.Season,
		IsActive:    true,
	}
	if err := r.database.Conn(ctx).Create(&torneo).Error; err != nil {
		return nil, err
	}
	result := toTorneoDomain(torneo)
	return &result, nil
}

// UpdateTorneo actualiza un torneo.
func (r *Repository) UpdateTorneo(ctx context.Context, id uint, dto domain.UpdateTorneoDTO) (*domain.Torneo, error) {
	updates := map[string]any{}
	if dto.Name != nil {
		updates["name"] = *dto.Name
	}
	if dto.Description != nil {
		updates["description"] = *dto.Description
	}
	if dto.Season != nil {
		updates["season"] = *dto.Season
	}
	if dto.IsActive != nil {
		updates["is_active"] = *dto.IsActive
	}
	if len(updates) > 0 {
		if err := r.database.Conn(ctx).Model(&models.Torneo{}).
			Where("id = ?", id).
			Updates(updates).Error; err != nil {
			return nil, err
		}
	}
	return r.GetTorneoByID(ctx, id)
}

// DeleteTorneo elimina (soft delete) un torneo.
func (r *Repository) DeleteTorneo(ctx context.Context, id uint) error {
	return r.database.Conn(ctx).
		Where("id = ?", id).
		Delete(&models.Torneo{}).Error
}

// GetTorneoByID obtiene un torneo por su ID.
func (r *Repository) GetTorneoByID(ctx context.Context, id uint) (*domain.Torneo, error) {
	var torneo models.Torneo
	err := r.database.Conn(ctx).
		Where("id = ?", id).
		First(&torneo).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, domain.ErrTorneoNoEncontrado
	}
	if err != nil {
		return nil, err
	}
	result := toTorneoDomain(torneo)
	return &result, nil
}

// GetTorneos obtiene la lista paginada de torneos de un negocio.
func (r *Repository) GetTorneos(ctx context.Context, businessID uint, p domain.PaginationParams) ([]domain.Torneo, int, error) {
	var torneos []models.Torneo
	var total int64

	query := r.database.Conn(ctx).Model(&models.Torneo{}).Where("business_id = ?", businessID)
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := query.Order("id DESC").
		Limit(p.PageSize).Offset(p.Offset()).
		Find(&torneos).Error; err != nil {
		return nil, 0, err
	}

	result := make([]domain.Torneo, 0, len(torneos))
	for _, t := range torneos {
		result = append(result, toTorneoDomain(t))
	}
	return result, int(total), nil
}
