package request

// --- Torneo ---

type CreateTorneoRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	Season      string `json:"season"`
}

type UpdateTorneoRequest struct {
	Name        *string `json:"name"`
	Description *string `json:"description"`
	Season      *string `json:"season"`
	IsActive    *bool   `json:"is_active"`
}

// --- Equipo ---

type CreateEquipoRequest struct {
	Name    string `json:"name" binding:"required"`
	Color   string `json:"color"`
	LogoURL string `json:"logo_url"`
}

type UpdateEquipoRequest struct {
	Name    *string `json:"name"`
	Color   *string `json:"color"`
	LogoURL *string `json:"logo_url"`
}

// --- Jugador ---

type CreateJugadorRequest struct {
	Name     string `json:"name" binding:"required"`
	EquipoID uint   `json:"equipo_id" binding:"required"`
	Position string `json:"position"`
	Number   int    `json:"number"`
}

type UpdateJugadorRequest struct {
	Name     *string `json:"name"`
	EquipoID *uint   `json:"equipo_id"`
	Position *string `json:"position"`
	Number   *int    `json:"number"`
}

// --- Partido ---

type CreatePartidoRequest struct {
	Jornada        int  `json:"jornada" binding:"required"`
	LocalEquipoID  uint `json:"local_equipo_id" binding:"required"`
	VisitaEquipoID uint `json:"visita_equipo_id" binding:"required"`
}

type UpdatePartidoRequest struct {
	Jornada        *int  `json:"jornada"`
	LocalEquipoID  *uint `json:"local_equipo_id"`
	VisitaEquipoID *uint `json:"visita_equipo_id"`
}

type ResultadoPartidoRequest struct {
	GolLocal  int `json:"gol_local"`
	GolVisita int `json:"gol_visita"`
}

// --- Evento ---

type CreateEventoRequest struct {
	JugadorID uint   `json:"jugador_id" binding:"required"`
	EquipoID  uint   `json:"equipo_id" binding:"required"`
	Tipo      string `json:"tipo" binding:"required"`
	Minuto    int    `json:"minuto"`
}
