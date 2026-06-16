import React from 'react';
import ItemStats from './ItemStats';
import './ItemCard.css';

const ItemCard = ({ item, onToggleOwned }) => {
    return (
        <div className={`item-card ${item.owned ? 'owned' : ''}`}>
            <div className="item-header">
                <h3 className="item-name">{item.name}</h3>
                <div className="item-actions">
                    <button
                        className={`owned-button ${item.owned ? 'is-owned' : ''}`}
                        onClick={() => onToggleOwned(item.id)}
                        title={item.owned ? 'Убрать из имеющихся' : 'Отметить как имеющийся'}
                    >
                        {item.owned ? '✓' : '+'}
                    </button>
                    <span className={`item-count ${item.count > 0 ? 'available' : 'unavailable'}`}>
            {item.count} шт.
          </span>
                </div>
            </div>

            <ItemStats inRaid={item.in_raid} notInRaid={item.not_in_raid} />

            {item.quests && item.quests.length > 0 && (
                <div className="item-quests">
                    <h4>Используется в квестах:</h4>
                    <ul>
                        {item.quests.map((quest, index) => (
                            <li key={index}>
                                <a href={quest.guide} target="_blank" rel="noopener noreferrer">
                                    {quest.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ItemCard;