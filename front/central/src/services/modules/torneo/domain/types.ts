// ============================================
// Tipos del modulo Torneo
// ============================================

export interface SingleResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface ActionResponse {
    success: boolean;
    message: string;
    error?: string;
}

/** Estructura paginada anidada que devuelve el backend de torneo en `data`. */
export interface NestedPaginated<T> {
    data: T[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}

export type PaginatedResponse<T> = SingleResponse<NestedPaginated<T>>;

export interface PaginationParams {
    page?: number;
    page_size?: number;
}

// --- Torneos ---

export interface Torneo {
    id: number;
    business_id: number;
    name: string;
    description?: string;
    season?: string;
    is_active: boolean;
}

export interface CreateTorneoDTO {
    name: string;
    description?: string;
    season?: string;
}

export interface UpdateTorneoDTO {
    name: string;
    description?: string;
    season?: string;
    is_active: boolean;
}

// --- Equipos ---

export interface Equipo {
    id: number;
    name: string;
    color?: string;
    logo_url?: string;
    created_at?: string;
    updated_at?: string;
}

export interface CreateEquipoDTO {
    name: string;
    color?: string;
    logo_url?: string;
}

export type UpdateEquipoDTO = Partial<CreateEquipoDTO>;

// --- Jugadores ---

export interface Jugador {
    id: number;
    name: string;
    equipo_id: number;
    equipo_name?: string;
    position?: string;
    number?: number;
    created_at?: string;
    updated_at?: string;
}

export interface GetJugadoresParams extends PaginationParams {
    equipo_id?: number;
}

export interface CreateJugadorDTO {
    name: string;
    equipo_id: number;
    position?: string;
    number?: number;
}

export type UpdateJugadorDTO = Partial<CreateJugadorDTO>;

// --- Partidos ---

export interface Partido {
    id: number;
    jornada: number;
    local_equipo_id: number;
    visita_equipo_id: number;
    local_equipo_name?: string;
    visita_equipo_name?: string;
    gol_local?: number;
    gol_visita?: number;
    jugado?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface GetPartidosParams extends PaginationParams {
    jornada?: number;
}

export interface CreatePartidoDTO {
    jornada: number;
    local_equipo_id: number;
    visita_equipo_id: number;
}

export type UpdatePartidoDTO = Partial<CreatePartidoDTO>;

export interface ResultadoDTO {
    gol_local: number;
    gol_visita: number;
}

// --- Eventos ---

export type EventoTipo = 'gol' | 'asistencia' | 'amarilla' | 'roja';

export interface Evento {
    id: number;
    partido_id: number;
    jugador_id: number;
    jugador_name?: string;
    equipo_id: number;
    equipo_name?: string;
    tipo: EventoTipo;
    minuto: number;
    created_at?: string;
}

export interface CreateEventoDTO {
    jugador_id: number;
    equipo_id: number;
    tipo: EventoTipo;
    minuto: number;
}

// --- Tabla de posiciones ---

export interface PosicionTabla {
    equipo_id: number;
    equipo_name: string;
    color?: string;
    pj: number;
    pg: number;
    pe: number;
    pp: number;
    gf: number;
    gc: number;
    dg: number;
    pts: number;
}

// --- Goleadores ---

export interface Goleador {
    jugador_id: number;
    jugador_name: string;
    equipo_id?: number;
    equipo_name?: string;
    goles: number;
    asistencias: number;
    amarillas: number;
    rojas: number;
}
