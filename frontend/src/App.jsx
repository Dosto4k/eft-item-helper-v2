import React, { useState, useEffect } from 'react';
import { questsApi } from './api/quests';

function App() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [token, setToken] = useState(localStorage.getItem('access_token') || '');
    const [isLogin, setIsLogin] = useState(true); // true - login, false - register
    
    // Login form
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [email, setEmail] = useState('');
    const [registerSuccess, setRegisterSuccess] = useState('');

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

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setRegisterSuccess('');
        
        try {
            const response = await fetch('/api/auth/token/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('access_token', data.access);
                localStorage.setItem('refresh_token', data.refresh);
                setToken(data.access);
                setError('');
                setUsername('');
                setPassword('');
                await fetchItems();
            } else {
                const data = await response.json();
                setError(data.detail || 'Ошибка входа. Проверьте логин и пароль.');
            }
        } catch (err) {
            setError('Ошибка соединения с сервером');
            console.error(err);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setRegisterSuccess('');
        
        // Проверка паролей
        if (password !== password2) {
            setError('Пароли не совпадают');
            return;
        }
        
        try {
            const response = await fetch('/api/auth/register/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    username, 
                    email,
                    password, 
                    password2 
                }),
            });
            
            if (response.ok) {
                const data = await response.json();
                setRegisterSuccess('Регистрация прошла успешно! Теперь вы можете войти.');
                setError('');
                // Очищаем форму
                setUsername('');
                setEmail('');
                setPassword('');
                setPassword2('');
                // Переключаемся на форму входа
                setIsLogin(true);
            } else {
                const data = await response.json();
                // Обработка ошибок валидации
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
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setToken('');
        setItems([]);
    };

    const handleAction = async (id, action, inRaid = true) => {
        try {
            await questsApi.updateQuestCount(id, action, inRaid);
            await fetchItems();
        } catch (err) {
            setError(err.response?.data?.detail || 'Ошибка обновления');
            setTimeout(() => setError(''), 3000);
        }
    };

    useEffect(() => {
        if (token) {
            fetchItems();
        }
    }, [token]);

    // Страница входа/регистрации
    if (!token) {
        return (
            <div className="container" style={{ maxWidth: '420px', marginTop: '60px' }}>
                <div style={{
                    background: 'white',
                    padding: '40px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>
                        {isLogin ? 'Вход в систему' : 'Регистрация'}
                    </h2>
                    
                    {registerSuccess && (
                        <div style={{
                            color: '#27ae60',
                            background: '#e8f5e9',
                            padding: '12px 16px',
                            borderRadius: '6px',
                            margin: '10px 0'
                        }}>
                            {registerSuccess}
                        </div>
                    )}
                    
                    {error && <div className="error">{error}</div>}
                    
                    <form onSubmit={isLogin ? handleLogin : handleRegister}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                                Имя пользователя
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder="Введите имя пользователя"
                                minLength={3}
                            />
                        </div>
                        
                        {!isLogin && (
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="Введите email"
                                />
                            </div>
                        )}
                        
                        <div style={{ marginBottom: isLogin ? '24px' : '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                                Пароль
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder={isLogin ? "Введите пароль" : "Придумайте пароль"}
                                minLength={8}
                            />
                        </div>
                        
                        {!isLogin && (
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                                    Подтверждение пароля
                                </label>
                                <input
                                    type="password"
                                    value={password2}
                                    onChange={(e) => setPassword2(e.target.value)}
                                    required
                                    placeholder="Повторите пароль"
                                    minLength={8}
                                />
                            </div>
                        )}
                        
                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: '#4a90d9',
                                color: 'white',
                                fontSize: '16px',
                                fontWeight: '600',
                                borderRadius: '6px',
                                marginBottom: '16px',
                            }}
                        >
                            {isLogin ? 'Войти' : 'Зарегистрироваться'}
                        </button>
                    </form>
                    
                    <div style={{ textAlign: 'center', fontSize: '14px', color: '#666' }}>
                        {isLogin ? (
                            <>
                                Нет аккаунта?{' '}
                                <button
                                    onClick={() => {
                                        setIsLogin(false);
                                        setError('');
                                        setRegisterSuccess('');
                                    }}
                                    style={{
                                        background: 'none',
                                        color: '#4a90d9',
                                        padding: 0,
                                        textDecoration: 'underline',
                                        fontSize: '14px',
                                    }}
                                >
                                    Зарегистрироваться
                                </button>
                            </>
                        ) : (
                            <>
                                Уже есть аккаунт?{' '}
                                <button
                                    onClick={() => {
                                        setIsLogin(true);
                                        setError('');
                                        setRegisterSuccess('');
                                    }}
                                    style={{
                                        background: 'none',
                                        color: '#4a90d9',
                                        padding: 0,
                                        textDecoration: 'underline',
                                        fontSize: '14px',
                                    }}
                                >
                                    Войти
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Список предметов (основная страница)
    return (
        <div className="container">
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
                flexWrap: 'wrap',
                gap: '12px'
            }}>
                <h1>📦 Квестовые предметы</h1>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={fetchItems}
                        style={{
                            background: '#f0f0f0',
                            color: '#333',
                            padding: '8px 16px',
                        }}
                    >
                        🔄 Обновить
                    </button>
                    <button
                        onClick={handleLogout}
                        style={{
                            background: '#e74c3c',
                            color: 'white',
                            padding: '8px 16px',
                        }}
                    >
                        Выйти
                    </button>
                </div>
            </div>

            {error && <div className="error">{error}</div>}

            {loading ? (
                <div className="loading">Загрузка...</div>
            ) : items.length === 0 ? (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '60px 20px',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
                    <div style={{ fontSize: '18px', color: '#333', marginBottom: '8px' }}>
                        Нет квестовых предметов
                    </div>
                    <div style={{ color: '#666', fontSize: '14px' }}>
                        Добавьте квестовые предметы через админ-панель
                    </div>
                </div>
            ) : (
                <div>
                    {/* Статистика */}
                    <div style={{
                        display: 'flex',
                        gap: '16px',
                        marginBottom: '20px',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{
                            background: 'white',
                            padding: '12px 20px',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                        }}>
                            <span style={{ color: '#666' }}>Всего предметов: </span>
                            <strong>{items.length}</strong>
                        </div>
                        <div style={{
                            background: 'white',
                            padding: '12px 20px',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                        }}>
                            <span style={{ color: '#666' }}>Выполнено: </span>
                            <strong style={{ color: '#27ae60' }}>
                                {items.filter(item => 
                                    item.collect_in_raid >= item.required_in_raid &&
                                    item.collect_out_raid >= item.required_out_raid
                                ).length}
                            </strong>
                        </div>
                    </div>

                    {/* Список предметов */}
                    {items.map((item) => {
                        const isComplete = item.collect_in_raid >= item.required_in_raid &&
                                          item.collect_out_raid >= item.required_out_raid;
                        
                        return (
                            <div key={item.id} style={{
                                background: 'white',
                                borderRadius: '10px',
                                padding: '20px',
                                marginBottom: '16px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                borderLeft: isComplete ? '4px solid #27ae60' : '4px solid #e67e22',
                                transition: 'all 0.2s',
                            }}>
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'flex-start',
                                    flexWrap: 'wrap',
                                    gap: '12px'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ marginBottom: '8px' }}>
                                            {item.name}
                                            {isComplete && (
                                                <span style={{
                                                    marginLeft: '12px',
                                                    fontSize: '14px',
                                                    color: '#27ae60',
                                                    background: '#e8f5e9',
                                                    padding: '2px 10px',
                                                    borderRadius: '20px'
                                                }}>
                                                    ✅ Выполнено
                                                </span>
                                            )}
                                        </h3>
                                        
                                        <div style={{ display: 'flex', gap: '24px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                            <div>
                                                <span style={{ color: '#666', fontSize: '13px' }}>В рейде:</span>
                                                <span style={{
                                                    fontWeight: '600',
                                                    marginLeft: '4px',
                                                    color: item.collect_in_raid >= item.required_in_raid ? '#27ae60' : '#e67e22'
                                                }}>
                                                    {item.collect_in_raid} / {item.required_in_raid}
                                                </span>
                                            </div>
                                            <div>
                                                <span style={{ color: '#666', fontSize: '13px' }}>Не в рейде:</span>
                                                <span style={{
                                                    fontWeight: '600',
                                                    marginLeft: '4px',
                                                    color: item.collect_out_raid >= item.required_out_raid ? '#27ae60' : '#e67e22'
                                                }}>
                                                    {item.collect_out_raid} / {item.required_out_raid}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {item.quests && item.quests.length > 0 && (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                                                {item.quests.map((quest) => (
                                                    <span key={quest.name} style={{
                                                        background: '#e8f0fe',
                                                        padding: '4px 12px',
                                                        borderRadius: '20px',
                                                        fontSize: '12px',
                                                        color: '#1a73e8'
                                                    }}>
                                                        {quest.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginRight: '8px' }}>
                                            <span style={{ fontSize: '11px', color: '#666' }}>В рейде</span>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <button
                                                    onClick={() => handleAction(item.id, 'increment', true)}
                                                    style={{
                                                        background: '#27ae60',
                                                        color: 'white',
                                                        padding: '4px 12px',
                                                        fontSize: '16px',
                                                        minWidth: '32px',
                                                    }}
                                                >
                                                    +
                                                </button>
                                                <button
                                                    onClick={() => handleAction(item.id, 'decrement', true)}
                                                    style={{
                                                        background: '#e74c3c',
                                                        color: 'white',
                                                        padding: '4px 12px',
                                                        fontSize: '16px',
                                                        minWidth: '32px',
                                                        opacity: item.collect_in_raid === 0 ? 0.4 : 1,
                                                        cursor: item.collect_in_raid === 0 ? 'not-allowed' : 'pointer',
                                                    }}
                                                    disabled={item.collect_in_raid === 0}
                                                >
                                                    −
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span style={{ fontSize: '11px', color: '#666' }}>Не в рейде</span>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <button
                                                    onClick={() => handleAction(item.id, 'increment', false)}
                                                    style={{
                                                        background: '#27ae60',
                                                        color: 'white',
                                                        padding: '4px 12px',
                                                        fontSize: '16px',
                                                        minWidth: '32px',
                                                    }}
                                                >
                                                    +
                                                </button>
                                                <button
                                                    onClick={() => handleAction(item.id, 'decrement', false)}
                                                    style={{
                                                        background: '#e74c3c',
                                                        color: 'white',
                                                        padding: '4px 12px',
                                                        fontSize: '16px',
                                                        minWidth: '32px',
                                                        opacity: item.collect_out_raid === 0 ? 0.4 : 1,
                                                        cursor: item.collect_out_raid === 0 ? 'not-allowed' : 'pointer',
                                                    }}
                                                    disabled={item.collect_out_raid === 0}
                                                >
                                                    −
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default App;