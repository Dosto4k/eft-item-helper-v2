import React from 'react';
import './QuestFilter.css';

const QuestFilter = ({ quests, selectedQuest, onSelectQuest }) => {
    return (
        <div className="quest-filter">
            <h3>Фильтр по квестам:</h3>
            <select
                value={selectedQuest}
                onChange={(e) => onSelectQuest(e.target.value)}
                className="quest-select"
            >
                <option value="">Все квесты</option>
                {quests.map((quest, index) => (
                    <option key={index} value={quest}>
                        {quest}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default QuestFilter;