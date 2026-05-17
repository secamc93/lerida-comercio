'use server';

import { getAuthToken } from '@/shared/utils/server-auth';
import { TorneoApiRepository } from '../repository/api-repository';
import { TorneoUseCases } from '../../app/use-cases';
import {
    CreateEquipoDTO,
    CreateEventoDTO,
    CreateJugadorDTO,
    CreatePartidoDTO,
    CreateTorneoDTO,
    GetJugadoresParams,
    GetPartidosParams,
    PaginationParams,
    ResultadoDTO,
    UpdateEquipoDTO,
    UpdateJugadorDTO,
    UpdatePartidoDTO,
    UpdateTorneoDTO,
} from '../../domain/types';

async function getUseCases() {
    const token = await getAuthToken();
    const repository = new TorneoApiRepository(token);
    return new TorneoUseCases(repository);
}

function fail(label: string, error: any): never {
    console.error(`${label} Error:`, error?.message);
    throw new Error(error?.message || 'Ocurrió un error');
}

// --- Torneos ---

export const getTorneosAction = async (businessId: number, params?: PaginationParams) => {
    try {
        return await (await getUseCases()).getTorneos(businessId, params);
    } catch (error: any) {
        fail('Get Torneos Action', error);
    }
};

export const getTorneoAction = async (id: number) => {
    try {
        return await (await getUseCases()).getTorneo(id);
    } catch (error: any) {
        fail('Get Torneo Action', error);
    }
};

export const createTorneoAction = async (businessId: number, data: CreateTorneoDTO) => {
    try {
        return await (await getUseCases()).createTorneo(businessId, data);
    } catch (error: any) {
        fail('Create Torneo Action', error);
    }
};

export const updateTorneoAction = async (id: number, data: UpdateTorneoDTO) => {
    try {
        return await (await getUseCases()).updateTorneo(id, data);
    } catch (error: any) {
        fail('Update Torneo Action', error);
    }
};

export const deleteTorneoAction = async (id: number) => {
    try {
        return await (await getUseCases()).deleteTorneo(id);
    } catch (error: any) {
        fail('Delete Torneo Action', error);
    }
};

// --- Equipos ---

export const getEquiposAction = async (torneoId: number, params?: PaginationParams) => {
    try {
        return await (await getUseCases()).getEquipos(torneoId, params);
    } catch (error: any) {
        fail('Get Equipos Action', error);
    }
};

export const getEquipoByIdAction = async (torneoId: number, id: number) => {
    try {
        return await (await getUseCases()).getEquipoById(torneoId, id);
    } catch (error: any) {
        fail('Get Equipo By Id Action', error);
    }
};

export const createEquipoAction = async (torneoId: number, data: CreateEquipoDTO) => {
    try {
        return await (await getUseCases()).createEquipo(torneoId, data);
    } catch (error: any) {
        fail('Create Equipo Action', error);
    }
};

export const updateEquipoAction = async (torneoId: number, id: number, data: UpdateEquipoDTO) => {
    try {
        return await (await getUseCases()).updateEquipo(torneoId, id, data);
    } catch (error: any) {
        fail('Update Equipo Action', error);
    }
};

export const deleteEquipoAction = async (torneoId: number, id: number) => {
    try {
        return await (await getUseCases()).deleteEquipo(torneoId, id);
    } catch (error: any) {
        fail('Delete Equipo Action', error);
    }
};

// --- Jugadores ---

export const getJugadoresAction = async (torneoId: number, params?: GetJugadoresParams) => {
    try {
        return await (await getUseCases()).getJugadores(torneoId, params);
    } catch (error: any) {
        fail('Get Jugadores Action', error);
    }
};

export const getJugadorByIdAction = async (torneoId: number, id: number) => {
    try {
        return await (await getUseCases()).getJugadorById(torneoId, id);
    } catch (error: any) {
        fail('Get Jugador By Id Action', error);
    }
};

export const createJugadorAction = async (torneoId: number, data: CreateJugadorDTO) => {
    try {
        return await (await getUseCases()).createJugador(torneoId, data);
    } catch (error: any) {
        fail('Create Jugador Action', error);
    }
};

export const updateJugadorAction = async (torneoId: number, id: number, data: UpdateJugadorDTO) => {
    try {
        return await (await getUseCases()).updateJugador(torneoId, id, data);
    } catch (error: any) {
        fail('Update Jugador Action', error);
    }
};

export const deleteJugadorAction = async (torneoId: number, id: number) => {
    try {
        return await (await getUseCases()).deleteJugador(torneoId, id);
    } catch (error: any) {
        fail('Delete Jugador Action', error);
    }
};

// --- Partidos ---

export const getPartidosAction = async (torneoId: number, params?: GetPartidosParams) => {
    try {
        return await (await getUseCases()).getPartidos(torneoId, params);
    } catch (error: any) {
        fail('Get Partidos Action', error);
    }
};

export const getPartidoByIdAction = async (torneoId: number, id: number) => {
    try {
        return await (await getUseCases()).getPartidoById(torneoId, id);
    } catch (error: any) {
        fail('Get Partido By Id Action', error);
    }
};

export const createPartidoAction = async (torneoId: number, data: CreatePartidoDTO) => {
    try {
        return await (await getUseCases()).createPartido(torneoId, data);
    } catch (error: any) {
        fail('Create Partido Action', error);
    }
};

export const updatePartidoAction = async (torneoId: number, id: number, data: UpdatePartidoDTO) => {
    try {
        return await (await getUseCases()).updatePartido(torneoId, id, data);
    } catch (error: any) {
        fail('Update Partido Action', error);
    }
};

export const deletePartidoAction = async (torneoId: number, id: number) => {
    try {
        return await (await getUseCases()).deletePartido(torneoId, id);
    } catch (error: any) {
        fail('Delete Partido Action', error);
    }
};

export const registrarResultadoAction = async (torneoId: number, id: number, data: ResultadoDTO) => {
    try {
        return await (await getUseCases()).registrarResultado(torneoId, id, data);
    } catch (error: any) {
        fail('Registrar Resultado Action', error);
    }
};

// --- Eventos ---

export const getEventosAction = async (torneoId: number, partidoId: number) => {
    try {
        return await (await getUseCases()).getEventos(torneoId, partidoId);
    } catch (error: any) {
        fail('Get Eventos Action', error);
    }
};

export const createEventoAction = async (torneoId: number, partidoId: number, data: CreateEventoDTO) => {
    try {
        return await (await getUseCases()).createEvento(torneoId, partidoId, data);
    } catch (error: any) {
        fail('Create Evento Action', error);
    }
};

export const deleteEventoAction = async (torneoId: number, id: number) => {
    try {
        return await (await getUseCases()).deleteEvento(torneoId, id);
    } catch (error: any) {
        fail('Delete Evento Action', error);
    }
};

// --- Tabla / Goleadores ---

export const getTablaAction = async (torneoId: number) => {
    try {
        return await (await getUseCases()).getTabla(torneoId);
    } catch (error: any) {
        fail('Get Tabla Action', error);
    }
};

export const getGoleadoresAction = async (torneoId: number) => {
    try {
        return await (await getUseCases()).getGoleadores(torneoId);
    } catch (error: any) {
        fail('Get Goleadores Action', error);
    }
};

// --- Fixture ---

export const generarFixtureAction = async (torneoId: number) => {
    try {
        return await (await getUseCases()).generarFixture(torneoId);
    } catch (error: any) {
        fail('Generar Fixture Action', error);
    }
};
