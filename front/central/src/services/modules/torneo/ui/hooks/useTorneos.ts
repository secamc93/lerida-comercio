'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    createTorneoAction,
    deleteTorneoAction,
    getTorneosAction,
    updateTorneoAction,
} from '../../infra/actions';
import { CreateTorneoDTO, Torneo, UpdateTorneoDTO } from '../../domain/types';

/**
 * Lista los torneos de un negocio (CRUD de la entidad Torneo).
 */
export const useTorneos = (businessId: number | null) => {
    const [torneos, setTorneos] = useState<Torneo[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        if (!businessId) {
            setTorneos([]);
            setTotal(0);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await getTorneosAction(businessId, { page, page_size: pageSize });
            setTorneos(res.data.data || []);
            setTotal(res.data.total || 0);
        } catch (err: any) {
            setError(err?.message || 'Error al obtener torneos');
            setTorneos([]);
        } finally {
            setLoading(false);
        }
    }, [businessId, page, pageSize]);

    useEffect(() => {
        fetch();
    }, [fetch]);

    const create = async (data: CreateTorneoDTO) => {
        if (!businessId) return;
        await createTorneoAction(businessId, data);
        await fetch();
    };

    const update = async (id: number, data: UpdateTorneoDTO) => {
        await updateTorneoAction(id, data);
        await fetch();
    };

    const remove = async (id: number) => {
        await deleteTorneoAction(id);
        await fetch();
    };

    return {
        torneos,
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
