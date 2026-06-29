import React from 'react';
import QuestItemActions from './QuestItemActions';

const QuestItemCard = ({ item, onAction }) => {
    const isComplete = item.collect_in_raid >= item.required_in_raid &&
                       item.collect_out_raid >= item.required_out_raid;

    return (
        <div className={`quest-item-card ${isComplete ? 'completed' : ''}`}>
            <div className="quest-item-content">
                <div className="quest-item-info">
                    <h3 className="quest-item-name">
                        {item.name}
                        {isComplete && (
                            <span className="quest-item-badge">✅ Выполнено</span>
                        )}
                    </h3>

                    <div className="quest-item-counts">
                        <div>
                            <span style={{ color: '#666', fontSize: '13px' }}>В рейде:</span>
                            <span className={`quest-item-count ${item.collect_in_raid >= item.required_in_raid ? 'completed' : 'pending'}`}>
                                {item.collect_in_raid} / {item.required_in_raid}
                            </span>
                        </div>
                        <div>
                            <span style={{ color: '#666', fontSize: '13px' }}>Не в рейде:</span>
                            <span className={`quest-item-count ${item.collect_out_raid >= item.required_out_raid ? 'completed' : 'pending'}`}>
                                {item.collect_out_raid} / {item.required_out_raid}
                            </span>
                        </div>
                    </div>

                    {item.quests && item.quests.length > 0 && (
                        <div className="quest-item-quests">
                            {item.quests.map((quest) => (
                                <span key={quest.name} className="quest-tag">
                                    {quest.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <QuestItemActions item={item} onAction={onAction} />
            </div>
        </div>
    );
};

export default QuestItemCard;