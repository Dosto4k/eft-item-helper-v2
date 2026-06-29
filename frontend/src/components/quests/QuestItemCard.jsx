import React, { useState, useEffect } from 'react';

const QuestItemCard = ({ item, onAction }) => {
    const [localItem, setLocalItem] = useState(item);
    const [isLoading, setIsLoading] = useState(false);
    const [showQuests, setShowQuests] = useState(false);

    useEffect(() => {
        setLocalItem(item);
    }, [item]);

    const isComplete = localItem.collect_in_raid >= localItem.required_in_raid &&
                       localItem.collect_out_raid >= localItem.required_out_raid;

    const handleAction = async (action, inRaid) => {
        if (isLoading) return;
        
        setIsLoading(true);
        
        const delta = action === 'increment' ? 1 : -1;
        const field = inRaid ? 'collect_in_raid' : 'collect_out_raid';
        const oldValue = localItem[field];
        const newValue = oldValue + delta;
        
        if (newValue < 0) return;
        if (inRaid && newValue > localItem.required_in_raid) return;
        if (!inRaid && newValue > localItem.required_out_raid) return;
        
        setLocalItem(prev => ({
            ...prev,
            [field]: newValue
        }));
        
        try {
            await onAction(localItem.id, action, inRaid);
        } catch (error) {
            setLocalItem(prev => ({
                ...prev,
                [field]: oldValue
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuestClick = (quest) => {
        const questLink = quest.guide || quest.url || quest.link;
        if (questLink) {
            window.open(questLink, '_blank', 'noopener,noreferrer');
        }
    };

    const toggleQuests = () => {
        setShowQuests(!showQuests);
    };

    const inRaidPercent = Math.min((localItem.collect_in_raid / localItem.required_in_raid) * 100, 100);
    const outRaidPercent = Math.min((localItem.collect_out_raid / localItem.required_out_raid) * 100, 100);

    return (
        <div className={`quest-item-card ${isComplete ? 'completed' : ''}`}>
            <div className="quest-item-content">
                {/* Название предмета */}
                <div className="quest-item-header">
                    <h3 className="quest-item-name">{localItem.name}</h3>
                </div>

                {/* Блок с прогресс-барами */}
                <div className="quest-item-progress-block">
                    {/* Бар для "В рейде" */}
                    <div className="quest-item-progress-item">
                        <div className="quest-item-progress-header">
                            <span className="quest-item-progress-label">В рейде</span>
                            <span className="quest-item-progress-count">
                                {localItem.collect_in_raid} / {localItem.required_in_raid}
                            </span>
                        </div>
                        <div className="quest-item-progress-wrapper">
                            <button
                                onClick={() => handleAction('decrement', true)}
                                className="progress-btn decrement"
                                disabled={isLoading || localItem.collect_in_raid === 0}
                            >
                                −
                            </button>
                            <div className="quest-item-progress-bar">
                                <div 
                                    className="quest-item-progress-fill in-raid"
                                    style={{ width: `${inRaidPercent}%` }}
                                />
                            </div>
                            <button
                                onClick={() => handleAction('increment', true)}
                                className="progress-btn increment"
                                disabled={isLoading || localItem.collect_in_raid >= localItem.required_in_raid}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Бар для "Не в рейде" */}
                    <div className="quest-item-progress-item">
                        <div className="quest-item-progress-header">
                            <span className="quest-item-progress-label">Не в рейде</span>
                            <span className="quest-item-progress-count">
                                {localItem.collect_out_raid} / {localItem.required_out_raid}
                            </span>
                        </div>
                        <div className="quest-item-progress-wrapper">
                            <button
                                onClick={() => handleAction('decrement', false)}
                                className="progress-btn decrement"
                                disabled={isLoading || localItem.collect_out_raid === 0}
                            >
                                −
                            </button>
                            <div className="quest-item-progress-bar">
                                <div 
                                    className="quest-item-progress-fill out-raid"
                                    style={{ width: `${outRaidPercent}%` }}
                                />
                            </div>
                            <button
                                onClick={() => handleAction('increment', false)}
                                className="progress-btn increment"
                                disabled={isLoading || localItem.collect_out_raid >= localItem.required_out_raid}
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>

                {/* Выпадающий список квестов */}
                {localItem.quests && localItem.quests.length > 0 && (
                    <div className="quest-item-quests-toggle">
                        <button 
                            onClick={toggleQuests}
                            className={`quests-toggle-btn ${showQuests ? 'active' : ''}`}
                        >
                            <span className="quests-toggle-label">
                                📋 Квесты ({localItem.quests.length})
                            </span>
                            <span className={`quests-toggle-arrow ${showQuests ? 'open' : ''}`}>
                                ▼
                            </span>
                        </button>
                        
                        {showQuests && (
                            <div className="quests-dropdown">
                                {localItem.quests.map((quest) => {
                                    const questLink = quest.guide || quest.url || quest.link;
                                    return questLink ? (
                                        <a
                                            key={quest.name}
                                            href={questLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="quest-dropdown-item"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleQuestClick(quest);
                                            }}
                                        >
                                            <span className="quest-dropdown-name">{quest.name}</span>
                                            <span className="quest-dropdown-link">🔗</span>
                                        </a>
                                    ) : (
                                        <div key={quest.name} className="quest-dropdown-item">
                                            <span className="quest-dropdown-name">{quest.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuestItemCard;