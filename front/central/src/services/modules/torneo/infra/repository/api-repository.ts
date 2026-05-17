import { env } from '@/shared/config/env';
import { ITorneoRepository } from '../../domain/ports';
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
} from '../../domain/types';

export class TorneoApiRepository implements ITorneoRepository {
    private baseUrl: string;
    private token: string | null;

    constructor(token?: string | null) {
        this.baseUrl = env.API_BASE_URL;
        this.token = token || null;
    }

    private async fetch<T>(path: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseUrl}${path}`;

        const headers: Record<string, string> = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...((options.headers as Record<string, string>) || {}),
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const res = await fetch(url, {
            ...options,
            headers,
            cache: 'no-store',
        });

        const data = await res.json();

        if (!res.ok) {
            console.error(`[Torneo API Error] ${res.status} ${url}`, data);
            throw new Error(data.message || 'Ocurrió un error');
        }

        return data;
    }

    /** Construye un querystring incluyendo `key` y parámetros extra. */
    private qs(key: string, value: number, extra?: Record<string, unknown> | object): string {
        const sp = new URLSearchParams();
        sp.append(key, String(value));
        if (extra) {
            Object.entries(extra).forEach(([k, v]) => {
                if (v !== undefined && v !== null && v !== '') {
                    sp.append(k, String(v));
                }
            });
        }
        return sp.toString();
    }

    /** Querystring con `torneo_id`. */
    private qsTorneo(torneoId: number, extra?: Record<string, unknown> | object): string {
        return this.qs('torneo_id', torneoId, extra);
    }

    // --- Torneos ---

    getTorneos(businessId: number, params?: PaginationParams): Promise<PaginatedResponse<Torneo>> {
        return this.fetch<PaginatedResponse<Torneo>>(
            `/torneo/torneos?${this.qs('business_id', businessId, params)}`,
        );
    }

    getTorneo(id: number): Promise<SingleResponse<Torneo>> {
        return this.fetch<SingleResponse<Torneo>>(`/torneo/torneos/${id}`);
    }

    createTorneo(businessId: number, data: CreateTorneoDTO): Promise<SingleResponse<Torneo>> {
        return this.fetch<SingleResponse<Torneo>>(`/torneo/torneos?${this.qs('business_id', businessId)}`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    updateTorneo(id: number, data: UpdateTorneoDTO): Promise<SingleResponse<Torneo>> {
        return this.fetch<SingleResponse<Torneo>>(`/torneo/torneos/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    deleteTorneo(id: number): Promise<ActionResponse> {
        return this.fetch<ActionResponse>(`/torneo/torneos/${id}`, {
            method: 'DELETE',
        });
    }

    // --- Equipos ---

    getEquipos(torneoId: number, params?: PaginationParams): Promise<PaginatedResponse<Equipo>> {
        return this.fetch<PaginatedResponse<Equipo>>(`/torneo/equipos?${this.qsTorneo(torneoId, params)}`);
    }

    getEquipoById(torneoId: number, id: number): Promise<SingleResponse<Equipo>> {
        return this.fetch<SingleResponse<Equipo>>(`/torneo/equipos/${id}?${this.qsTorneo(torneoId)}`);
    }

    createEquipo(torneoId: number, data: CreateEquipoDTO): Promise<SingleResponse<Equipo>> {
        return this.fetch<SingleResponse<Equipo>>(`/torneo/equipos?${this.qsTorneo(torneoId)}`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    updateEquipo(torneoId: number, id: number, data: UpdateEquipoDTO): Promise<SingleResponse<Equipo>> {
        return this.fetch<SingleResponse<Equipo>>(`/torneo/equipos/${id}?${this.qsTorneo(torneoId)}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    deleteEquipo(torneoId: number, id: number): Promise<ActionResponse> {
        return this.fetch<ActionResponse>(`/torneo/equipos/${id}?${this.qsTorneo(torneoId)}`, {
            method: 'DELETE',
        });
    }

    // --- Jugadores ---

    getJugadores(torneoId: number, params?: GetJugadoresParams): Promise<PaginatedResponse<Jugador>> {
        return this.fetch<PaginatedResponse<Jugador>>(`/torneo/jugadores?${this.qsTorneo(torneoId, params)}`);
    }

    getJugadorById(torneoId: number, id: number): Promise<SingleResponse<Jugador>> {
        return this.fetch<SingleResponse<Jugador>>(`/torneo/jugadores/${id}?${this.qsTorneo(torneoId)}`);
    }

    createJugador(torneoId: number, data: CreateJugadorDTO): Promise<SingleResponse<Jugador>> {
        return this.fetch<SingleResponse<Jugador>>(`/torneo/jugadores?${this.qsTorneo(torneoId)}`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    updateJugador(torneoId: number, id: number, data: UpdateJugadorDTO): Promise<SingleResponse<Jugador>> {
        return this.fetch<SingleResponse<Jugador>>(`/torneo/jugadores/${id}?${this.qsTorneo(torneoId)}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    deleteJugador(torneoId: number, id: number): Promise<ActionResponse> {
        return this.fetch<ActionResponse>(`/torneo/jugadores/${id}?${this.qsTorneo(torneoId)}`, {
            method: 'DELETE',
        });
    }

    // --- Partidos ---

    getPartidos(torneoId: number, params?: GetPartidosParams): Promise<PaginatedResponse<Partido>> {
        return this.fetch<PaginatedResponse<Partido>>(`/torneo/partidos?${this.qsTorneo(torneoId, params)}`);
    }

    getPartidoById(torneoId: number, id: number): Promise<SingleResponse<Partido>> {
        return this.fetch<SingleResponse<Partido>>(`/torneo/partidos/${id}?${this.qsTorneo(torneoId)}`);
    }

    createPartido(torneoId: number, data: CreatePartidoDTO): Promise<SingleResponse<Partido>> {
        return this.fetch<SingleResponse<Partido>>(`/torneo/partidos?${this.qsTorneo(torneoId)}`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    updatePartido(torneoId: number, id: number, data: UpdatePartidoDTO): Promise<SingleResponse<Partido>> {
        return this.fetch<SingleResponse<Partido>>(`/torneo/partidos/${id}?${this.qsTorneo(torneoId)}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    deletePartido(torneoId: number, id: number): Promise<ActionResponse> {
        return this.fetch<ActionResponse>(`/torneo/partidos/${id}?${this.qsTorneo(torneoId)}`, {
            method: 'DELETE',
        });
    }

    registrarResultado(torneoId: number, id: number, data: ResultadoDTO): Promise<SingleResponse<Partido>> {
        return this.fetch<SingleResponse<Partido>>(`/torneo/partidos/${id}/resultado?${this.qsTorneo(torneoId)}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // --- Eventos ---

    getEventos(torneoId: number, partidoId: number): Promise<SingleResponse<Evento[]>> {
        return this.fetch<SingleResponse<Evento[]>>(
            `/torneo/partidos/${partidoId}/eventos?${this.qsTorneo(torneoId)}`,
        );
    }

    createEvento(torneoId: number, partidoId: number, data: CreateEventoDTO): Promise<SingleResponse<Evento>> {
        return this.fetch<SingleResponse<Evento>>(`/torneo/partidos/${partidoId}/eventos?${this.qsTorneo(torneoId)}`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    deleteEvento(torneoId: number, id: number): Promise<ActionResponse> {
        return this.fetch<ActionResponse>(`/torneo/eventos/${id}?${this.qsTorneo(torneoId)}`, {
            method: 'DELETE',
        });
    }

    // --- Tabla / Goleadores ---

    getTabla(torneoId: number): Promise<SingleResponse<PosicionTabla[]>> {
        return this.fetch<SingleResponse<PosicionTabla[]>>(`/torneo/tabla?${this.qsTorneo(torneoId)}`);
    }

    getGoleadores(torneoId: number): Promise<SingleResponse<Goleador[]>> {
        return this.fetch<SingleResponse<Goleador[]>>(`/torneo/goleadores?${this.qsTorneo(torneoId)}`);
    }

    // --- Fixture ---

    generarFixture(torneoId: number): Promise<ActionResponse> {
        return this.fetch<ActionResponse>(`/torneo/fixture/generar?${this.qsTorneo(torneoId)}`, {
            method: 'POST',
        });
    }
}
