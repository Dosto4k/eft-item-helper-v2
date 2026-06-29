import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Error from '../common/Error';

const Login = ({ onSwitchToRegister }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/token/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                login(data.access, data.refresh);
                setError('');
                setUsername('');
                setPassword('');
            } else {
                const data = await response.json();
                setError(data.detail || 'Ошибка входа. Проверьте логин и пароль.');
            }
        } catch (err) {
            setError('Ошибка соединения с сервером');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <h2 className="auth-title">Вход в систему</h2>
            {error && <Error message={error} />}
            <form onSubmit={handleSubmit}>
                <div className="auth-form-group">
                    <label className="auth-label">Имя пользователя</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        placeholder="Введите имя пользователя"
                        minLength={3}
                        disabled={loading}
                    />
                </div>
                <div className="auth-form-group">
                    <label className="auth-label">Пароль</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Введите пароль"
                        minLength={8}
                        disabled={loading}
                    />
                </div>
                <button type="submit" className="auth-submit" disabled={loading}>
                    {loading ? 'Вход...' : 'Войти'}
                </button>
            </form>
            <div className="auth-switch">
                Нет аккаунта?{' '}
                <button onClick={onSwitchToRegister} className="auth-switch-btn">
                    Зарегистрироваться
                </button>
            </div>
        </>
    );
};

export default Login;