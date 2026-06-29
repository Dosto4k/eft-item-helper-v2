import React from 'react';
import Loading from '../common/Loading';
import Error from '../common/Error';
import Header from '../layout/Header';
import QuestItemStats from './QuestItemStats';
import QuestItemCard from './QuestItemCard';

const QuestItemsList = ({ items, loading, error, onRefresh, onUpdate }) => {
    // Обработка ошибки авторизации
    if (error === 'Не авторизован. Пожалуйста, войдите.') {
        return (
            <>
                <Header onRefresh={onRefresh} />
                <div className="error" style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
                    <h2>Сессия истекла</h2>
                    <p style={{ marginTop: '8px', color: '#666' }}>
                        Пожалуйста, войдите заново
                    </p>
                    <button 
                        onClick={() => window.location.href = '/'}
                        className="auth-submit"
                        style={{ maxWidth: '200px', margin: '20px auto' }}
                    >
                        Войти
                    </button>
                </div>
            </>
        );
    }

    if (loading) {
        return <Loading />;
    }

    if (items.length === 0) {
        return (
            <>
                <Header onRefresh={onRefresh} />
                {error && <Error message={error} />}
                <div className="empty-state">
                    <div className="empty-icon">🎯</div>
                    <div className="empty-title">Нет квестовых предметов</div>
                    <div className="empty-text">Добавьте квестовые предметы через админ-панель</div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header onRefresh={onRefresh} />
            {error && <Error message={error} />}
            <QuestItemStats items={items} />
            <div>
                {items.map((item) => (
                    <QuestItemCard key={item.id} item={item} onAction={onUpdate} />
                ))}
            </div>
        </>
    );
};

export default QuestItemsList;