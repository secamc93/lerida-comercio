package mapper

import (
	"github.com/secamc93/lerida-comercio/back/central/services/modules/torneo/internal/domain"
	"github.com/secamc93/lerida-comercio/back/central/services/modules/torneo/internal/infra/primary/handlers/request"
	"github.com/secamc93/lerida-comercio/back/central/services/modules/torneo/internal/infra/primary/handlers/response"
)

// --- Torneo ---

func ToCreateTorneoDTO(businessID uint, req request.CreateTorneoRequest) domain.CreateTorneoDTO {
	return domain.CreateTorneoDTO{
		BusinessID:  businessID,
		Name:        req.Name,
		Description: req.Description,
		Season:      req.Season,
	}
}

func ToUpdateTorneoDTO(req request.UpdateTorneoRequest) domain.UpdateTorneoDTO {
	return domain.UpdateTorneoDTO{
		Name:        req.Name,
		Description: req.Description,
		Season:      req.Season,
		IsActive:    req.IsActive,
	}
}

func ToTorneoResponse(t *domain.Torneo) response.TorneoResponse {
	return response.TorneoResponse{
		ID:          t.ID,
		BusinessID:  t.BusinessID,
		Name:        t.Name,
		Description: t.Description,
		Season:      t.Season,
		IsActive:    t.IsActive,
	}
}

func ToTorneoResponseList(items []domain.Torneo) []response.TorneoResponse {
	out := make([]response.TorneoResponse, 0, len(items))
	for i := range items {
		out = append(out, ToTorneoResponse(&items[i]))
	}
	return out
}

// --- Equipo ---

func ToCreateEquipoDTO(torneoID uint, req request.CreateEquipoRequest) domain.CreateEquipoDTO {
	return domain.CreateEquipoDTO{
		TorneoID: torneoID,
		Name:     req.Name,
		Color:    req.Color,
		LogoURL:  req.LogoURL,
	}
}

func ToUpdateEquipoDTO(req request.UpdateEquipoRequest) domain.UpdateEquipoDTO {
	return domain.UpdateEquipoDTO{
		Name:    req.Name,
		Color:   req.Color,
		LogoURL: req.LogoURL,
	}
}

func ToEquipoResponse(e *domain.Equipo) response.EquipoResponse {
	return response.EquipoResponse{
		ID:       e.ID,
		TorneoID: e.TorneoID,
		Name:     e.Name,
		Color:    e.Color,
		LogoURL:  e.LogoURL,
	}
}

func ToEquipoResponseList(items []domain.Equipo) []response.EquipoResponse {
	out := make([]response.EquipoResponse, 0, len(items))
	for i := range items {
		out = append(out, ToEquipoResponse(&items[i]))
	}
	return out
}

// --- Jugador ---

func ToCreateJugadorDTO(torneoID uint, req request.CreateJugadorRequest) domain.CreateJugadorDTO {
	return domain.CreateJugadorDTO{
		TorneoID: torneoID,
		EquipoID: req.EquipoID,
		Name:     req.Name,
		Position: req.Position,
		Number:   req.Number,
	}
}

func ToUpdateJugadorDTO(req request.UpdateJugadorRequest) domain.UpdateJugadorDTO {
	return domain.UpdateJugadorDTO{
		EquipoID: req.EquipoID,
		Name:     req.Name,
		Position: req.Position,
		Number:   req.Number,
	}
}

func ToJugadorResponse(j *domain.Jugador) response.JugadorResponse {
	return response.JugadorResponse{
		ID:         j.ID,
		TorneoID:   j.TorneoID,
		EquipoID:   j.EquipoID,
		EquipoName: j.EquipoName,
		Name:       j.Name,
		Position:   j.Position,
		Number:     j.Number,
	}
}

func ToJugadorResponseList(items []domain.Jugador) []response.JugadorResponse {
	out := make([]response.JugadorResponse, 0, len(items))
	for i := range items {
		out = append(out, ToJugadorResponse(&items[i]))
	}
	return out
}

// --- Partido ---

func ToCreatePartidoDTO(torneoID uint, req request.CreatePartidoRequest) domain.CreatePartidoDTO {
	return domain.CreatePartidoDTO{
		TorneoID:       torneoID,
		Jornada:        req.Jornada,
		LocalEquipoID:  req.LocalEquipoID,
		VisitaEquipoID: req.VisitaEquipoID,
	}
}

func ToUpdatePartidoDTO(req request.UpdatePartidoRequest) domain.UpdatePartidoDTO {
	return domain.UpdatePartidoDTO{
		Jornada:        req.Jornada,
		LocalEquipoID:  req.LocalEquipoID,
		VisitaEquipoID: req.VisitaEquipoID,
	}
}

func ToResultadoPartidoDTO(req request.ResultadoPartidoRequest) domain.ResultadoPartidoDTO {
	return domain.ResultadoPartidoDTO{
		GolLocal:  req.GolLocal,
		GolVisita: req.GolVisita,
	}
}

func ToEventoResponse(e *domain.PartidoEvento) response.EventoResponse {
	return response.EventoResponse{
		ID:          e.ID,
		PartidoID:   e.PartidoID,
		JugadorID:   e.JugadorID,
		JugadorName: e.JugadorName,
		EquipoID:    e.EquipoID,
		Tipo:        e.Tipo,
		Minuto:      e.Minuto,
	}
}

func ToEventoResponseList(items []domain.PartidoEvento) []response.EventoResponse {
	out := make([]response.EventoResponse, 0, len(items))
	for i := range items {
		out = append(out, ToEventoResponse(&items[i]))
	}
	return out
}

func ToPartidoResponse(p *domain.Partido) response.PartidoResponse {
	return response.PartidoResponse{
		ID:               p.ID,
		TorneoID:         p.TorneoID,
		Jornada:          p.Jornada,
		LocalEquipoID:    p.LocalEquipoID,
		LocalEquipoName:  p.LocalEquipoName,
		VisitaEquipoID:   p.VisitaEquipoID,
		VisitaEquipoName: p.VisitaEquipoName,
		GolLocal:         p.GolLocal,
		GolVisita:        p.GolVisita,
		Jugado:           p.Jugado,
		Eventos:          ToEventoResponseList(p.Eventos),
	}
}

func ToPartidoResponseList(items []domain.Partido) []response.PartidoResponse {
	out := make([]response.PartidoResponse, 0, len(items))
	for i := range items {
		out = append(out, ToPartidoResponse(&items[i]))
	}
	return out
}

// --- Calculados ---

func ToTablaResponseList(items []domain.TablaPosicion) []response.TablaPosicionResponse {
	out := make([]response.TablaPosicionResponse, 0, len(items))
	for _, t := range items {
		out = append(out, response.TablaPosicionResponse{
			EquipoID:   t.EquipoID,
			EquipoName: t.EquipoName,
			Color:      t.Color,
			PJ:         t.PJ,
			PG:         t.PG,
			PE:         t.PE,
			PP:         t.PP,
			GF:         t.GF,
			GC:         t.GC,
			DG:         t.DG,
			Pts:        t.Pts,
		})
	}
	return out
}

func ToGoleadorResponseList(items []domain.Goleador) []response.GoleadorResponse {
	out := make([]response.GoleadorResponse, 0, len(items))
	for _, g := range items {
		out = append(out, response.GoleadorResponse{
			JugadorID:   g.JugadorID,
			JugadorName: g.JugadorName,
			EquipoID:    g.EquipoID,
			EquipoName:  g.EquipoName,
			Goles:       g.Goles,
			Asistencias: g.Asistencias,
			Amarillas:   g.Amarillas,
			Rojas:       g.Rojas,
		})
	}
	return out
}

// ToPaginatedResponse adapta una respuesta paginada de dominio a un tipo de presentación.
func ToPaginatedResponse[D any, R any](p domain.PaginatedResponse[D], conv func([]D) []R) domain.PaginatedResponse[R] {
	return domain.NewPaginatedResponse(conv(p.Data), p.Total, p.Page, p.PageSize)
}
