import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import './SearchBar.css';

const SearchBar = ({ onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target) &&
                inputRef.current &&
                !inputRef.current.contains(event.target)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchTerm.trim().length < 2) {
                setSuggestions([]);
                return;
            }

            setLoading(true);
            try {
                const results = await api.autocomplete(searchTerm);
                setSuggestions(results);
                setShowSuggestions(true);
            } catch (error) {
                console.error('Ошибка автодополнения:', error);
                setSuggestions([]);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(searchTerm);
        setShowSuggestions(false);
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchTerm(suggestion.text);
        onSearch(suggestion.text);
        setShowSuggestions(false);
    };

    return (
        <div className="search-container">
            <form className="search-bar" onSubmit={handleSubmit}>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Поиск предметов или квестов..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    className="search-input"
                />
                <button type="submit" className="search-button">
                    Найти
                </button>
            </form>

            {showSuggestions && suggestions.length > 0 && (
                <div ref={suggestionsRef} className="suggestions-dropdown">
                    {loading && <div className="suggestions-loading">Загрузка...</div>}
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={index}
                            className="suggestion-item"
                            onClick={() => handleSuggestionClick(suggestion)}
                        >
                            <span className="suggestion-type">{suggestion.type === 'item' ? 'Предмет' : 'Квест'}</span>
                            <span className="suggestion-text">{suggestion.text}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchBar;