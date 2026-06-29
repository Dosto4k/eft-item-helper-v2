import axios from 'axios';

const apiClient = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Переменная для отслеживания процесса обновления токена
let isRefreshing = false;
let failedQueue = [];

// Обработка очереди запросов во время обновления токена
const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

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

// Интерцептор для обработки ошибок и refresh токена
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // Если ошибка не 401 или запрос уже повторялся
        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        // Если уже идет обновление токена, добавляем запрос в очередь
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
            .then(token => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return apiClient(originalRequest);
            })
            .catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
                throw new Error('No refresh token');
            }

            // Запрос на обновление токена
            const response = await axios.post('/api/auth/token/refresh/', {
                refresh: refreshToken,
            });

            const { access } = response.data;
            
            // Сохраняем новый токен
            localStorage.setItem('access_token', access);
            
            // Обновляем заголовок для текущего запроса
            originalRequest.headers.Authorization = `Bearer ${access}`;
            
            // Обрабатываем очередь запросов
            processQueue(null, access);
            
            return apiClient(originalRequest);
        } catch (refreshError) {
            // Если не удалось обновить токен - выходим
            processQueue(refreshError, null);
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            
            // Редирект на страницу входа
            window.location.href = '/';
            
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default apiClient;