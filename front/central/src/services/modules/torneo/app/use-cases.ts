import { ITorneoRepository } from '../domain/ports';
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
} from '../domain/types';

export class TorneoUseCases {
    constructor(private repository: ITorneoRepository) {}

    // Torneos
    getTorneos(businessId: number, params?: PaginationParams): Promise<PaginatedResponse<Torneo>> {
        return this.repository.getTorneos(businessId, params);
    }
    getTorneo(id: number): Promise<SingleResponse<Torneo>> {
        return this.repository.getTorneo(id);
    }
    createTorneo(businessId: number, data: CreateTorneoDTO): Promise<SingleResponse<Torneo>> {
        return this.repository.createTorneo(businessId, data);
    }
    updateTorneo(id: number, data: UpdateTorneoDTO): Promise<SingleResponse<Torneo>> {
        return this.repository.updateTorneo(id, data);
    }
    deleteTorneo(id: number): Promise<ActionResponse> {
        return this.repository.deleteTorneo(id);
    }

    // Equipos
    getEquipos(torneoId: number, params?: PaginationParams): Promise<PaginatedResponse<Equipo>> {
        return this.repository.getEquipos(torneoId, params);
    }
    getEquipoById(torneoId: number, id: number): Promise<SingleResponse<Equipo>> {
        return this.repository.getEquipoById(torneoId, id);
    }
    createEquipo(torneoId: number, data: CreateEquipoDTO): Promise<SingleResponse<Equipo>> {
        return this.repository.createEquipo(torneoId, data);
    }
    updateEquipo(torneoId: number, id: number, data: UpdateEquipoDTO): Promise<SingleResponse<Equipo>> {
        return this.repository.updateEquipo(torneoId, id, data);
    }
    deleteEquipo(torneoId: number, id: number): Promise<ActionResponse> {
        return this.repository.deleteEquipo(torneoId, id);
    }

    // Jugadores
    getJugadores(torneoId: number, params?: GetJugadoresParams): Promise<PaginatedResponse<Jugador>> {
        return this.repository.getJugadores(torneoId, params);
    }
    getJugadorById(torneoId: number, id: number): Promise<SingleResponse<Jugador>> {
        return this.repository.getJugadorById(torneoId, id);
    }
    createJugador(torneoId: number, data: CreateJugadorDTO): Promise<SingleResponse<Jugador>> {
        return this.repository.createJugador(torneoId, data);
    }
    updateJugador(torneoId: number, id: number, data: UpdateJugadorDTO): Promise<SingleResponse<Jugador>> {
        return this.repository.updateJugador(torneoId, id, data);
    }
    deleteJugador(torneoId: number, id: number): Promise<ActionResponse> {
        return this.repository.deleteJugador(torneoId, id);
    }

    // Partidos
    getPartidos(torneoId: number, params?: GetPartidosParams): Promise<PaginatedResponse<Partido>> {
        return this.repository.getPartidos(torneoId, params);
    }
    getPartidoById(torneoId: number, id: number): Promise<SingleResponse<Partido>> {
        return this.repository.getPartidoById(torneoId, id);
    }
    createPartido(torneoId: number, data: CreatePartidoDTO): Promise<SingleResponse<Partido>> {
        return this.repository.createPartido(torneoId, data);
    }
    updatePartido(torneoId: number, id: number, data: UpdatePartidoDTO): Promise<SingleResponse<Partido>> {
        return this.repository.updatePartido(torneoId, id, data);
    }
    deletePartido(torneoId: number, id: number): Promise<ActionResponse> {
        return this.repository.deletePartido(torneoId, id);
    }
    registrarResultado(torneoId: number, id: number, data: ResultadoDTO): Promise<SingleResponse<Partido>> {
        return this.repository.registrarResultado(torneoId, id, data);
    }

    // Eventos
    getEventos(torneoId: number, partidoId: number): Promise<SingleResponse<Evento[]>> {
        return this.repository.getEventos(torneoId, partidoId);
    }
    createEvento(torneoId: number, partidoId: number, data: CreateEventoDTO): Promise<SingleResponse<Evento>> {
        return this.repository.createEvento(torneoId, partidoId, data);
    }
    deleteEvento(torneoId: number, id: number): Promise<ActionResponse> {
        return this.repository.deleteEvento(torneoId, id);
    }

    // Tabla / Goleadores
    getTabla(torneoId: number): Promise<SingleResponse<PosicionTabla[]>> {
        return this.repository.getTabla(torneoId);
    }
    getGoleadores(torneoId: number): Promise<SingleResponse<Goleador[]>> {
        return this.repository.getGoleadores(torneoId);
    }

    // Fixture
    generarFixture(torneoId: number): Promise<ActionResponse> {
        return this.repository.generarFixture(torneoId);
    }
}
