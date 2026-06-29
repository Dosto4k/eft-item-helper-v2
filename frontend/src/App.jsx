import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useQuests } from './hooks/useQuests';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import QuestItemsList from './components/quests/QuestItemsList';
import Loading from './components/common/Loading';
import './index.css';

function App() {
    const { token, loading: authLoading } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const { items, loading, error, fetchItems, updateItem } = useQuests();

    const handleUpdate = async (id, action, inRaid) => {
        await updateItem(id, action, inRaid);
    };

    if (authLoading) {
        return <Loading message="Загрузка приложения..." />;
    }

    if (!token) {
        return (
            <div className="container auth-container">
                <div className="auth-box">
                    {isLogin ? (
                        <Login onSwitchToRegister={() => setIsLogin(false)} />
                    ) : (
                        <Register 
                            onSwitchToLogin={() => setIsLogin(true)}
                            onSuccess={() => setIsLogin(true)}
                        />
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <QuestItemsList
                items={items}
                loading={loading}
                error={error}
                onRefresh={fetchItems}
                onUpdate={handleUpdate}
            />
        </div>
    );
}

export default App;