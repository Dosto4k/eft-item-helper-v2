import React, { useState, useEffect, useRef } from 'react';
import Error from '../common/Error';

const QuestProgress = ({ progress, loading, error, onRefresh }) => {
    const [changedFields, setChangedFields] = useState({});
    const prevProgressRef = useRef(null);
    const timerRef = useRef(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (progress && prevProgressRef.current) {
            const changes = {};
            
            const fields = ['completed', 'in_raid_completed', 'out_raid_completed', 'in_progress', 'total'];
            fields.forEach(field => {
                if (prevProgressRef.current[field] !== progress[field]) {
                    changes[field] = true;
                }
            });
            
            if (Object.keys(changes).length > 0) {
                setChangedFields(changes);
                
                if (timerRef.current) {
                    clearTimeout(timerRef.current);
                }
                timerRef.current = setTimeout(() => {
                    setChangedFields({});
                }, 600);
            }
        }
        
        prevProgressRef.current = progress;
    }, [progress]);

    if (error) {
        return (
            <div className="progress-container">
                <div className="progress-header">
                    <h2 className="progress-title">📊 Прогресс выполнения квестовых предметов</h2>
                </div>
                <Error message={error} />
                <button onClick={onRefresh} className="btn-refresh" style={{ marginTop: '12px' }}>
                    🔄 Повторить
                </button>
            </div>
        );
    }

    if (!progress) {
        return (
            <div className="progress-container">
                <div className="progress-header">
                    <h2 className="progress-title">📊 Прогресс выполнения квестовых предметов</h2>
                </div>
                <div className="progress-empty">
                    <span>Загрузка данных...</span>
                </div>
            </div>
        );
    }

    const {
        total,
        completed,
        in_raid_completed,
        out_raid_completed,
        progress: percent,
        in_progress
    } = progress;

    const inRaidPercent = total > 0 ? Math.round((in_raid_completed / total) * 100) : 0;
    const outRaidPercent = total > 0 ? Math.round((out_raid_completed / total) * 100) : 0;

    const isChanged = (field) => changedFields[field] || false;

    return (
        <div className="progress-container">
            <div className="progress-header">
                <h2 className="progress-title">📊 Прогресс выполнения квестовых предметов</h2>
                {/* Кнопка удалена */}
            </div>

            <div className="progress-bar-wrapper">
                <div className="progress-bar-header">
                    <span className="progress-bar-label">Общий прогресс</span>
                    <span className="progress-bar-value">
                        <span className={`progress-number ${isChanged('completed') ? 'changed' : ''}`}>
                            {loading ? '...' : completed}
                        </span>
                        <span className="progress-separator"> / </span>
                        <span className="progress-number">{total}</span>
                        <span className="progress-percent"> ({loading ? '...' : percent}%)</span>
                    </span>
                </div>
                <div className="progress-bar">
                    <div 
                        className="progress-bar-fill"
                        style={{ 
                            width: loading ? '0%' : `${Math.min(percent, 100)}%`,
                            transition: 'width 0.4s ease'
                        }}
                    />
                </div>
            </div>

            <div className="progress-dual">
                <div className="progress-dual-item">
                    <div className="progress-dual-header">
                        <span className="progress-dual-label">
                            <span className="progress-dual-icon">🏃</span> Найденные в рейде
                        </span>
                        <span className="progress-dual-value">
                            <span className={`progress-number ${isChanged('in_raid_completed') ? 'changed' : ''}`}>
                                {loading ? '...' : in_raid_completed}
                            </span>
                            <span className="progress-separator"> / </span>
                            <span className="progress-number">{total}</span>
                            <span className="progress-percent"> ({loading ? '...' : inRaidPercent}%)</span>
                        </span>
                    </div>
                    <div className="progress-dual-bar">
                        <div 
                            className="progress-dual-fill in-raid"
                            style={{ 
                                width: loading ? '0%' : `${Math.min(inRaidPercent, 100)}%`,
                                transition: 'width 0.4s ease'
                            }}
                        />
                    </div>
                </div>

                <div className="progress-dual-item">
                    <div className="progress-dual-header">
                        <span className="progress-dual-label">
                            <span className="progress-dual-icon">🏠</span> Найденные не в рейде
                        </span>
                        <span className="progress-dual-value">
                            <span className={`progress-number ${isChanged('out_raid_completed') ? 'changed' : ''}`}>
                                {loading ? '...' : out_raid_completed}
                            </span>
                            <span className="progress-separator"> / </span>
                            <span className="progress-number">{total}</span>
                            <span className="progress-percent"> ({loading ? '...' : outRaidPercent}%)</span>
                        </span>
                    </div>
                    <div className="progress-dual-bar">
                        <div 
                            className="progress-dual-fill out-raid"
                            style={{ 
                                width: loading ? '0%' : `${Math.min(outRaidPercent, 100)}%`,
                                transition: 'width 0.4s ease'
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="progress-grid">
                <div className="progress-card progress-card-completed">
                    <div className="progress-card-icon">✅</div>
                    <div className="progress-card-content">
                        <div className={`progress-card-value ${isChanged('completed') ? 'changed' : ''}`}>
                            {loading ? '...' : completed}
                        </div>
                        <div className="progress-card-label">Выполнено полностью</div>
                        <div className="progress-card-sub">Найдены в рейде и не в рейде</div>
                    </div>
                </div>

                <div className="progress-card progress-card-inraid">
                    <div className="progress-card-icon">🏃</div>
                    <div className="progress-card-content">
                        <div className={`progress-card-value ${isChanged('in_raid_completed') ? 'changed' : ''}`}>
                            {loading ? '...' : in_raid_completed}
                        </div>
                        <div className="progress-card-label">Найдены в рейде</div>
                        <div className="progress-card-sub">{loading ? '...' : inRaidPercent}% от всех предметов</div>
                    </div>
                </div>

                <div className="progress-card progress-card-outraid">
                    <div className="progress-card-icon">🏠</div>
                    <div className="progress-card-content">
                        <div className={`progress-card-value ${isChanged('out_raid_completed') ? 'changed' : ''}`}>
                            {loading ? '...' : out_raid_completed}
                        </div>
                        <div className="progress-card-label">Найдены не в рейде</div>
                        <div className="progress-card-sub">{loading ? '...' : outRaidPercent}% от всех предметов</div>
                    </div>
                </div>

                <div className="progress-card progress-card-progress">
                    <div className="progress-card-icon">⏳</div>
                    <div className="progress-card-content">
                        <div className={`progress-card-value ${isChanged('in_progress') ? 'changed' : ''}`}>
                            {loading ? '...' : in_progress}
                        </div>
                        <div className="progress-card-label">В процессе</div>
                        <div className="progress-card-sub">Еще не выполнены полностью</div>
                    </div>
                </div>
            </div>

            <div className="progress-total">
                <span className="progress-total-label">📦 Всего квестовых предметов:</span>
                <span className={`progress-total-value ${isChanged('total') ? 'changed' : ''}`}>
                    {loading ? '...' : total}
                </span>
            </div>
        </div>
    );
};

export default QuestProgress;