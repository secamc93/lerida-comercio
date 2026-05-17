package repository

import (
	"context"
	"errors"

	"github.com/secamc93/lerida-comercio/back/central/services/modules/torneo/internal/domain"
	"github.com/secamc93/lerida-comercio/back/models"
	"gorm.io/gorm"
)

// CreateEquipo crea un equipo en la base de datos.
func (r *Repository) CreateEquipo(ctx context.Context, dto domain.CreateEquipoDTO) (*domain.Equipo, error) {
	equipo := models.Equipo{
		TorneoID: dto.TorneoID,
		Name:     dto.Name,
		Color:    dto.Color,
		LogoURL:  dto.LogoURL,
	}
	if err := r.database.Conn(ctx).Create(&equipo).Error; err != nil {
		return nil, err
	}
	result := toEquipoDomain(equipo)
	return &result, nil
}

// UpdateEquipo actualiza un equipo de un torneo.
func (r *Repository) UpdateEquipo(ctx context.Context, torneoID, id uint, dto domain.UpdateEquipoDTO) (*domain.Equipo, error) {
	updates := map[string]any{}
	if dto.Name != nil {
		updates["name"] = *dto.Name
	}
	if dto.Color != nil {
		updates["color"] = *dto.Color
	}
	if dto.LogoURL != nil {
		updates["logo_url"] = *dto.LogoURL
	}
	if len(updates) > 0 {
		if err := r.database.Conn(ctx).Model(&models.Equipo{}).
			Where("id = ? AND torneo_id = ?", id, torneoID).
			Updates(updates).Error; err != nil {
			return nil, err
		}
	}
	return r.GetEquipoByID(ctx, torneoID, id)
}

// DeleteEquipo elimina (soft delete) un equipo de un torneo.
func (r *Repository) DeleteEquipo(ctx context.Context, torneoID, id uint) error {
	return r.database.Conn(ctx).
		Where("id = ? AND torneo_id = ?", id, torneoID).
		Delete(&models.Equipo{}).Error
}

// GetEquipoByID obtiene un equipo por su ID dentro de un torneo.
func (r *Repository) GetEquipoByID(ctx context.Context, torneoID, id uint) (*domain.Equipo, error) {
	var equipo models.Equipo
	err := r.database.Conn(ctx).
		Where("id = ? AND torneo_id = ?", id, torneoID).
		First(&equipo).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, domain.ErrEquipoNoEncontrado
	}
	if err != nil {
		return nil, err
	}
	result := toEquipoDomain(equipo)
	return &result, nil
}

// GetEquipos obtiene la lista paginada de equipos de un torneo.
func (r *Repository) GetEquipos(ctx context.Context, torneoID uint, p domain.PaginationParams) ([]domain.Equipo, int, error) {
	var equipos []models.Equipo
	var total int64

	query := r.database.Conn(ctx).Model(&models.Equipo{}).Where("torneo_id = ?", torneoID)
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := query.Order("name ASC").
		Limit(p.PageSize).Offset(p.Offset()).
		Find(&equipos).Error; err != nil {
		return nil, 0, err
	}

	result := make([]domain.Equipo, 0, len(equipos))
	for _, e := range equipos {
		result = append(result, toEquipoDomain(e))
	}
	return result, int(total), nil
}

// ListEquipos obtiene todos los equipos de un torneo sin paginación.
func (r *Repository) ListEquipos(ctx context.Context, torneoID uint) ([]domain.Equipo, error) {
	var equipos []models.Equipo
	if err := r.database.Conn(ctx).
		Where("torneo_id = ?", torneoID).
		Order("id ASC").
		Find(&equipos).Error; err != nil {
		return nil, err
	}
	result := make([]domain.Equipo, 0, len(equipos))
	for _, e := range equipos {
		result = append(result, toEquipoDomain(e))
	}
	return result, nil
}
