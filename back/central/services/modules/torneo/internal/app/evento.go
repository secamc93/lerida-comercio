package app

import (
	"context"

	"github.com/secamc93/lerida-comercio/back/central/services/modules/torneo/internal/domain"
)

// GetEventosByPartido obtiene los eventos de un partido del torneo.
func (uc *TorneoUseCase) GetEventosByPartido(ctx context.Context, torneoID, partidoID uint) ([]domain.PartidoEvento, error) {
	if _, err := uc.repository.GetPartidoByID(ctx, torneoID, partidoID); err != nil {
		return nil, err
	}
	return uc.repository.GetEventosByPartido(ctx, partidoID)
}

// CreateEvento crea un evento en un partido del torneo.
func (uc *TorneoUseCase) CreateEvento(ctx context.Context, torneoID uint, dto domain.CreateEventoDTO) (*domain.PartidoEvento, error) {
	if _, err := uc.repository.GetPartidoByID(ctx, torneoID, dto.PartidoID); err != nil {
		return nil, err
	}
	if _, err := uc.repository.GetJugadorByID(ctx, torneoID, dto.JugadorID); err != nil {
		return nil, err
	}
	if _, err := uc.repository.GetEquipoByID(ctx, torneoID, dto.EquipoID); err != nil {
		return nil, err
	}
	uc.log.Info().Uint("partido_id", dto.PartidoID).Str("tipo", dto.Tipo).Msg("Creando evento de partido")
	evento, err := uc.repository.CreateEvento(ctx, dto)
	if err != nil {
		uc.log.Error().Err(err).Msg("Error al crear evento de partido")
		return nil, err
	}
	return evento, nil
}

// DeleteEvento elimina un evento de partido.
func (uc *TorneoUseCase) DeleteEvento(ctx context.Context, id uint) error {
	if _, err := uc.repository.GetEventoByID(ctx, id); err != nil {
		return err
	}
	return uc.repository.DeleteEvento(ctx, id)
}
