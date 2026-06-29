import { useState, useEffect, useCallback } from 'react';
import { questsApi } from '../api/quests';

export const useQuests = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pagination, setPagination] = useState({
        count: 0,
        next: null,
        previous: null,
        limit: 15,
        offset: 0,
        currentPage: 1,
        totalPages: 0,
    });

    const fetchItems = useCallback(async (page = 1, limit = 15) => {
        try {
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
        }
    }, []);

    // Переход на следующую страницу
    const nextPage = useCallback(() => {
        if (pagination.next) {
            const nextPageNum = pagination.currentPage + 1;
            fetchItems(nextPageNum, pagination.limit);
        }
    }, [pagination, fetchItems]);

    // Переход на предыдущую страницу
    const prevPage = useCallback(() => {
        if (pagination.previous) {
            const prevPageNum = pagination.currentPage - 1;
            fetchItems(prevPageNum, pagination.limit);
        }
    }, [pagination, fetchItems]);

    // Переход на конкретную страницу
    const goToPage = useCallback((page) => {
        if (page >= 1 && page <= pagination.totalPages) {
            fetchItems(page, pagination.limit);
        }
    }, [pagination, fetchItems]);

    // Изменение количества элементов на странице
    const changeLimit = useCallback((newLimit) => {
        fetchItems(1, newLimit);
    }, [fetchItems]);

    // Оптимизированное обновление предмета
    const updateItem = useCallback(async (id, action, inRaid) => {
        try {
            // Оптимистичное обновление
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
        } catch (err) {
            // Откат при ошибке
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

    // Обновление одного предмета через API
    const updateItemWithSync = useCallback(async (id, action, inRaid) => {
        try {
            await questsApi.updateQuestCount(id, action, inRaid);
            
            // Синхронизируем конкретный предмет на текущей странице
            const updatedItem = await questsApi.getQuestItem(id);
            if (updatedItem) {
                setItems(prevItems => 
                    prevItems.map(item => 
                        item.id === id ? updatedItem : item
                    )
                );
            }
            setError('');
        } catch (err) {
            console.error('Ошибка обновления:', err);
            setError(err.response?.data?.detail || 'Ошибка обновления');
            setTimeout(() => setError(''), 3000);
            throw err;
        }
    }, []);

    useEffect(() => {
        fetchItems(1, 15);
    }, [fetchItems]);

    return { 
        items, 
        loading, 
        error, 
        pagination,
        fetchItems, 
        updateItem,
        updateItemWithSync,
        nextPage,
        prevPage,
        goToPage,
        changeLimit,
    };
};