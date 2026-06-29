import React, { useState } from 'react';
import QuestItemActions from './QuestItemActions';

const QuestItemCard = ({ item, onAction, isUpdating = false }) => {
    const [localItem, setLocalItem] = useState(item);
    const [isLoading, setIsLoading] = useState(false);

    // Обновляем локальный предмет при изменении props
    React.useEffect(() => {
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

    // Обработчик клика по квесту
    const handleQuestClick = (quest) => {
        if (quest.guide) {
            // Открываем ссылку в новой вкладке
            window.open(quest.guide, '_blank', 'noopener,noreferrer');
        } else if (quest.url) {
            window.open(quest.url, '_blank', 'noopener,noreferrer');
        } else if (quest.link) {
            window.open(quest.link, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className={`quest-item-card ${isComplete ? 'completed' : ''}`}>
            <div className="quest-item-content">
                <div className="quest-item-info">
                    <h3 className="quest-item-name">
                        {localItem.name}
                        {isComplete && (
                            <span className="quest-item-badge">✅ Выполнено</span>
                        )}
                        {isLoading && (
                            <span className="quest-item-badge" style={{ 
                                background: '#f0f0f0', 
                                color: '#666',
                                marginLeft: '8px'
                            }}>
                                ⏳ Обновление...
                            </span>
                        )}
                    </h3>

                    <div className="quest-item-counts">
                        <div>
                            <span style={{ color: '#666', fontSize: '13px' }}>В рейде:</span>
                            <span className={`quest-item-count ${localItem.collect_in_raid >= localItem.required_in_raid ? 'completed' : 'pending'}`}>
                                {localItem.collect_in_raid} / {localItem.required_in_raid}
                            </span>
                        </div>
                        <div>
                            <span style={{ color: '#666', fontSize: '13px' }}>Не в рейде:</span>
                            <span className={`quest-item-count ${localItem.collect_out_raid >= localItem.required_out_raid ? 'completed' : 'pending'}`}>
                                {localItem.collect_out_raid} / {localItem.required_out_raid}
                            </span>
                        </div>
                    </div>

                    {localItem.quests && localItem.quests.length > 0 && (
                        <div className="quest-item-quests">
                            {localItem.quests.map((quest) => {
                                // Проверяем есть ли ссылка
                                const questLink = quest.guide || quest.url || quest.link;
                                
                                return questLink ? (
                                    <a
                                        key={quest.name}
                                        href={questLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="quest-tag quest-tag-link"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleQuestClick(quest);
                                        }}
                                        title={`Открыть гайд по квесту "${quest.name}"`}
                                    >
                                        {quest.name} 🔗
                                    </a>
                                ) : (
                                    <span key={quest.name} className="quest-tag">
                                        {quest.name}
                                    </span>
                                );
                            })}
                        </div>
                    )}
                </div>

                <QuestItemActions 
                    item={localItem} 
                    onAction={handleAction}
                    disabled={isLoading}
                />
            </div>
        </div>
    );
};

export default QuestItemCard;