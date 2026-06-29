import { useState, useEffect } from 'react';
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

    const updateItem = async (id, action, inRaid) => {
        try {
            await questsApi.updateQuestCount(id, action, inRaid);
            await fetchItems();
        } catch (err) {
            console.error('Ошибка обновления:', err);
            setError(err.response?.data?.detail || 'Ошибка обновления');
            setTimeout(() => setError(''), 3000);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    return { items, loading, error, fetchItems, updateItem };
};