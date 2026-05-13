package models

import (
	"time"

	"gorm.io/gorm"
)

// ===== DIRECTORIO DE COMERCIOS =====

type Categoria struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Slug      string         `gorm:"size:50;uniqueIndex;not null" json:"slug"`
	Nombre    string         `gorm:"size:80;not null" json:"nombre"`
	Icon      string         `gorm:"size:10" json:"icon"`
	Color     string         `gorm:"size:20" json:"color"`
	Orden     int            `gorm:"default:0" json:"orden"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	Comercios []Comercio `gorm:"foreignKey:CategoriaID" json:"comercios,omitempty"`
}

func (Categoria) TableName() string { return "categorias" }

type Comercio struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Nombre      string         `gorm:"size:150;not null" json:"nombre"`
	CategoriaID uint           `gorm:"not null;index" json:"categoria_id"`
	Icon        string         `gorm:"size:10" json:"icon"`
	Descripcion string         `gorm:"type:text" json:"descripcion"`
	Direccion   string         `gorm:"size:200" json:"direccion"`
	Telefono    string         `gorm:"size:40" json:"telefono"`
	Horario     string         `gorm:"size:120" json:"horario"`
	Rating      int            `gorm:"default:5" json:"rating"`
	Activo      bool           `gorm:"default:true" json:"activo"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	Categoria *Categoria `gorm:"foreignKey:CategoriaID" json:"categoria,omitempty"`
}

// ===== AUTH =====

type Admin struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	Username   string    `gorm:"size:50;uniqueIndex;not null" json:"username"`
	PasswordHash string  `gorm:"size:255;not null" json:"-"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// ===== TORNEO =====

type Equipo struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Nombre    string    `gorm:"size:80;uniqueIndex;not null" json:"nombre"`
	Color     string    `gorm:"size:20" json:"color"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	Jugadores []Jugador `gorm:"foreignKey:EquipoID" json:"jugadores,omitempty"`
}

type Jugador struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	Username     string         `gorm:"size:50;uniqueIndex;not null" json:"username"`
	PasswordHash string         `gorm:"size:255;not null" json:"-"`
	Nombre       string         `gorm:"size:120;not null" json:"nombre"`
	EquipoID     uint           `gorm:"not null;index" json:"equipo_id"`
	Posicion     string         `gorm:"size:20;not null" json:"posicion"` // portero|defensa|medio|delantero
	Dorsal       int            `gorm:"not null" json:"dorsal"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`

	Equipo *Equipo `gorm:"foreignKey:EquipoID" json:"equipo,omitempty"`
	Stats  *JugadorStats `gorm:"foreignKey:JugadorID" json:"stats,omitempty"`
}

// Restricción única dorsal por equipo
// (se aplica con tags adicionales en CreateTable; lo dejamos como índice compuesto)
func (Jugador) TableName() string { return "jugadores" }

type Partido struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	Jornada        int       `gorm:"not null;index" json:"jornada"`
	OrdenJornada   int       `gorm:"not null" json:"orden_jornada"`
	LocalEquipoID  uint      `gorm:"not null;index" json:"local_equipo_id"`
	VisitaEquipoID uint      `gorm:"not null;index" json:"visita_equipo_id"`
	GolLocal       *int      `json:"gol_local"`
	GolVisita      *int      `json:"gol_visita"`
	Jugado         bool      `gorm:"default:false" json:"jugado"`
	Fecha          *time.Time `json:"fecha"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`

	Local  *Equipo `gorm:"foreignKey:LocalEquipoID" json:"local,omitempty"`
	Visita *Equipo `gorm:"foreignKey:VisitaEquipoID" json:"visita,omitempty"`
}

type JugadorStats struct {
	JugadorID   uint      `gorm:"primaryKey" json:"jugador_id"`
	Goles       int       `gorm:"default:0" json:"goles"`
	Asistencias int       `gorm:"default:0" json:"asistencias"`
	Amarillas   int       `gorm:"default:0" json:"amarillas"`
	Rojas       int       `gorm:"default:0" json:"rojas"`
	Partidos    int       `gorm:"default:0" json:"partidos"`
	UpdatedAt   time.Time `json:"updated_at"`

	Jugador *Jugador `gorm:"foreignKey:JugadorID" json:"-"`
}
