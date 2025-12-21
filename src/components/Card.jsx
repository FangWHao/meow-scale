import React from 'react';

const Card = ({ children, className = '', title, ...props }) => {
    return (
        <div className={`card ${className}`} {...props}>
            {title && <h2 style={{ marginBottom: '16px', color: 'var(--color-text)', fontSize: '1.4rem' }}>{title}</h2>}
            {children}
        </div>
    );
};

export default Card;
