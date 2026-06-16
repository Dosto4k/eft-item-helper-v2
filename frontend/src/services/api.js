const BASE_URL = process.env.REACT_APP_API_URL || '/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

const mockItems = [
    {
        id: 1,
        name: "Bolts",
        count: 5,
        in_raid: 3,
        not_in_raid: 2,
        owned: false,
        quests: [{ name: "Supplier", guide: "https://tarkov.dev/quest/supplier" }]
    },
    {
        id: 2,
        name: "Nuts",
        count: 2,
        in_raid: 1,
        not_in_raid: 1,
        owned: false,
        quests: [{ name: "Chemical", guide: "https://tarkov.dev/quest/chemical" }]
    },
    {
        id: 3,
        name: "Humpbacked bear",
        count: 1,
        in_raid: 1,
        not_in_raid: 0,
        owned: false,
        quests: [{ name: "Acquaintance", guide: "https://tarkov.dev/quest/acquaintance" }]
    },
    {
        id: 4,
        name: "Toothpaste",
        count: 3,
        in_raid: 2,
        not_in_raid: 1,
        owned: false,
        quests: [{ name: "Living high is not a crime", guide: "https://tarkov.dev/quest/living-high" }]
    },
    {
        id: 5,
        name: "Pack of sugar",
        count: 4,
        in_raid: 2,
        not_in_raid: 2,
        owned: false,
        quests: [{ name: "Burning rubber", guide: "https://tarkov.dev/quest/burning-rubber" }]
    }
];

export const api = {
    login: async (username, password) => {
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Ошибка авторизации');
        }
        return await response.json();
    },

    register: async (username, email, password) => {
        const response = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Ошибка регистрации');
        }
        return await response.json();
    },

    getCurrentUser: async () => {
        const response = await fetch(`${BASE_URL}/auth/me`, {
            headers: getHeaders()
        });
        if (!response.ok) {
            throw new Error('Не удалось получить данные пользователя');
        }
        return await response.json();
    },

    getAllItems: async () => {
        try {
            const response = await fetch(`${BASE_URL}/items`, {
                headers: getHeaders()
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            return mockItems;
        }
    },

    getItemById: async (id) => {
        const response = await fetch(`${BASE_URL}/items/${id}`, {
            headers: getHeaders()
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    },

    getQuests: async () => {
        const response = await fetch(`${BASE_URL}/quests`, {
            headers: getHeaders()
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    },

    searchItems: async (query) => {
        const response = await fetch(`${BASE_URL}/items/search?q=${encodeURIComponent(query)}`, {
            headers: getHeaders()
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    },

    autocomplete: async (query) => {
        try {
            const response = await fetch(`${BASE_URL}/items/autocomplete?q=${encodeURIComponent(query)}`, {
                headers: getHeaders()
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            const q = query.toLowerCase();
            const results = [];
            mockItems.forEach(item => {
                if (item.name.toLowerCase().includes(q)) {
                    results.push({ type: 'item', text: item.name });
                }
                item.quests.forEach(quest => {
                    if (quest.name.toLowerCase().includes(q)) {
                        results.push({ type: 'quest', text: quest.name });
                    }
                });
            });
            return results.slice(0, 10);
        }
    },

    toggleItemOwned: async (itemId) => {
        try {
            const response = await fetch(`${BASE_URL}/items/${itemId}/owned`, {
                method: 'POST',
                headers: getHeaders()
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            const item = mockItems.find(i => i.id === itemId);
            if (item) {
                item.owned = !item.owned;
                return item;
            }
            throw error;
        }
    },

    getOwnedItems: async () => {
        const response = await fetch(`${BASE_URL}/items/owned`, {
            headers: getHeaders()
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }
};

export default api;