package app

import (
	"context"

	"github.com/secamc93/lerida-comercio/back/central/services/modules/torneo/internal/domain"
)

// CreatePartido crea un partido entre dos equipos del torneo.
func (uc *TorneoUseCase) CreatePartido(ctx context.Context, dto domain.CreatePartidoDTO) (*domain.Partido, error) {
	if _, err := uc.repository.GetEquipoByID(ctx, dto.TorneoID, dto.LocalEquipoID); err != nil {
		return nil, err
	}
	if _, err := uc.repository.GetEquipoByID(ctx, dto.TorneoID, dto.VisitaEquipoID); err != nil {
		return nil, err
	}
	uc.log.Info().Uint("torneo_id", dto.TorneoID).Int("jornada", dto.Jornada).Msg("Creando partido")
	partido, err := uc.repository.CreatePartido(ctx, dto)
	if err != nil {
		uc.log.Error().Err(err).Msg("Error al crear partido")
		return nil, err
	}
	return partido, nil
}

// UpdatePartido actualiza un partido del torneo.
func (uc *TorneoUseCase) UpdatePartido(ctx context.Context, torneoID, id uint, dto domain.UpdatePartidoDTO) (*domain.Partido, error) {
	if _, err := uc.repository.GetPartidoByID(ctx, torneoID, id); err != nil {
		return nil, err
	}
	if dto.LocalEquipoID != nil {
		if _, err := uc.repository.GetEquipoByID(ctx, torneoID, *dto.LocalEquipoID); err != nil {
			return nil, err
		}
	}
	if dto.VisitaEquipoID != nil {
		if _, err := uc.repository.GetEquipoByID(ctx, torneoID, *dto.VisitaEquipoID); err != nil {
			return nil, err
		}
	}
	partido, err := uc.repository.UpdatePartido(ctx, torneoID, id, dto)
	if err != nil {
		uc.log.Error().Err(err).Uint("partido_id", id).Msg("Error al actualizar partido")
		return nil, err
	}
	return partido, nil
}

// DeletePartido elimina un partido del torneo.
func (uc *TorneoUseCase) DeletePartido(ctx context.Context, torneoID, id uint) error {
	if _, err := uc.repository.GetPartidoByID(ctx, torneoID, id); err != nil {
		return err
	}
	return uc.repository.DeletePartido(ctx, torneoID, id)
}

// GetPartidoByID obtiene un partido (con equipos y eventos) por su ID.
func (uc *TorneoUseCase) GetPartidoByID(ctx context.Context, torneoID, id uint) (*domain.Partido, error) {
	return uc.repository.GetPartidoByID(ctx, torneoID, id)
}

// GetPartidos obtiene la lista paginada de partidos del torneo.
func (uc *TorneoUseCase) GetPartidos(ctx context.Context, filters domain.PartidoFilters, p domain.PaginationParams) (domain.PaginatedResponse[domain.Partido], error) {
	p.Normalize()
	partidos, total, err := uc.repository.GetPartidos(ctx, filters, p)
	if err != nil {
		uc.log.Error().Err(err).Msg("Error al listar partidos")
		return domain.PaginatedResponse[domain.Partido]{}, err
	}
	return domain.NewPaginatedResponse(partidos, total, p.Page, p.PageSize), nil
}

// SetResultado registra el resultado de un partido y lo marca como jugado.
func (uc *TorneoUseCase) SetResultado(ctx context.Context, torneoID, id uint, dto domain.ResultadoPartidoDTO) (*domain.Partido, error) {
	if _, err := uc.repository.GetPartidoByID(ctx, torneoID, id); err != nil {
		return nil, err
	}
	partido, err := uc.repository.SetResultado(ctx, torneoID, id, dto)
	if err != nil {
		uc.log.Error().Err(err).Uint("partido_id", id).Msg("Error al registrar resultado")
		return nil, err
	}
	return partido, nil
}
