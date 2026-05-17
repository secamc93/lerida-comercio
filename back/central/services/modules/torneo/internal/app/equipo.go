package app

import (
	"context"

	"github.com/secamc93/lerida-comercio/back/central/services/modules/torneo/internal/domain"
)

// CreateEquipo crea un equipo en el torneo.
func (uc *TorneoUseCase) CreateEquipo(ctx context.Context, dto domain.CreateEquipoDTO) (*domain.Equipo, error) {
	uc.log.Info().Uint("torneo_id", dto.TorneoID).Str("name", dto.Name).Msg("Creando equipo")
	equipo, err := uc.repository.CreateEquipo(ctx, dto)
	if err != nil {
		uc.log.Error().Err(err).Msg("Error al crear equipo")
		return nil, err
	}
	return equipo, nil
}

// UpdateEquipo actualiza un equipo del torneo.
func (uc *TorneoUseCase) UpdateEquipo(ctx context.Context, torneoID, id uint, dto domain.UpdateEquipoDTO) (*domain.Equipo, error) {
	if _, err := uc.repository.GetEquipoByID(ctx, torneoID, id); err != nil {
		return nil, err
	}
	equipo, err := uc.repository.UpdateEquipo(ctx, torneoID, id, dto)
	if err != nil {
		uc.log.Error().Err(err).Uint("equipo_id", id).Msg("Error al actualizar equipo")
		return nil, err
	}
	return equipo, nil
}

// DeleteEquipo elimina un equipo del torneo.
func (uc *TorneoUseCase) DeleteEquipo(ctx context.Context, torneoID, id uint) error {
	if _, err := uc.repository.GetEquipoByID(ctx, torneoID, id); err != nil {
		return err
	}
	return uc.repository.DeleteEquipo(ctx, torneoID, id)
}

// GetEquipoByID obtiene un equipo por su ID.
func (uc *TorneoUseCase) GetEquipoByID(ctx context.Context, torneoID, id uint) (*domain.Equipo, error) {
	return uc.repository.GetEquipoByID(ctx, torneoID, id)
}

// GetEquipos obtiene la lista paginada de equipos del torneo.
func (uc *TorneoUseCase) GetEquipos(ctx context.Context, torneoID uint, p domain.PaginationParams) (domain.PaginatedResponse[domain.Equipo], error) {
	p.Normalize()
	equipos, total, err := uc.repository.GetEquipos(ctx, torneoID, p)
	if err != nil {
		uc.log.Error().Err(err).Msg("Error al listar equipos")
		return domain.PaginatedResponse[domain.Equipo]{}, err
	}
	return domain.NewPaginatedResponse(equipos, total, p.Page, p.PageSize), nil
}
