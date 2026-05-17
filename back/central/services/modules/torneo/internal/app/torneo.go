package app

import (
	"context"

	"github.com/secamc93/lerida-comercio/back/central/services/modules/torneo/internal/domain"
)

// CreateTorneo crea un torneo para un negocio.
func (uc *TorneoUseCase) CreateTorneo(ctx context.Context, dto domain.CreateTorneoDTO) (*domain.Torneo, error) {
	uc.log.Info().Uint("business_id", dto.BusinessID).Str("name", dto.Name).Msg("Creando torneo")
	torneo, err := uc.repository.CreateTorneo(ctx, dto)
	if err != nil {
		uc.log.Error().Err(err).Msg("Error al crear torneo")
		return nil, err
	}
	return torneo, nil
}

// UpdateTorneo actualiza un torneo.
func (uc *TorneoUseCase) UpdateTorneo(ctx context.Context, id uint, dto domain.UpdateTorneoDTO) (*domain.Torneo, error) {
	if _, err := uc.repository.GetTorneoByID(ctx, id); err != nil {
		return nil, err
	}
	torneo, err := uc.repository.UpdateTorneo(ctx, id, dto)
	if err != nil {
		uc.log.Error().Err(err).Uint("torneo_id", id).Msg("Error al actualizar torneo")
		return nil, err
	}
	return torneo, nil
}

// DeleteTorneo elimina un torneo.
func (uc *TorneoUseCase) DeleteTorneo(ctx context.Context, id uint) error {
	if _, err := uc.repository.GetTorneoByID(ctx, id); err != nil {
		return err
	}
	return uc.repository.DeleteTorneo(ctx, id)
}

// GetTorneoByID obtiene un torneo por su ID.
func (uc *TorneoUseCase) GetTorneoByID(ctx context.Context, id uint) (*domain.Torneo, error) {
	return uc.repository.GetTorneoByID(ctx, id)
}

// GetTorneos obtiene la lista paginada de torneos de un negocio.
func (uc *TorneoUseCase) GetTorneos(ctx context.Context, businessID uint, p domain.PaginationParams) (domain.PaginatedResponse[domain.Torneo], error) {
	p.Normalize()
	torneos, total, err := uc.repository.GetTorneos(ctx, businessID, p)
	if err != nil {
		uc.log.Error().Err(err).Msg("Error al listar torneos")
		return domain.PaginatedResponse[domain.Torneo]{}, err
	}
	return domain.NewPaginatedResponse(torneos, total, p.Page, p.PageSize), nil
}
