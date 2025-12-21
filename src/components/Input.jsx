import React from 'react';

const Input = ({ label, error, className = '', ...props }) => {
    return (
        <div className={`input-group ${className}`} style={{ marginBottom: '16px' }}>
            {label && (
                <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: 'var(--color-text)',
                    fontSize: '0.95rem'
                }}>
                    {label}
                </label>
            )}
            <input
                style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: error ? '2px solid var(--color-danger)' : '2px solid transparent',
                    backgroundColor: '#FFF',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
                    fontSize: '1rem',
                    color: 'var(--color-text)',
                    transition: 'all 0.2s ease'
                }}
                {...props}
            />
            {error && (
                <span style={{
                    color: '#FF6B6B',
                    fontSize: '0.85rem',
                    marginTop: '4px',
                    display: 'block'
                }}>
                    {error}
                </span>
            )}
        </div>
    );
};

export default Input;
