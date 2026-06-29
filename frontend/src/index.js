import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import './index.css';
import App from './App';

// Добавляем стиль для предотвращения мигания при загрузке
const rootElement = document.getElementById('root');
if (rootElement) {
    rootElement.style.display = 'flex';
    rootElement.style.minHeight = '100vh';
    rootElement.style.alignItems = 'center';
    rootElement.style.justifyContent = 'center';
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <AuthProvider>
            <App />
        </AuthProvider>
    </React.StrictMode>
);