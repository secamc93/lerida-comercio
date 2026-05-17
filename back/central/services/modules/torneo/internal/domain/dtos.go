package domain

// PaginationParams parámetros de paginación de entrada.
type PaginationParams struct {
	Page     int
	PageSize int
}

// Normalize aplica los valores por defecto y límites.
func (p *PaginationParams) Normalize() {
	if p.Page < 1 {
		p.Page = 1
	}
	if p.PageSize < 1 {
		p.PageSize = 10
	}
	if p.PageSize > 100 {
		p.PageSize = 100
	}
}

// Offset calcula el offset para la consulta.
func (p PaginationParams) Offset() int {
	return (p.Page - 1) * p.PageSize
}

// PaginatedResponse respuesta paginada genérica.
type PaginatedResponse[T any] struct {
	Data       []T `json:"data"`
	Total      int `json:"total"`
	Page       int `json:"page"`
	PageSize   int `json:"page_size"`
	TotalPages int `json:"total_pages"`
}

// NewPaginatedResponse construye una respuesta paginada calculando total_pages.
func NewPaginatedResponse[T any](data []T, total, page, pageSize int) PaginatedResponse[T] {
	if data == nil {
		data = []T{}
	}
	totalPages := 0
	if pageSize > 0 {
		totalPages = (total + pageSize - 1) / pageSize
	}
	return PaginatedResponse[T]{
		Data:       data,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}
}

// --- Torneo ---

type CreateTorneoDTO struct {
	BusinessID  uint
	Name        string
	Description string
	Season      string
}

type UpdateTorneoDTO struct {
	Name        *string
	Description *string
	Season      *string
	IsActive    *bool
}

// --- Equipo ---

type CreateEquipoDTO struct {
	TorneoID uint
	Name     string
	Color    string
	LogoURL  string
}

type UpdateEquipoDTO struct {
	Name    *string
	Color   *string
	LogoURL *string
}

// --- Jugador ---

type JugadorFilters struct {
	TorneoID uint
	EquipoID *uint
}

type CreateJugadorDTO struct {
	TorneoID uint
	EquipoID uint
	Name     string
	Position string
	Number   int
}

type UpdateJugadorDTO struct {
	EquipoID *uint
	Name     *string
	Position *string
	Number   *int
}

// --- Partido ---

type PartidoFilters struct {
	TorneoID uint
	Jornada  *int
}

type CreatePartidoDTO struct {
	TorneoID       uint
	Jornada        int
	LocalEquipoID  uint
	VisitaEquipoID uint
}

type UpdatePartidoDTO struct {
	Jornada        *int
	LocalEquipoID  *uint
	VisitaEquipoID *uint
}

type ResultadoPartidoDTO struct {
	GolLocal  int
	GolVisita int
}

// --- Evento ---

type CreateEventoDTO struct {
	PartidoID uint
	JugadorID uint
	EquipoID  uint
	Tipo      string
	Minuto    int
}
