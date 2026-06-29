import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Header = ({ onRefresh }) => {
    const { logout } = useAuth();

    return (
        <div className="header">
            <h1 className="header-title">📦 Квестовые предметы</h1>
            <div className="header-actions">
                <button onClick={onRefresh} className="btn-refresh">
                    🔄 Обновить
                </button>
                <button onClick={logout} className="btn-logout">
                    Выйти
                </button>
            </div>
        </div>
    );
};

export default Header;