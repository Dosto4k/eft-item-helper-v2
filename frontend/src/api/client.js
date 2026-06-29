import axios from 'axios';

const apiClient = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Флаг для предотвращения множественных редиректов
let isRedirecting = false;

// Интерцептор для добавления токена
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Интерцептор для обработки ошибок
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // Если это запрос к auth или ошибка не 401 - пропускаем
        if (error.response?.status !== 401 || 
            originalRequest.url?.includes('/auth/') ||
            originalRequest._retry) {
            return Promise.reject(error);
        }

        // Если уже идет редирект - не повторяем
        if (isRedirecting) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
                throw new Error('No refresh token');
            }

            const response = await axios.post('/api/auth/token/refresh/', {
                refresh: refreshToken,
            });

            const newAccessToken = response.data.access;
            localStorage.setItem('access_token', newAccessToken);
            
            // Повторяем исходный запрос с новым токеном
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return apiClient(originalRequest);
            
        } catch (refreshError) {
            // Только если нет токена или refresh невалидный - разлогиниваем
            if (refreshError.response?.status === 401 || 
                refreshError.message === 'No refresh token') {
                
                isRedirecting = true;
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                
                // Используем событие вместо прямого редиректа
                window.dispatchEvent(new CustomEvent('unauthorized'));
                
                // Небольшая задержка перед редиректом
                setTimeout(() => {
                    isRedirecting = false;
                }, 500);
            }
            
            return Promise.reject(refreshError);
        }
    }
);

export default apiClient;