import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null); // null = не загружено, '' = нет токена
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkToken = async () => {
            const accessToken = localStorage.getItem('access_token');
            
            if (!accessToken) {
                setToken('');
                setLoading(false);
                return;
            }

            try {
                // Проверяем валидность токена
                await apiClient.post('/auth/token/verify/', {
                    token: accessToken,
                });
                setToken(accessToken);
            } catch (error) {
                // Пробуем обновить токен
                try {
                    const refreshToken = localStorage.getItem('refresh_token');
                    if (refreshToken) {
                        const response = await apiClient.post('/auth/token/refresh/', {
                            refresh: refreshToken,
                        });
                        const newToken = response.data.access;
                        localStorage.setItem('access_token', newToken);
                        setToken(newToken);
                    } else {
                        localStorage.removeItem('access_token');
                        setToken('');
                    }
                } catch (refreshError) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    setToken('');
                }
            } finally {
                setLoading(false);
            }
        };

        checkToken();
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