import React from 'react';

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
    const baseClass = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
    // Secondary button styles can be added to index.css later or inline here
    const style = variant === 'secondary' ? {
        background: 'transparent',
        border: '2px solid var(--color-primary)',
        color: 'var(--color-primary)',
        padding: '10px 22px',
        borderRadius: '50px',
        fontWeight: '600'
    } : {};

    return (
        <button
            className={`${baseClass} ${className}`}
            onClick={onClick}
            style={style}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
