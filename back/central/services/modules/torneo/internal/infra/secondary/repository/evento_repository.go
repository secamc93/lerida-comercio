package repository

import (
	"context"
	"errors"

	"github.com/secamc93/lerida-comercio/back/central/services/modules/torneo/internal/domain"
	"github.com/secamc93/lerida-comercio/back/models"
	"gorm.io/gorm"
)

// CreateEvento crea un evento de partido en la base de datos.
func (r *Repository) CreateEvento(ctx context.Context, dto domain.CreateEventoDTO) (*domain.PartidoEvento, error) {
	evento := models.PartidoEvento{
		PartidoID: dto.PartidoID,
		JugadorID: dto.JugadorID,
		EquipoID:  dto.EquipoID,
		Tipo:      dto.Tipo,
		Minuto:    dto.Minuto,
	}
	if err := r.database.Conn(ctx).Create(&evento).Error; err != nil {
		return nil, err
	}
	return r.GetEventoByID(ctx, evento.ID)
}

// DeleteEvento elimina (soft delete) un evento de partido.
func (r *Repository) DeleteEvento(ctx context.Context, id uint) error {
	return r.database.Conn(ctx).
		Where("id = ?", id).
		Delete(&models.PartidoEvento{}).Error
}

// GetEventoByID obtiene un evento de partido por su ID.
func (r *Repository) GetEventoByID(ctx context.Context, id uint) (*domain.PartidoEvento, error) {
	var evento models.PartidoEvento
	err := r.database.Conn(ctx).
		Preload("Jugador").
		Where("id = ?", id).
		First(&evento).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, domain.ErrEventoNoEncontrado
	}
	if err != nil {
		return nil, err
	}
	result := toEventoDomain(evento)
	return &result, nil
}

// GetEventosByPartido obtiene los eventos de un partido.
func (r *Repository) GetEventosByPartido(ctx context.Context, partidoID uint) ([]domain.PartidoEvento, error) {
	var eventos []models.PartidoEvento
	if err := r.database.Conn(ctx).
		Preload("Jugador").
		Where("partido_id = ?", partidoID).
		Order("minuto ASC, id ASC").
		Find(&eventos).Error; err != nil {
		return nil, err
	}
	result := make([]domain.PartidoEvento, 0, len(eventos))
	for _, e := range eventos {
		result = append(result, toEventoDomain(e))
	}
	return result, nil
}
