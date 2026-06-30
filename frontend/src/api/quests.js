import apiClient from './client';

export const questsApi = {
    getQuestItems: async (params = {}) => {
        try {
            const response = await apiClient.get('/item-counter/quests/', {
                params: {
                    limit: params.limit || 15,
                    offset: params.offset || 0,
                    item_name: params.item_name || undefined,
                    hide_completed: params.hide_completed || undefined,
                }
            });
            return response.data;
        } catch (error) {
            if (error.response?.status === 401) {
                throw new Error('Не авторизован. Пожалуйста, войдите.');
            }
            throw error;
        }
    },

    getQuestProgress: async () => {
        try {
            const response = await apiClient.get('/item-counter/quests/progress/');
            return response.data;
        } catch (error) {
            if (error.response?.status === 401) {
                throw new Error('Не авторизован. Пожалуйста, войдите.');
            }
            throw error;
        }
    },

    getQuestItem: async (id) => {
        try {
            const response = await apiClient.get(`/item-counter/quests/${id}/`);
            return response.data;
        } catch (error) {
            if (error.response?.status === 401) {
                throw new Error('Не авторизован. Пожалуйста, войдите.');
            }
            throw error;
        }
    },

    updateQuestCount: async (id, action, inRaid) => {
        try {
            const response = await apiClient.patch(
                `/item-counter/quests/${id}/?action=${action}&in_raid=${inRaid ? 1 : 0}`
            );
            return response.data;
        } catch (error) {
            if (error.response?.status === 401) {
                throw new Error('Не авторизован. Пожалуйста, войдите.');
            }
            throw error;
        }
    },
};