import React from 'react';

const QuestItemActions = ({ item, onAction, disabled = false }) => {
    const isInRaidMax = item.collect_in_raid >= item.required_in_raid;
    const isOutRaidMax = item.collect_out_raid >= item.required_out_raid;
    const isInRaidMin = item.collect_in_raid === 0;
    const isOutRaidMin = item.collect_out_raid === 0;

    return (
        <div className="quest-item-actions">
            <div className="action-group">
                <span className="action-label">В рейде</span>
                <div className="action-buttons">
                    <button
                        onClick={() => onAction('increment', true)}
                        className="btn-increment"
                        disabled={disabled || isInRaidMax}
                    >
                        +
                    </button>
                    <button
                        onClick={() => onAction('decrement', true)}
                        className="btn-decrement"
                        disabled={disabled || isInRaidMin}
                    >
                        −
                    </button>
                </div>
            </div>

            <div className="action-group">
                <span className="action-label">Не в рейде</span>
                <div className="action-buttons">
                    <button
                        onClick={() => onAction('increment', false)}
                        className="btn-increment"
                        disabled={disabled || isOutRaidMax}
                    >
                        +
                    </button>
                    <button
                        onClick={() => onAction('decrement', false)}
                        className="btn-decrement"
                        disabled={disabled || isOutRaidMin}
                    >
                        −
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuestItemActions;