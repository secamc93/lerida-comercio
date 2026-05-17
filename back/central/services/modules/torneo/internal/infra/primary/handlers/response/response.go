package response

// TorneoResponse representa un torneo en las respuestas HTTP.
type TorneoResponse struct {
	ID          uint   `json:"id"`
	BusinessID  uint   `json:"business_id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Season      string `json:"season"`
	IsActive    bool   `json:"is_active"`
}

// EquipoResponse representa un equipo en las respuestas HTTP.
type EquipoResponse struct {
	ID       uint   `json:"id"`
	TorneoID uint   `json:"torneo_id"`
	Name     string `json:"name"`
	Color    string `json:"color"`
	LogoURL  string `json:"logo_url"`
}

// JugadorResponse representa un jugador en las respuestas HTTP.
type JugadorResponse struct {
	ID         uint   `json:"id"`
	TorneoID   uint   `json:"torneo_id"`
	EquipoID   uint   `json:"equipo_id"`
	EquipoName string `json:"equipo_name"`
	Name       string `json:"name"`
	Position   string `json:"position"`
	Number     int    `json:"number"`
}

// EventoResponse representa un evento de partido en las respuestas HTTP.
type EventoResponse struct {
	ID          uint   `json:"id"`
	PartidoID   uint   `json:"partido_id"`
	JugadorID   uint   `json:"jugador_id"`
	JugadorName string `json:"jugador_name"`
	EquipoID    uint   `json:"equipo_id"`
	Tipo        string `json:"tipo"`
	Minuto      int    `json:"minuto"`
}

// PartidoResponse representa un partido en las respuestas HTTP.
type PartidoResponse struct {
	ID               uint             `json:"id"`
	TorneoID         uint             `json:"torneo_id"`
	Jornada          int              `json:"jornada"`
	LocalEquipoID    uint             `json:"local_equipo_id"`
	LocalEquipoName  string           `json:"local_equipo_name"`
	VisitaEquipoID   uint             `json:"visita_equipo_id"`
	VisitaEquipoName string           `json:"visita_equipo_name"`
	GolLocal         *int             `json:"gol_local"`
	GolVisita        *int             `json:"gol_visita"`
	Jugado           bool             `json:"jugado"`
	Eventos          []EventoResponse `json:"eventos,omitempty"`
}

// TablaPosicionResponse representa una fila de la tabla de posiciones.
type TablaPosicionResponse struct {
	EquipoID   uint   `json:"equipo_id"`
	EquipoName string `json:"equipo_name"`
	Color      string `json:"color"`
	PJ         int    `json:"pj"`
	PG         int    `json:"pg"`
	PE         int    `json:"pe"`
	PP         int    `json:"pp"`
	GF         int    `json:"gf"`
	GC         int    `json:"gc"`
	DG         int    `json:"dg"`
	Pts        int    `json:"pts"`
}

// GoleadorResponse representa una fila del ranking de goleadores.
type GoleadorResponse struct {
	JugadorID   uint   `json:"jugador_id"`
	JugadorName string `json:"jugador_name"`
	EquipoID    uint   `json:"equipo_id"`
	EquipoName  string `json:"equipo_name"`
	Goles       int    `json:"goles"`
	Asistencias int    `json:"asistencias"`
	Amarillas   int    `json:"amarillas"`
	Rojas       int    `json:"rojas"`
}
