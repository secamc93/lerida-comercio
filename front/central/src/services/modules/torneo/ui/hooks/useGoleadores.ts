'use client';

import { useCallback, useEffect, useState } from 'react';
import { getGoleadoresAction } from '../../infra/actions';
import { Goleador } from '../../domain/types';

export const useGoleadores = (torneoId: number | null) => {
    const [goleadores, setGoleadores] = useState<Goleador[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        if (!torneoId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await getGoleadoresAction(torneoId);
            setGoleadores(res.data || []);
        } catch (err: any) {
            setError(err?.message || 'Error al obtener goleadores');
            setGoleadores([]);
        } finally {
            setLoading(false);
        }
    }, [torneoId]);

    useEffect(() => {
        fetch();
    }, [fetch]);

    return { goleadores, loading, error, refresh: fetch };
};
