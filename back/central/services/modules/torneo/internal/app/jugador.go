package app

import (
	"context"

	"github.com/secamc93/lerida-comercio/back/central/services/modules/torneo/internal/domain"
)

// CreateJugador crea un jugador en un equipo del torneo.
func (uc *TorneoUseCase) CreateJugador(ctx context.Context, dto domain.CreateJugadorDTO) (*domain.Jugador, error) {
	// El equipo debe pertenecer al mismo torneo.
	if _, err := uc.repository.GetEquipoByID(ctx, dto.TorneoID, dto.EquipoID); err != nil {
		return nil, err
	}
	uc.log.Info().Uint("torneo_id", dto.TorneoID).Str("name", dto.Name).Msg("Creando jugador")
	jugador, err := uc.repository.CreateJugador(ctx, dto)
	if err != nil {
		uc.log.Error().Err(err).Msg("Error al crear jugador")
		return nil, err
	}
	return jugador, nil
}

// UpdateJugador actualiza un jugador del torneo.
func (uc *TorneoUseCase) UpdateJugador(ctx context.Context, torneoID, id uint, dto domain.UpdateJugadorDTO) (*domain.Jugador, error) {
	if _, err := uc.repository.GetJugadorByID(ctx, torneoID, id); err != nil {
		return nil, err
	}
	if dto.EquipoID != nil {
		if _, err := uc.repository.GetEquipoByID(ctx, torneoID, *dto.EquipoID); err != nil {
			return nil, err
		}
	}
	jugador, err := uc.repository.UpdateJugador(ctx, torneoID, id, dto)
	if err != nil {
		uc.log.Error().Err(err).Uint("jugador_id", id).Msg("Error al actualizar jugador")
		return nil, err
	}
	return jugador, nil
}

// DeleteJugador elimina un jugador del torneo.
func (uc *TorneoUseCase) DeleteJugador(ctx context.Context, torneoID, id uint) error {
	if _, err := uc.repository.GetJugadorByID(ctx, torneoID, id); err != nil {
		return err
	}
	return uc.repository.DeleteJugador(ctx, torneoID, id)
}

// GetJugadorByID obtiene un jugador por su ID.
func (uc *TorneoUseCase) GetJugadorByID(ctx context.Context, torneoID, id uint) (*domain.Jugador, error) {
	return uc.repository.GetJugadorByID(ctx, torneoID, id)
}

// GetJugadores obtiene la lista paginada de jugadores del torneo.
func (uc *TorneoUseCase) GetJugadores(ctx context.Context, filters domain.JugadorFilters, p domain.PaginationParams) (domain.PaginatedResponse[domain.Jugador], error) {
	p.Normalize()
	jugadores, total, err := uc.repository.GetJugadores(ctx, filters, p)
	if err != nil {
		uc.log.Error().Err(err).Msg("Error al listar jugadores")
		return domain.PaginatedResponse[domain.Jugador]{}, err
	}
	return domain.NewPaginatedResponse(jugadores, total, p.Page, p.PageSize), nil
}
