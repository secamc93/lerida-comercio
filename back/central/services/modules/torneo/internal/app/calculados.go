package app

import (
	"context"

	"github.com/secamc93/lerida-comercio/back/central/services/modules/torneo/internal/domain"
)

// GetTablaPosiciones obtiene la tabla de posiciones calculada del torneo.
func (uc *TorneoUseCase) GetTablaPosiciones(ctx context.Context, torneoID uint) ([]domain.TablaPosicion, error) {
	tabla, err := uc.repository.GetTablaPosiciones(ctx, torneoID)
	if err != nil {
		uc.log.Error().Err(err).Uint("torneo_id", torneoID).Msg("Error al calcular tabla de posiciones")
		return nil, err
	}
	return tabla, nil
}

// GetGoleadores obtiene el ranking de goleadores calculado del torneo.
func (uc *TorneoUseCase) GetGoleadores(ctx context.Context, torneoID uint) ([]domain.Goleador, error) {
	goleadores, err := uc.repository.GetGoleadores(ctx, torneoID)
	if err != nil {
		uc.log.Error().Err(err).Uint("torneo_id", torneoID).Msg("Error al calcular goleadores")
		return nil, err
	}
	return goleadores, nil
}

// GenerarFixture genera el fixture round-robin (todos contra todos, ida) del torneo.
//
// Decisión: si ya existen partidos jugados se aborta con error para no perder
// resultados registrados. Si solo existen partidos sin jugar, se borran y se
// regenera el fixture completo.
func (uc *TorneoUseCase) GenerarFixture(ctx context.Context, torneoID uint) ([]domain.Partido, error) {
	jugados, err := uc.repository.CountPartidosJugados(ctx, torneoID)
	if err != nil {
		return nil, err
	}
	if jugados > 0 {
		return nil, domain.ErrFixtureExistente
	}

	equipos, err := uc.repository.ListEquipos(ctx, torneoID)
	if err != nil {
		return nil, err
	}
	if len(equipos) < 2 {
		return nil, domain.ErrEquiposInsuficientes
	}

	// Borrar partidos previos no jugados antes de regenerar.
	if err := uc.repository.DeletePartidosNoJugados(ctx, torneoID); err != nil {
		return nil, err
	}

	partidos := buildRoundRobin(torneoID, equipos)

	uc.log.Info().
		Uint("torneo_id", torneoID).
		Int("equipos", len(equipos)).
		Int("partidos", len(partidos)).
		Msg("Generando fixture round-robin")

	return uc.repository.CreatePartidos(ctx, partidos)
}

// buildRoundRobin genera un calendario todos-contra-todos (una vuelta) usando
// el algoritmo del círculo. Si el número de equipos es impar se añade un
// equipo fantasma (ID 0) cuyos enfrentamientos representan descansos y se
// descartan.
func buildRoundRobin(torneoID uint, equipos []domain.Equipo) []domain.CreatePartidoDTO {
	ids := make([]uint, 0, len(equipos))
	for _, e := range equipos {
		ids = append(ids, e.ID)
	}

	bye := false
	if len(ids)%2 != 0 {
		ids = append(ids, 0) // equipo fantasma (descanso)
		bye = true
	}

	n := len(ids)
	rondas := n - 1
	mitad := n / 2

	partidos := make([]domain.CreatePartidoDTO, 0, rondas*mitad)
	// Copia rotativa de los equipos excepto el primero (fijo).
	arr := make([]uint, n)
	copy(arr, ids)

	for r := 0; r < rondas; r++ {
		jornada := r + 1
		for i := 0; i < mitad; i++ {
			local := arr[i]
			visita := arr[n-1-i]
			if bye && (local == 0 || visita == 0) {
				continue // descanso
			}
			// Alternar localía por jornada para repartir local/visitante.
			if r%2 == 1 {
				local, visita = visita, local
			}
			partidos = append(partidos, domain.CreatePartidoDTO{
				TorneoID:       torneoID,
				Jornada:        jornada,
				LocalEquipoID:  local,
				VisitaEquipoID: visita,
			})
		}
		// Rotación: fijar arr[0], rotar el resto en sentido horario.
		last := arr[n-1]
		copy(arr[2:], arr[1:n-1])
		arr[1] = last
	}

	return partidos
}
