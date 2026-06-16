import React from 'react';
import ItemCard from './ItemCard';
import './ItemList.css';

const ItemList = ({ items, onToggleOwned }) => {
    if (!items || items.length === 0) {
        return (
            <div className="no-items">
                <p>Предметы не найдены</p>
            </div>
        );
    }

    return (
        <div className="item-list">
            {items.map((item) => (
                <ItemCard key={item.id} item={item} onToggleOwned={onToggleOwned} />
            ))}
        </div>
    );
};

export default ItemList;