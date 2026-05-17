package app

import (
	"context"

	"github.com/secamc93/lerida-comercio/back/central/services/modules/torneo/internal/domain"
	"github.com/secamc93/lerida-comercio/back/central/shared/log"
)

// IUseCaseTorneo define los casos de uso del módulo de torneo.
type IUseCaseTorneo interface {
	// Torneos
	CreateTorneo(ctx context.Context, dto domain.CreateTorneoDTO) (*domain.Torneo, error)
	UpdateTorneo(ctx context.Context, id uint, dto domain.UpdateTorneoDTO) (*domain.Torneo, error)
	DeleteTorneo(ctx context.Context, id uint) error
	GetTorneoByID(ctx context.Context, id uint) (*domain.Torneo, error)
	GetTorneos(ctx context.Context, businessID uint, p domain.PaginationParams) (domain.PaginatedResponse[domain.Torneo], error)

	// Equipos
	CreateEquipo(ctx context.Context, dto domain.CreateEquipoDTO) (*domain.Equipo, error)
	UpdateEquipo(ctx context.Context, torneoID, id uint, dto domain.UpdateEquipoDTO) (*domain.Equipo, error)
	DeleteEquipo(ctx context.Context, torneoID, id uint) error
	GetEquipoByID(ctx context.Context, torneoID, id uint) (*domain.Equipo, error)
	GetEquipos(ctx context.Context, torneoID uint, p domain.PaginationParams) (domain.PaginatedResponse[domain.Equipo], error)

	// Jugadores
	CreateJugador(ctx context.Context, dto domain.CreateJugadorDTO) (*domain.Jugador, error)
	UpdateJugador(ctx context.Context, torneoID, id uint, dto domain.UpdateJugadorDTO) (*domain.Jugador, error)
	DeleteJugador(ctx context.Context, torneoID, id uint) error
	GetJugadorByID(ctx context.Context, torneoID, id uint) (*domain.Jugador, error)
	GetJugadores(ctx context.Context, filters domain.JugadorFilters, p domain.PaginationParams) (domain.PaginatedResponse[domain.Jugador], error)

	// Partidos
	CreatePartido(ctx context.Context, dto domain.CreatePartidoDTO) (*domain.Partido, error)
	UpdatePartido(ctx context.Context, torneoID, id uint, dto domain.UpdatePartidoDTO) (*domain.Partido, error)
	DeletePartido(ctx context.Context, torneoID, id uint) error
	GetPartidoByID(ctx context.Context, torneoID, id uint) (*domain.Partido, error)
	GetPartidos(ctx context.Context, filters domain.PartidoFilters, p domain.PaginationParams) (domain.PaginatedResponse[domain.Partido], error)
	SetResultado(ctx context.Context, torneoID, id uint, dto domain.ResultadoPartidoDTO) (*domain.Partido, error)

	// Eventos
	GetEventosByPartido(ctx context.Context, torneoID, partidoID uint) ([]domain.PartidoEvento, error)
	CreateEvento(ctx context.Context, torneoID uint, dto domain.CreateEventoDTO) (*domain.PartidoEvento, error)
	DeleteEvento(ctx context.Context, id uint) error

	// Calculados
	GetTablaPosiciones(ctx context.Context, torneoID uint) ([]domain.TablaPosicion, error)
	GetGoleadores(ctx context.Context, torneoID uint) ([]domain.Goleador, error)
	GenerarFixture(ctx context.Context, torneoID uint) ([]domain.Partido, error)
}

// TorneoUseCase implementa los casos de uso del módulo de torneo.
type TorneoUseCase struct {
	repository domain.ITorneoRepository
	log        log.ILogger
}

// New crea una nueva instancia del caso de uso de torneo.
func New(repository domain.ITorneoRepository, logger log.ILogger) IUseCaseTorneo {
	return &TorneoUseCase{
		repository: repository,
		log:        logger,
	}
}
