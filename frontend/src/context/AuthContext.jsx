import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('access_token') || '');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Проверяем валидность токена при загрузке
        const verifyToken = async () => {
            const accessToken = localStorage.getItem('access_token');
            if (accessToken) {
                try {
                    await apiClient.post('/auth/token/verify/', {
                        token: accessToken,
                    });
                    setToken(accessToken);
                } catch (error) {
                    // Если токен невалидный, пробуем обновить
                    try {
                        const refreshToken = localStorage.getItem('refresh_token');
                        if (refreshToken) {
                            const response = await apiClient.post('/auth/token/refresh/', {
                                refresh: refreshToken,
                            });
                            const newAccessToken = response.data.access;
                            localStorage.setItem('access_token', newAccessToken);
                            setToken(newAccessToken);
                        } else {
                            logout();
                        }
                    } catch (refreshError) {
                        logout();
                    }
                }
            }
            setLoading(false);
        };

        verifyToken();
    }, []);

    const login = (accessToken, refreshToken) => {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        setToken(accessToken);
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setToken('');
    };

    return (
        <AuthContext.Provider value={{ token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};