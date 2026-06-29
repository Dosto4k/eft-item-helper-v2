import React from 'react';
import Loading from '../common/Loading';
import Error from '../common/Error';
import Header from '../layout/Header';
import QuestProgress from './QuestProgress';
import QuestItemCard from './QuestItemCard';
import Pagination from '../common/Pagination';

const QuestItemsList = ({ 
    items, 
    loading, 
    error, 
    pagination,
    progress,
    progressLoading,
    progressError,
    onRefresh, 
    onRefreshProgress,
    onUpdate,
    onPageChange,
    onPrev,
    onNext,
    onLimitChange
}) => {
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

    if (items.length === 0 && pagination.count === 0) {
        return (
            <>
                <Header onRefresh={onRefresh} />
                {error && <Error message={error} />}
                <QuestProgress 
                    progress={progress}
                    loading={progressLoading}
                    error={progressError}
                    onRefresh={onRefreshProgress}
                />
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
            
            <QuestProgress 
                progress={progress}
                loading={progressLoading}
                error={progressError}
                onRefresh={onRefreshProgress}
            />
            
            <div className="quest-items-list">
                {items.map((item) => (
                    <QuestItemCard 
                        key={item.id} 
                        item={item} 
                        onAction={onUpdate} 
                    />
                ))}
            </div>
            
            {pagination.totalPages > 1 && (
                <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={onPageChange}
                    onPrev={onPrev}
                    onNext={onNext}
                    hasPrev={!!pagination.previous}
                    hasNext={!!pagination.next}
                    totalItems={pagination.count}
                    currentLimit={pagination.limit}
                    onLimitChange={onLimitChange}
                />
            )}
        </>
    );
};

export default QuestItemsList;