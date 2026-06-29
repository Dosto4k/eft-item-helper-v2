import React from 'react';

const Loading = ({ message = 'Загрузка...' }) => {
    return <div className="loading">{message}</div>;
};

export default Loading;