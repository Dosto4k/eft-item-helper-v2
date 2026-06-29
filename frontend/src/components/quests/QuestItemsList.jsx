import React from 'react';
import Loading from '../common/Loading';
import Error from '../common/Error';
import Header from '../layout/Header';
import QuestItemStats from './QuestItemStats';
import QuestItemCard from './QuestItemCard';

const QuestItemsList = ({ items, loading, error, onRefresh, onUpdate }) => {
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