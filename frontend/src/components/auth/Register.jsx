import React, { useState } from 'react';
import Error from '../common/Error';

const Register = ({ onSwitchToLogin, onSuccess }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (password !== password2) {
            setError('Пароли не совпадают');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/register/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, password2 }),
            });

            if (response.ok) {
                setSuccess('Регистрация прошла успешно! Теперь вы можете войти.');
                setError('');
                setUsername('');
                setEmail('');
                setPassword('');
                setPassword2('');
                if (onSuccess) onSuccess();
                setTimeout(() => onSwitchToLogin(), 2000);
            } else {
                const data = await response.json();
                if (data.detail) {
                    setError(data.detail);
                } else if (data.email) {
                    setError(`Email: ${data.email.join(', ')}`);
                } else if (data.username) {
                    setError(`Имя пользователя: ${data.username.join(', ')}`);
                } else if (data.password) {
                    setError(`Пароль: ${data.password.join(', ')}`);
                } else {
                    setError('Ошибка регистрации. Проверьте введенные данные.');
                }
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
            {success && <div className="auth-success">{success}</div>}
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
                    <label className="auth-label">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Введите email"
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
                        placeholder="Придумайте пароль"
                        minLength={8}
                        disabled={loading}
                    />
                </div>
                <div className="auth-form-group">
                    <label className="auth-label">Подтверждение пароля</label>
                    <input
                        type="password"
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        required
                        placeholder="Повторите пароль"
                        minLength={8}
                        disabled={loading}
                    />
                </div>
                <button type="submit" className="auth-submit" disabled={loading}>
                    {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                </button>
            </form>
            <div className="auth-switch">
                Уже есть аккаунт?{' '}
                <button onClick={onSwitchToLogin} className="auth-switch-btn">
                    Войти
                </button>
            </div>
        </>
    );
};

export default Register;