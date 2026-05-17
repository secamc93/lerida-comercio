'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    createEquipoAction,
    deleteEquipoAction,
    getEquiposAction,
    updateEquipoAction,
} from '../../infra/actions';
import { CreateEquipoDTO, Equipo, UpdateEquipoDTO } from '../../domain/types';

export const useEquipos = (torneoId: number | null) => {
    const [equipos, setEquipos] = useState<Equipo[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        if (!torneoId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await getEquiposAction(torneoId, { page, page_size: pageSize });
            setEquipos(res.data.data || []);
            setTotal(res.data.total || 0);
        } catch (err: any) {
            setError(err?.message || 'Error al obtener equipos');
            setEquipos([]);
        } finally {
            setLoading(false);
        }
    }, [torneoId, page, pageSize]);

    useEffect(() => {
        fetch();
    }, [fetch]);

    const create = async (data: CreateEquipoDTO) => {
        if (!torneoId) return;
        await createEquipoAction(torneoId, data);
        await fetch();
    };

    const update = async (id: number, data: UpdateEquipoDTO) => {
        if (!torneoId) return;
        await updateEquipoAction(torneoId, id, data);
        await fetch();
    };

    const remove = async (id: number) => {
        if (!torneoId) return;
        await deleteEquipoAction(torneoId, id);
        await fetch();
    };

    return {
        equipos,
        total,
        page,
        pageSize,
        loading,
        error,
        setPage,
        setPageSize,
        refresh: fetch,
        create,
        update,
        remove,
    };
};
