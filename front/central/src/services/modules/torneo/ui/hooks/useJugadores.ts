'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    createJugadorAction,
    deleteJugadorAction,
    getJugadoresAction,
    updateJugadorAction,
} from '../../infra/actions';
import { CreateJugadorDTO, Jugador, UpdateJugadorDTO } from '../../domain/types';

export const useJugadores = (torneoId: number | null) => {
    const [jugadores, setJugadores] = useState<Jugador[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [equipoId, setEquipoId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        if (!torneoId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await getJugadoresAction(torneoId, {
                page,
                page_size: pageSize,
                equipo_id: equipoId ?? undefined,
            });
            setJugadores(res.data.data || []);
            setTotal(res.data.total || 0);
        } catch (err: any) {
            setError(err?.message || 'Error al obtener jugadores');
            setJugadores([]);
        } finally {
            setLoading(false);
        }
    }, [torneoId, page, pageSize, equipoId]);

    useEffect(() => {
        fetch();
    }, [fetch]);

    const create = async (data: CreateJugadorDTO) => {
        if (!torneoId) return;
        await createJugadorAction(torneoId, data);
        await fetch();
    };

    const update = async (id: number, data: UpdateJugadorDTO) => {
        if (!torneoId) return;
        await updateJugadorAction(torneoId, id, data);
        await fetch();
    };

    const remove = async (id: number) => {
        if (!torneoId) return;
        await deleteJugadorAction(torneoId, id);
        await fetch();
    };

    return {
        jugadores,
        total,
        page,
        pageSize,
        equipoId,
        loading,
        error,
        setPage,
        setPageSize,
        setEquipoId,
        refresh: fetch,
        create,
        update,
        remove,
    };
};
