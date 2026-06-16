import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = ({ onLoginClick, onLogout }) => {
    const { user, isAuthenticated } = useAuth();

    return (
        <header className="header">
            <div className="header-content">
                <div className="header-logo">
                    <img
                        src="/images/tarkov-banner.png"
                        alt="EFT Item Helper"
                        className="header-image"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/120x120/4a7c59/ffffff?text=EFT";
                        }}
                    />
                </div>
                <div className="header-text">
                    <h1>EFT Item Helper</h1>
                    <p>Отслеживайте предметы для квестов в Escape from Tarkov</p>
                </div>
                <div className="header-auth">
                    {isAuthenticated ? (
                        <div className="user-info">
                            <span className="username">{user.username}</span>
                            <button onClick={onLogout} className="auth-button">
                                Выйти
                            </button>
                        </div>
                    ) : (
                        <button onClick={onLoginClick} className="auth-button">
                            Войти
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;