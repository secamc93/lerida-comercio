'use client';

import { useCallback, useEffect, useState } from 'react';
import { getTablaAction } from '../../infra/actions';
import { PosicionTabla } from '../../domain/types';

export const useTabla = (torneoId: number | null) => {
    const [tabla, setTabla] = useState<PosicionTabla[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        if (!torneoId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await getTablaAction(torneoId);
            setTabla(res.data || []);
        } catch (err: any) {
            setError(err?.message || 'Error al obtener la tabla');
            setTabla([]);
        } finally {
            setLoading(false);
        }
    }, [torneoId]);

    useEffect(() => {
        fetch();
    }, [fetch]);

    return { tabla, loading, error, refresh: fetch };
};
