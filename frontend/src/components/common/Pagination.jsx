import React from 'react';

const Pagination = ({ 
    currentPage, 
    totalPages, 
    onPageChange,
    onPrev,
    onNext,
    hasPrev,
    hasNext,
    totalItems,
    currentLimit,
    onLimitChange,
    limits = [10, 15, 25, 50, 100]
}) => {
    // Генерация номеров страниц для отображения
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        const halfVisible = Math.floor(maxVisible / 2);
        
        let start = Math.max(1, currentPage - halfVisible);
        let end = Math.min(totalPages, currentPage + halfVisible);
        
        if (end - start + 1 < maxVisible) {
            if (start === 1) {
                end = Math.min(totalPages, start + maxVisible - 1);
            } else if (end === totalPages) {
                start = Math.max(1, end - maxVisible + 1);
            }
        }
        
        // Добавляем первую страницу
        if (start > 1) {
            pages.push(1);
            if (start > 2) pages.push('...');
        }
        
        // Добавляем видимые страницы
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        
        // Добавляем последнюю страницу
        if (end < totalPages) {
            if (end < totalPages - 1) pages.push('...');
            pages.push(totalPages);
        }
        
        return pages;
    };

    return (
        <div className="pagination-container">
            <div className="pagination-info">
                <span>
                    Показано {Math.min((currentPage - 1) * currentLimit + 1, totalItems)} - 
                    {' '}{Math.min(currentPage * currentLimit, totalItems)} из {totalItems} предметов
                </span>
            </div>
            
            <div className="pagination-controls">
                <div className="pagination-limits">
                    <label>На странице:</label>
                    <select 
                        value={currentLimit} 
                        onChange={(e) => onLimitChange(Number(e.target.value))}
                        className="pagination-limit-select"
                    >
                        {limits.map(limit => (
                            <option key={limit} value={limit}>{limit}</option>
                        ))}
                    </select>
                </div>

                <div className="pagination-buttons">
                    <button 
                        onClick={onPrev}
                        disabled={!hasPrev}
                        className="pagination-btn"
                    >
                        ◀
                    </button>
                    
                    {getPageNumbers().map((page, index) => (
                        <button
                            key={index}
                            onClick={() => typeof page === 'number' && onPageChange(page)}
                            disabled={page === '...' || page === currentPage}
                            className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                            style={{
                                cursor: page === '...' ? 'default' : 'pointer',
                            }}
                        >
                            {page}
                        </button>
                    ))}
                    
                    <button 
                        onClick={onNext}
                        disabled={!hasNext}
                        className="pagination-btn"
                    >
                        ▶
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Pagination;