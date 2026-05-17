package domain

import "errors"

var (
	ErrTorneoNoEncontrado  = errors.New("torneo no encontrado")
	ErrEquipoNoEncontrado  = errors.New("equipo no encontrado")
	ErrJugadorNoEncontrado = errors.New("jugador no encontrado")
	ErrPartidoNoEncontrado = errors.New("partido no encontrado")
	ErrEventoNoEncontrado  = errors.New("evento no encontrado")
	ErrFixtureExistente    = errors.New("ya existen partidos jugados; no se puede regenerar el fixture")
	ErrEquiposInsuficientes = errors.New("se requieren al menos 2 equipos para generar el fixture")
)
