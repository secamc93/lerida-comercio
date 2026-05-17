package models

import "gorm.io/gorm"

// ====================================================================
//  TORNEO — Torneo de fútbol 8
//
//  Un Torneo NO es un tipo de negocio: es una entidad que pertenece a
//  un Business. Cualquier negocio puede organizar uno o varios torneos.
//  Equipos, jugadores y partidos cuelgan de un TorneoID.
//  Las estadísticas de jugador se CALCULAN a partir de PartidoEvento.
// ====================================================================

// Torneo es una competición organizada por un negocio.
type Torneo struct {
	gorm.Model
	BusinessID  uint   `gorm:"not null;index"` // negocio organizador
	Name        string `gorm:"size:120;not null"`
	Description string `gorm:"size:500"`
	Season      string `gorm:"size:40"` // temporada, p. ej. "Apertura 2026"
	IsActive    bool   `gorm:"default:true"`

	Business Business `gorm:"foreignKey:BusinessID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Equipos  []Equipo `gorm:"foreignKey:TorneoID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

func (Torneo) TableName() string { return "torneo" }

// Equipo es un equipo participante de un torneo.
type Equipo struct {
	gorm.Model
	TorneoID uint   `gorm:"not null;index"`
	Name     string `gorm:"size:80;not null"`
	Color    string `gorm:"size:7;default:'#10b981'"`
	LogoURL  string `gorm:"size:255"`

	Torneo    Torneo    `gorm:"foreignKey:TorneoID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Jugadores []Jugador `gorm:"foreignKey:EquipoID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

func (Equipo) TableName() string { return "equipo" }

// Jugador es un jugador inscrito en un equipo de un torneo.
type Jugador struct {
	gorm.Model
	TorneoID uint   `gorm:"not null;index"`
	EquipoID uint   `gorm:"not null;index"`
	Name     string `gorm:"size:120;not null"`
	Position string `gorm:"size:20"`   // portero | defensa | medio | delantero
	Number   int    `gorm:"default:0"` // dorsal

	Equipo Equipo `gorm:"foreignKey:EquipoID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

func (Jugador) TableName() string { return "jugador" }

// Partido es un encuentro entre dos equipos en una jornada.
type Partido struct {
	gorm.Model
	TorneoID       uint `gorm:"not null;index"`
	Jornada        int  `gorm:"not null;index"`
	LocalEquipoID  uint `gorm:"not null;index"`
	VisitaEquipoID uint `gorm:"not null;index"`
	GolLocal       *int // nil mientras no se haya jugado
	GolVisita      *int
	Jugado         bool `gorm:"default:false;index"`

	LocalEquipo  Equipo          `gorm:"foreignKey:LocalEquipoID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
	VisitaEquipo Equipo          `gorm:"foreignKey:VisitaEquipoID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
	Eventos      []PartidoEvento `gorm:"foreignKey:PartidoID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

func (Partido) TableName() string { return "partido" }

// PartidoEvento es un suceso dentro de un partido (gol, asistencia,
// tarjeta). Las estadísticas de jugador se derivan de esta tabla.
type PartidoEvento struct {
	gorm.Model
	PartidoID uint   `gorm:"not null;index"`
	JugadorID uint   `gorm:"not null;index"`
	EquipoID  uint   `gorm:"not null;index"`
	Tipo      string `gorm:"size:20;not null"` // gol | asistencia | amarilla | roja
	Minuto    int    `gorm:"default:0"`

	Jugador Jugador `gorm:"foreignKey:JugadorID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

func (PartidoEvento) TableName() string { return "partido_evento" }
