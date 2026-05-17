import {
    ActionResponse,
    CreateEquipoDTO,
    CreateEventoDTO,
    CreateJugadorDTO,
    CreatePartidoDTO,
    CreateTorneoDTO,
    Equipo,
    Evento,
    Goleador,
    GetJugadoresParams,
    GetPartidosParams,
    Jugador,
    PaginatedResponse,
    PaginationParams,
    Partido,
    PosicionTabla,
    ResultadoDTO,
    SingleResponse,
    Torneo,
    UpdateEquipoDTO,
    UpdateJugadorDTO,
    UpdatePartidoDTO,
    UpdateTorneoDTO,
} from './types';

export interface ITorneoRepository {
    // Torneos (scope por negocio)
    getTorneos(businessId: number, params?: PaginationParams): Promise<PaginatedResponse<Torneo>>;
    getTorneo(id: number): Promise<SingleResponse<Torneo>>;
    createTorneo(businessId: number, data: CreateTorneoDTO): Promise<SingleResponse<Torneo>>;
    updateTorneo(id: number, data: UpdateTorneoDTO): Promise<SingleResponse<Torneo>>;
    deleteTorneo(id: number): Promise<ActionResponse>;

    // Equipos
    getEquipos(torneoId: number, params?: PaginationParams): Promise<PaginatedResponse<Equipo>>;
    getEquipoById(torneoId: number, id: number): Promise<SingleResponse<Equipo>>;
    createEquipo(torneoId: number, data: CreateEquipoDTO): Promise<SingleResponse<Equipo>>;
    updateEquipo(torneoId: number, id: number, data: UpdateEquipoDTO): Promise<SingleResponse<Equipo>>;
    deleteEquipo(torneoId: number, id: number): Promise<ActionResponse>;

    // Jugadores
    getJugadores(torneoId: number, params?: GetJugadoresParams): Promise<PaginatedResponse<Jugador>>;
    getJugadorById(torneoId: number, id: number): Promise<SingleResponse<Jugador>>;
    createJugador(torneoId: number, data: CreateJugadorDTO): Promise<SingleResponse<Jugador>>;
    updateJugador(torneoId: number, id: number, data: UpdateJugadorDTO): Promise<SingleResponse<Jugador>>;
    deleteJugador(torneoId: number, id: number): Promise<ActionResponse>;

    // Partidos
    getPartidos(torneoId: number, params?: GetPartidosParams): Promise<PaginatedResponse<Partido>>;
    getPartidoById(torneoId: number, id: number): Promise<SingleResponse<Partido>>;
    createPartido(torneoId: number, data: CreatePartidoDTO): Promise<SingleResponse<Partido>>;
    updatePartido(torneoId: number, id: number, data: UpdatePartidoDTO): Promise<SingleResponse<Partido>>;
    deletePartido(torneoId: number, id: number): Promise<ActionResponse>;
    registrarResultado(torneoId: number, id: number, data: ResultadoDTO): Promise<SingleResponse<Partido>>;

    // Eventos
    getEventos(torneoId: number, partidoId: number): Promise<SingleResponse<Evento[]>>;
    createEvento(torneoId: number, partidoId: number, data: CreateEventoDTO): Promise<SingleResponse<Evento>>;
    deleteEvento(torneoId: number, id: number): Promise<ActionResponse>;

    // Tabla / Goleadores
    getTabla(torneoId: number): Promise<SingleResponse<PosicionTabla[]>>;
    getGoleadores(torneoId: number): Promise<SingleResponse<Goleador[]>>;

    // Fixture
    generarFixture(torneoId: number): Promise<ActionResponse>;
}
