package domain

import "time"

// Torneo es una competición de fútbol 8 organizada por un negocio.
type Torneo struct {
	ID          uint
	BusinessID  uint
	Name        string
	Description string
	Season      string
	IsActive    bool
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// Equipo es un equipo participante de un torneo.
type Equipo struct {
	ID        uint
	TorneoID  uint
	Name      string
	Color     string
	LogoURL   string
	CreatedAt time.Time
	UpdatedAt time.Time
}

// Jugador es un jugador inscrito en un equipo.
type Jugador struct {
	ID         uint
	TorneoID   uint
	EquipoID   uint
	EquipoName string
	Name       string
	Position   string
	Number     int
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

// PartidoEvento es un suceso dentro de un partido (gol, asistencia, tarjeta).
type PartidoEvento struct {
	ID          uint
	PartidoID   uint
	JugadorID   uint
	JugadorName string
	EquipoID    uint
	Tipo        string
	Minuto      int
	CreatedAt   time.Time
}

// Partido es un encuentro entre dos equipos en una jornada.
type Partido struct {
	ID               uint
	TorneoID         uint
	Jornada          int
	LocalEquipoID    uint
	LocalEquipoName  string
	VisitaEquipoID   uint
	VisitaEquipoName string
	GolLocal         *int
	GolVisita        *int
	Jugado           bool
	Eventos          []PartidoEvento
	CreatedAt        time.Time
	UpdatedAt        time.Time
}

// TablaPosicion es una fila de la tabla de posiciones calculada.
type TablaPosicion struct {
	EquipoID   uint
	EquipoName string
	Color      string
	PJ         int // partidos jugados
	PG         int // ganados
	PE         int // empatados
	PP         int // perdidos
	GF         int // goles a favor
	GC         int // goles en contra
	DG         int // diferencia de gol
	Pts        int // puntos
}

// Goleador es una fila del ranking de goleadores calculado.
type Goleador struct {
	JugadorID    uint
	JugadorName  string
	EquipoID     uint
	EquipoName   string
	Goles        int
	Asistencias  int
	Amarillas    int
	Rojas        int
}
