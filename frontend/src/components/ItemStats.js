import React from 'react';
import './ItemStats.css';

const ItemStats = ({ inRaid, notInRaid }) => {
    return (
        <div className="item-stats">
            <div className="stat">
                <span className="stat-label">В рейде:</span>
                <span className="stat-value in-raid">{inRaid}</span>
            </div>
            <div className="stat">
                <span className="stat-label">Не в рейде:</span>
                <span className="stat-value not-in-raid">{notInRaid}</span>
            </div>
        </div>
    );
};

export default ItemStats;