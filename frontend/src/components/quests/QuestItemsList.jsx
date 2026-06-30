import React, { useState, useEffect, useRef, useMemo } from 'react';
import Error from '../common/Error';
import Header from '../layout/Header';
import QuestProgress from './QuestProgress';
import QuestItemCard from './QuestItemCard';
import Pagination from '../common/Pagination';

const QuestItemsList = ({ 
    items, 
    loading, 
    error, 
    pagination,
    progress,
    progressLoading,
    progressError,
    onRefresh, 
    onRefreshProgress,
    onUpdate,
    onPageChange,
    onPrev,
    onNext,
    onLimitChange,
    onSearch,
    onFilterChange,
    searchQuery: externalSearchQuery = '',
    hideCompleted: externalHideCompleted = false,
}) => {
    const [searchQuery, setSearchQuery] = useState(externalSearchQuery);
    const [hideCompleted, setHideCompleted] = useState(externalHideCompleted);
    const [isSearching, setIsSearching] = useState(false);
    const [localItems, setLocalItems] = useState(items);
    const debounceTimer = useRef(null);
    const searchInputRef = useRef(null);
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (!loading) {
            setLocalItems(items);
            if (!searchQuery) {
                setIsSearching(false);
            }
        }
    }, [items, loading, searchQuery]);

    const gridClass = useMemo(() => {
        const count = localItems.length;
        if (count === 0) return 'quest-items-grid';
        if (count === 1) return 'quest-items-grid has-1';
        if (count === 2) return 'quest-items-grid has-2';
        return 'quest-items-grid';
    }, [localItems.length]);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (externalSearchQuery !== searchQuery) {
            setSearchQuery(externalSearchQuery);
        }
    }, [externalSearchQuery]);

    useEffect(() => {
        if (isFirstRender.current) {
            return;
        }
        if (externalHideCompleted !== hideCompleted) {
            setHideCompleted(externalHideCompleted);
        }
    }, [externalHideCompleted]);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        
        if (value === '') {
            // Не сбрасываем isSearching сразу
        } else {
            setIsSearching(true);
        }
        
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        debounceTimer.current = setTimeout(() => {
            onSearch(value);
            setTimeout(() => {
                if (searchInputRef.current) {
                    searchInputRef.current.focus();
                }
            }, 50);
        }, 500);
    };

    const handleHideCompletedChange = (e) => {
        const checked = e.target.checked;
        setHideCompleted(checked);
        onFilterChange(checked);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        onSearch('');
    };

    const renderedItems = useMemo(() => {
        return localItems.map((item) => (
            <QuestItemCard 
                key={item.id} 
                item={item} 
                onAction={onUpdate} 
            />
        ));
    }, [localItems, onUpdate]);

    if (error === 'Не авторизован. Пожалуйста, войдите.') {
        return (
            <>
                <Header onRefresh={onRefresh} />
                <div className="error" style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
                    <h2>Сессия истекла</h2>
                    <p style={{ marginTop: '8px', color: '#666' }}>
                        Пожалуйста, войдите заново
                    </p>
                    <button 
                        onClick={() => window.location.href = '/'}
                        className="auth-submit"
                        style={{ maxWidth: '200px', margin: '20px auto' }}
                    >
                        Войти
                    </button>
                </div>
            </>
        );
    }

    const hasSearchQuery = searchQuery && searchQuery.trim().length > 0;
    const showNotFound = (hasSearchQuery || isSearching) && localItems.length === 0;
    const showLoading = loading && localItems.length === 0 && !showNotFound;

    return (
        <>
            <Header onRefresh={onRefresh} />
            {error && <Error message={error} />}
            
            <QuestProgress 
                progress={progress}
                loading={progressLoading}
                error={progressError}
                onRefresh={onRefreshProgress}
            />

            <div className="filters-container">
                <div className="search-wrapper">
                    <input
                        ref={searchInputRef}
                        type="text"
                        className="search-input"
                        placeholder="🔍 Поиск по названию предмета..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                    {searchQuery && (
                        <button 
                            className="search-clear"
                            onClick={handleClearSearch}
                        >
                            ✕
                        </button>
                    )}
                </div>
                <label className="filter-checkbox">
                    <input
                        type="checkbox"
                        checked={hideCompleted}
                        onChange={handleHideCompletedChange}
                    />
                    <span>Скрыть выполненные</span>
                </label>
            </div>
            
            {/* Всегда показываем блок, пока нет предметов */}
            {localItems.length === 0 ? (
                <div className="empty-state">
                    {showNotFound ? (
                        <>
                            <div className="empty-icon">🔍</div>
                            <div className="empty-title">Ничего не найдено</div>
                            <div className="empty-text">
                                По запросу <strong>"{searchQuery}"</strong> предметов не найдено
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="empty-icon">⏳</div>
                            <div className="empty-title">Загрузка...</div>
                            <div className="empty-text">Пожалуйста, подождите</div>
                        </>
                    )}
                </div>
            ) : (
                <div className={gridClass}>
                    {renderedItems}
                </div>
            )}
            
            <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={onPageChange}
                onPrev={onPrev}
                onNext={onNext}
                hasPrev={!!pagination.previous}
                hasNext={!!pagination.next}
                totalItems={pagination.count}
                currentLimit={pagination.limit}
                onLimitChange={onLimitChange}
            />
        </>
    );
};

export default QuestItemsList;