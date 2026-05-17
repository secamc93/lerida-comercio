package domain

import "context"

// ITorneoRepository define el puerto de persistencia del módulo de torneo.
type ITorneoRepository interface {
	// Torneos
	CreateTorneo(ctx context.Context, dto CreateTorneoDTO) (*Torneo, error)
	UpdateTorneo(ctx context.Context, id uint, dto UpdateTorneoDTO) (*Torneo, error)
	DeleteTorneo(ctx context.Context, id uint) error
	GetTorneoByID(ctx context.Context, id uint) (*Torneo, error)
	GetTorneos(ctx context.Context, businessID uint, p PaginationParams) ([]Torneo, int, error)

	// Equipos
	CreateEquipo(ctx context.Context, dto CreateEquipoDTO) (*Equipo, error)
	UpdateEquipo(ctx context.Context, torneoID, id uint, dto UpdateEquipoDTO) (*Equipo, error)
	DeleteEquipo(ctx context.Context, torneoID, id uint) error
	GetEquipoByID(ctx context.Context, torneoID, id uint) (*Equipo, error)
	GetEquipos(ctx context.Context, torneoID uint, p PaginationParams) ([]Equipo, int, error)
	ListEquipos(ctx context.Context, torneoID uint) ([]Equipo, error)

	// Jugadores
	CreateJugador(ctx context.Context, dto CreateJugadorDTO) (*Jugador, error)
	UpdateJugador(ctx context.Context, torneoID, id uint, dto UpdateJugadorDTO) (*Jugador, error)
	DeleteJugador(ctx context.Context, torneoID, id uint) error
	GetJugadorByID(ctx context.Context, torneoID, id uint) (*Jugador, error)
	GetJugadores(ctx context.Context, filters JugadorFilters, p PaginationParams) ([]Jugador, int, error)

	// Partidos
	CreatePartido(ctx context.Context, dto CreatePartidoDTO) (*Partido, error)
	UpdatePartido(ctx context.Context, torneoID, id uint, dto UpdatePartidoDTO) (*Partido, error)
	DeletePartido(ctx context.Context, torneoID, id uint) error
	GetPartidoByID(ctx context.Context, torneoID, id uint) (*Partido, error)
	GetPartidos(ctx context.Context, filters PartidoFilters, p PaginationParams) ([]Partido, int, error)
	SetResultado(ctx context.Context, torneoID, id uint, dto ResultadoPartidoDTO) (*Partido, error)
	DeletePartidosNoJugados(ctx context.Context, torneoID uint) error
	CountPartidosJugados(ctx context.Context, torneoID uint) (int, error)
	CreatePartidos(ctx context.Context, partidos []CreatePartidoDTO) ([]Partido, error)

	// Eventos
	CreateEvento(ctx context.Context, dto CreateEventoDTO) (*PartidoEvento, error)
	DeleteEvento(ctx context.Context, id uint) error
	GetEventoByID(ctx context.Context, id uint) (*PartidoEvento, error)
	GetEventosByPartido(ctx context.Context, partidoID uint) ([]PartidoEvento, error)

	// Calculados
	GetTablaPosiciones(ctx context.Context, torneoID uint) ([]TablaPosicion, error)
	GetGoleadores(ctx context.Context, torneoID uint) ([]Goleador, error)
}
