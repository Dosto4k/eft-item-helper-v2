import { useState, useEffect, useCallback, useRef } from 'react';
import { questsApi } from '../api/quests';

export const useQuests = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pagination, setPagination] = useState({
        count: 0,
        next: null,
        previous: null,
        limit: 15, // 15 делится на 3
        offset: 0,
        currentPage: 1,
        totalPages: 0,
    });
    const isFetching = useRef(false);

    const fetchItems = useCallback(async (page = 1, limit = 15) => {
        if (isFetching.current) return;
        
        try {
            isFetching.current = true;
            setLoading(true);
            const offset = (page - 1) * limit;
            
            const data = await questsApi.getQuestItems({ limit, offset });
            
            setItems(data.results || []);
            setPagination({
                count: data.count || 0,
                next: data.next,
                previous: data.previous,
                limit: limit,
                offset: offset,
                currentPage: page,
                totalPages: Math.ceil((data.count || 0) / limit),
            });
            setError('');
        } catch (err) {
            if (err.message === 'Не авторизован. Пожалуйста, войдите.') {
                setError(err.message);
            } else {
                setError('Не удалось загрузить список предметов');
            }
            console.error(err);
        } finally {
            setLoading(false);
            isFetching.current = false;
        }
    }, []);

    const updateItem = useCallback(async (id, action, inRaid, onProgressUpdate) => {
        try {
            setItems(prevItems => 
                prevItems.map(item => {
                    if (item.id === id) {
                        const delta = action === 'increment' ? 1 : -1;
                        const field = inRaid ? 'collect_in_raid' : 'collect_out_raid';
                        return {
                            ...item,
                            [field]: Math.max(0, item[field] + delta)
                        };
                    }
                    return item;
                })
            );

            await questsApi.updateQuestCount(id, action, inRaid);
            setError('');
            
            if (onProgressUpdate) {
                await onProgressUpdate();
            }
        } catch (err) {
            setItems(prevItems => 
                prevItems.map(item => {
                    if (item.id === id) {
                        const delta = action === 'increment' ? -1 : 1;
                        const field = inRaid ? 'collect_in_raid' : 'collect_out_raid';
                        return {
                            ...item,
                            [field]: Math.max(0, item[field] + delta)
                        };
                    }
                    return item;
                })
            );
            
            console.error('Ошибка обновления:', err);
            setError(err.response?.data?.detail || 'Ошибка обновления');
            setTimeout(() => setError(''), 3000);
            throw err;
        }
    }, []);

    const nextPage = useCallback(() => {
        if (pagination.next) {
            fetchItems(pagination.currentPage + 1, pagination.limit);
        }
    }, [pagination, fetchItems]);

    const prevPage = useCallback(() => {
        if (pagination.previous) {
            fetchItems(pagination.currentPage - 1, pagination.limit);
        }
    }, [pagination, fetchItems]);

    const goToPage = useCallback((page) => {
        if (page >= 1 && page <= pagination.totalPages) {
            fetchItems(page, pagination.limit);
        }
    }, [pagination, fetchItems]);

    const changeLimit = useCallback((newLimit) => {
        fetchItems(1, newLimit);
    }, [fetchItems]);

    useEffect(() => {
        fetchItems(1, 15);
    }, []);

    return { 
        items, 
        loading, 
        error, 
        pagination,
        fetchItems, 
        updateItem,
        nextPage,
        prevPage,
        goToPage,
        changeLimit,
    };
};