import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { questsApi } from '../api/quests';

export const useQuests = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [hideCompleted, setHideCompleted] = useState(false);
    const [pagination, setPagination] = useState({
        count: 0,
        next: null,
        previous: null,
        limit: 15,
        offset: 0,
        currentPage: 1,
        totalPages: 0,
    });
    const isFetching = useRef(false);
    const fetchCounter = useRef(0);
    const currentFilters = useRef({ search: '', hide: false, page: 1, limit: 15 });
    const isInitialLoad = useRef(true);

    const fetchItems = useCallback(async (page = 1, limit = 15, search = '', hide = false) => {
        if (isFetching.current) return;
        
        const currentFetchId = ++fetchCounter.current;
        currentFilters.current = { search, hide, page, limit };
        
        try {
            isFetching.current = true;
            // Показываем loading только при первом запуске или при смене фильтра без поиска
            if (isInitialLoad.current || (!search && !hide)) {
                setLoading(true);
            }
            const offset = (page - 1) * limit;
            
            const params = { limit, offset };
            if (search) {
                params.item_name = search;
            }
            if (hide) {
                params.hide_completed = true;
            }
            
            const data = await questsApi.getQuestItems(params);
            
            if (currentFetchId !== fetchCounter.current) {
                return;
            }
            
            setItems(data.results || []);
            setPagination({
                count: data.count || 0,
                next: data.next,
                previous: data.previous,
                limit: limit,
                offset: offset,
                currentPage: page,
                totalPages: Math.ceil((data.count || 0) / limit),
            });
            setError('');
            isInitialLoad.current = false;
        } catch (err) {
            if (currentFetchId !== fetchCounter.current) {
                return;
            }
            if (err.message === 'Не авторизован. Пожалуйста, войдите.') {
                setError(err.message);
            } else {
                setError('Не удалось загрузить список предметов');
            }
            console.error(err);
        } finally {
            if (currentFetchId === fetchCounter.current) {
                setLoading(false);
                isFetching.current = false;
            }
        }
    }, []);

    const updateItem = useCallback(async (id, action, inRaid, onProgressUpdate, updatedItem) => {
        try {
            await questsApi.updateQuestCount(id, action, inRaid);
            setError('');
            
            if (onProgressUpdate) {
                await onProgressUpdate();
            }

            if (updatedItem) {
                const isComplete = updatedItem.collect_in_raid >= updatedItem.required_in_raid &&
                                   updatedItem.collect_out_raid >= updatedItem.required_out_raid;
                
                if (isComplete && currentFilters.current.hide) {
                    await fetchItems(
                        currentFilters.current.page,
                        currentFilters.current.limit,
                        currentFilters.current.search,
                        currentFilters.current.hide
                    );
                }
            }
        } catch (err) {
            console.error('Ошибка обновления:', err);
            setError(err.response?.data?.detail || 'Ошибка обновления');
            setTimeout(() => setError(''), 3000);
            throw err;
        }
    }, [fetchItems]);

    const handleSearch = useCallback((query) => {
        setSearchQuery(query);
        fetchItems(1, pagination.limit, query, hideCompleted);
    }, [fetchItems, pagination.limit, hideCompleted]);

    const handleFilterChange = useCallback((hide) => {
        setHideCompleted(hide);
        fetchItems(1, pagination.limit, searchQuery, hide);
    }, [fetchItems, pagination.limit, searchQuery]);

    const nextPage = useCallback(() => {
        if (pagination.next) {
            fetchItems(pagination.currentPage + 1, pagination.limit, searchQuery, hideCompleted);
        }
    }, [pagination, fetchItems, searchQuery, hideCompleted]);

    const prevPage = useCallback(() => {
        if (pagination.previous) {
            fetchItems(pagination.currentPage - 1, pagination.limit, searchQuery, hideCompleted);
        }
    }, [pagination, fetchItems, searchQuery, hideCompleted]);

    const goToPage = useCallback((page) => {
        if (page >= 1 && page <= pagination.totalPages) {
            fetchItems(page, pagination.limit, searchQuery, hideCompleted);
        }
    }, [pagination, fetchItems, searchQuery, hideCompleted]);

    const changeLimit = useCallback((newLimit) => {
        fetchItems(1, newLimit, searchQuery, hideCompleted);
    }, [fetchItems, searchQuery, hideCompleted]);

    useEffect(() => {
        fetchItems(1, 15, '', false);
    }, []);

    return useMemo(() => ({ 
        items, 
        loading, 
        error, 
        pagination,
        searchQuery,
        hideCompleted,
        fetchItems, 
        updateItem,
        nextPage,
        prevPage,
        goToPage,
        changeLimit,
        handleSearch,
        handleFilterChange,
    }), [items, loading, error, pagination, searchQuery, hideCompleted]);
};