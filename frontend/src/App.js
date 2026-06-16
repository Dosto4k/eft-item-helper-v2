import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import QuestFilter from './components/QuestFilter';
import ItemList from './components/ItemList';
import AuthModal from './components/AuthModal';
import { api } from './services/api';
import { useAuth } from './context/AuthContext';
import './App.css';

function App() {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [quests, setQuests] = useState([]);
    const [selectedQuest, setSelectedQuest] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const { isAuthenticated, logout } = useAuth();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await api.getAllItems();

            setItems(data);
            setFilteredItems(data);

            const allQuests = new Set();
            data.forEach(item => {
                if (item.quests) {
                    item.quests.forEach(quest => {
                        if (quest.name) {
                            allQuests.add(quest.name);
                        }
                    });
                }
            });
            setQuests(Array.from(allQuests).sort());
        } catch (err) {
            setError('Ошибка загрузки данных: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = (currentItems, quest, search) => {
        let filtered = [...currentItems];

        if (quest) {
            filtered = filtered.filter(item =>
                item.quests && item.quests.some(q => q.name === quest)
            );
        }

        if (search.trim()) {
            const lowerSearch = search.toLowerCase();
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(lowerSearch) ||
                (item.quests && item.quests.some(q =>
                    q.name.toLowerCase().includes(lowerSearch)
                ))
            );
        }

        return filtered;
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        setFilteredItems(applyFilters(items, selectedQuest, term));
    };

    const handleQuestSelect = (quest) => {
        setSelectedQuest(quest);
        setFilteredItems(applyFilters(items, quest, searchTerm));
    };

    const handleToggleOwned = async (itemId) => {
        if (!isAuthenticated) {
            setShowAuthModal(true);
            return;
        }

        try {
            const updatedItem = await api.toggleItemOwned(itemId);
            setItems(prevItems =>
                prevItems.map(item =>
                    item.id === itemId ? { ...item, owned: updatedItem.owned } : item
                )
            );
            setFilteredItems(prevItems =>
                prevItems.map(item =>
                    item.id === itemId ? { ...item, owned: updatedItem.owned } : item
                )
            );
        } catch (err) {
            console.error('Ошибка обновления статуса:', err);
        }
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <p>Загрузка данных...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error">
                <h2>Ошибка</h2>
                <p>{error}</p>
                <button onClick={loadData}>Попробовать снова</button>
            </div>
        );
    }

    return (
        <div className="App">
            <Header
                onLoginClick={() => setShowAuthModal(true)}
                onLogout={logout}
            />
            <main>
                <SearchBar onSearch={handleSearch} />
                <QuestFilter
                    quests={quests}
                    selectedQuest={selectedQuest}
                    onSelectQuest={handleQuestSelect}
                />
                <div className="stats-summary">
                    <p>Найдено предметов: <strong>{filteredItems.length}</strong></p>
                </div>
                <ItemList items={filteredItems} onToggleOwned={handleToggleOwned} />
            </main>
            {showAuthModal && (
                <AuthModal onClose={() => setShowAuthModal(false)} />
            )}
        </div>
    );
}

export default App;