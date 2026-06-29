import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useQuests } from './hooks/useQuests';
import { useProgress } from './hooks/useProgress';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import QuestItemsList from './components/quests/QuestItemsList';
import Loading from './components/common/Loading';
import './index.css';

function App() {
    const { token, loading: authLoading, logout } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [unauthorized, setUnauthorized] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    
    const { 
        items, 
        loading, 
        error, 
        pagination,
        fetchItems, 
        updateItem,
        nextPage,
        prevPage,
        goToPage,
        changeLimit,
    } = useQuests();

    const { 
        progress, 
        loading: progressLoading, 
        error: progressError, 
        fetchProgress 
    } = useProgress();

    useEffect(() => {
        const handleUnauthorized = () => {
            setUnauthorized(true);
            logout();
        };

        window.addEventListener('unauthorized', handleUnauthorized);
        return () => {
            window.removeEventListener('unauthorized', handleUnauthorized);
        };
    }, [logout]);

    // Ждем завершения проверки авторизации
    useEffect(() => {
        if (!authLoading) {
            setIsInitialized(true);
        }
    }, [authLoading]);

    const handleProgressUpdate = async () => {
        try {
            await fetchProgress();
        } catch (error) {
            console.error('Ошибка обновления прогресса:', error);
        }
    };

    const handleUpdateItem = async (id, action, inRaid) => {
        try {
            await updateItem(id, action, inRaid, handleProgressUpdate);
        } catch (error) {
            console.error('Ошибка обновления предмета:', error);
        }
    };

    // Показываем загрузку, пока проверяется авторизация
    if (authLoading || !isInitialized) {
        return <Loading message="Загрузка приложения..." />;
    }

    // Если не авторизован или сессия истекла
    if (unauthorized || !token) {
        return (
            <div className="container auth-container">
                <div className="auth-box">
                    <h2 className="auth-title" style={{ textAlign: 'center', marginBottom: '16px' }}>
                        {unauthorized ? 'Сессия истекла' : 'Вход в систему'}
                    </h2>
                    {unauthorized && (
                        <div className="error" style={{ marginBottom: '16px' }}>
                            Ваша сессия истекла. Пожалуйста, войдите заново.
                        </div>
                    )}
                    {isLogin ? (
                        <Login 
                            onSwitchToRegister={() => setIsLogin(false)} 
                            onSuccess={() => {
                                setUnauthorized(false);
                                // После входа загружаем данные
                                fetchItems(1, 15);
                                fetchProgress();
                            }}
                        />
                    ) : (
                        <Register 
                            onSwitchToLogin={() => setIsLogin(true)}
                            onSuccess={() => {
                                setIsLogin(true);
                                setUnauthorized(false);
                            }}
                        />
                    )}
                </div>
            </div>
        );
    }

    const handleRefresh = () => {
        fetchItems(pagination.currentPage, pagination.limit);
        fetchProgress();
    };

    return (
        <div className="container">
            <QuestItemsList
                items={items}
                loading={loading}
                error={error}
                pagination={pagination}
                progress={progress}
                progressLoading={progressLoading}
                progressError={progressError}
                onRefresh={handleRefresh}
                onRefreshProgress={fetchProgress}
                onUpdate={handleUpdateItem}
                onPageChange={goToPage}
                onPrev={prevPage}
                onNext={nextPage}
                onLimitChange={changeLimit}
            />
        </div>
    );
}

export default App;