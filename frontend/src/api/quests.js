import apiClient from './client';

export const questsApi = {
    // GET /item-counter/quests/ - список квестовых предметов
    getQuestItems: async () => {
        const response = await apiClient.get('/item-counter/quests/');
        return response.data;
    },

    // PATCH /item-counter/quests/{id}/?action=increment&in_raid=1
    updateQuestCount: async (id, action, inRaid) => {
        const response = await apiClient.patch(
            `/item-counter/quests/${id}/?action=${action}&in_raid=${inRaid ? 1 : 0}`
        );
        return response.data;
    },
};