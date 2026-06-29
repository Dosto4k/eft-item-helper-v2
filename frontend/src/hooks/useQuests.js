import { useState, useEffect, useCallback } from 'react';
import { questsApi } from '../api/quests';

export const useQuests = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchItems = async () => {
        try {
            setLoading(true);
            const data = await questsApi.getQuestItems();
            setItems(data);
            setError('');
        } catch (err) {
            if (err.response?.status === 401) {
                setError('Не авторизован. Пожалуйста, войдите.');
            } else {
                setError('Не удалось загрузить список предметов');
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

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
                            [field]: item[field] + delta
                        };
                    }
                    return item;
                })
            );

            // Отправляем запрос на сервер
            await questsApi.updateQuestCount(id, action, inRaid);
            setError('');
        } catch (err) {
            // Если ошибка - откатываем изменения
            setItems(prevItems => 
                prevItems.map(item => {
                    if (item.id === id) {
                        const delta = action === 'increment' ? -1 : 1;
                        const field = inRaid ? 'collect_in_raid' : 'collect_out_raid';
                        return {
                            ...item,
                            [field]: item[field] + delta
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

    // Оптимизированное обновление с использованием последних данных с сервера
    const updateItemWithSync = useCallback(async (id, action, inRaid) => {
        try {
            // Сначала отправляем запрос
            await questsApi.updateQuestCount(id, action, inRaid);
            
            // Затем синхронизируем конкретный предмет
            const updatedItems = await questsApi.getQuestItems();
            const updatedItem = updatedItems.find(item => item.id === id);
            
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

    // Обновление одного предмета через API
    const updateItemApi = useCallback(async (id, action, inRaid) => {
        try {
            const updatedItem = await questsApi.updateQuestCount(id, action, inRaid);
            
            // Если сервер возвращает обновленный объект
            if (updatedItem && updatedItem.id) {
                setItems(prevItems => 
                    prevItems.map(item => 
                        item.id === id ? updatedItem : item
                    )
                );
            } else {
                // Если не возвращает, делаем запрос на получение обновленного предмета
                const allItems = await questsApi.getQuestItems();
                const item = allItems.find(i => i.id === id);
                if (item) {
                    setItems(prevItems => 
                        prevItems.map(i => 
                            i.id === id ? item : i
                        )
                    );
                }
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
        fetchItems();
    }, []);

    return { 
        items, 
        loading, 
        error, 
        fetchItems, 
        updateItem,           // Оптимистичное обновление
        updateItemWithSync,   // Обновление с синхронизацией
        updateItemApi         // Обновление через API
    };
};