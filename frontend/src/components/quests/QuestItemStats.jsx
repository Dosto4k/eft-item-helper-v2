import React from 'react';

const QuestItemStats = ({ items }) => {
    const total = items.length;
    const completed = items.filter(
        item => item.collect_in_raid >= item.required_in_raid &&
                item.collect_out_raid >= item.required_out_raid
    ).length;

    return (
        <div className="stats">
            <div className="stat-item">
                <span className="stat-label">Всего предметов: </span>
                <strong>{total}</strong>
            </div>
            <div className="stat-item">
                <span className="stat-label">Выполнено: </span>
                <strong className="stat-value completed">{completed}</strong>
            </div>
        </div>
    );
};

export default QuestItemStats;