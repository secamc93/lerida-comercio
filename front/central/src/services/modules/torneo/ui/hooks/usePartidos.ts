'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    createPartidoAction,
    deletePartidoAction,
    generarFixtureAction,
    getPartidosAction,
    registrarResultadoAction,
    updatePartidoAction,
} from '../../infra/actions';
import { CreatePartidoDTO, Partido, ResultadoDTO, UpdatePartidoDTO } from '../../domain/types';

export const usePartidos = (torneoId: number | null) => {
    const [partidos, setPartidos] = useState<Partido[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [jornada, setJornada] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        if (!torneoId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await getPartidosAction(torneoId, {
                page,
                page_size: pageSize,
                jornada: jornada ?? undefined,
            });
            setPartidos(res.data.data || []);
            setTotal(res.data.total || 0);
        } catch (err: any) {
            setError(err?.message || 'Error al obtener partidos');
            setPartidos([]);
        } finally {
            setLoading(false);
        }
    }, [torneoId, page, pageSize, jornada]);

    useEffect(() => {
        fetch();
    }, [fetch]);

    const create = async (data: CreatePartidoDTO) => {
        if (!torneoId) return;
        await createPartidoAction(torneoId, data);
        await fetch();
    };

    const update = async (id: number, data: UpdatePartidoDTO) => {
        if (!torneoId) return;
        await updatePartidoAction(torneoId, id, data);
        await fetch();
    };

    const remove = async (id: number) => {
        if (!torneoId) return;
        await deletePartidoAction(torneoId, id);
        await fetch();
    };

    const registrarResultado = async (id: number, data: ResultadoDTO) => {
        if (!torneoId) return;
        await registrarResultadoAction(torneoId, id, data);
        await fetch();
    };

    const generarFixture = async () => {
        if (!torneoId) return;
        await generarFixtureAction(torneoId);
        await fetch();
    };

    return {
        partidos,
        total,
        page,
        pageSize,
        jornada,
        loading,
        error,
        setPage,
        setPageSize,
        setJornada,
        refresh: fetch,
        create,
        update,
        remove,
        registrarResultado,
        generarFixture,
    };
};
