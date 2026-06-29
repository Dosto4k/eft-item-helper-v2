import { useState, useEffect, useCallback, useRef } from 'react';
import { questsApi } from '../api/quests';

export const useProgress = () => {
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const isMounted = useRef(true);
    const isFetching = useRef(false);
    const initialLoadDone = useRef(false);

    const fetchProgress = useCallback(async () => {
        if (isFetching.current) {
            return;
        }

        isFetching.current = true;

        try {
            setLoading(true);
            const data = await questsApi.getQuestProgress();
            if (isMounted.current) {
                setProgress(data);
                setError('');
                initialLoadDone.current = true;
            }
            return data;
        } catch (err) {
            if (isMounted.current) {
                if (err.message === 'Не авторизован. Пожалуйста, войдите.') {
                    setError(err.message);
                } else {
                    setError('Не удалось загрузить прогресс');
                }
                // Даже при ошибке помечаем, что загрузка была выполнена
                initialLoadDone.current = true;
            }
            console.error(err);
            throw err;
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
            isFetching.current = false;
        }
    }, []);

    useEffect(() => {
        isMounted.current = true;
        fetchProgress();
        
        return () => {
            isMounted.current = false;
        };
    }, []);

    return { progress, loading, error, fetchProgress };
};