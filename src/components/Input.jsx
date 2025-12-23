import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const Input = ({ label, error, className = '', ...props }) => {
    const { isDark } = useTheme();

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
                    border: error ? '2px solid var(--color-danger)' : `2px solid ${isDark ? '#4a4a4a' : 'transparent'}`,
                    backgroundColor: isDark ? '#3a3a3a' : '#FFF',
                    boxShadow: isDark ? 'none' : 'inset 0 2px 4px rgba(0,0,0,0.02)',
                    fontSize: '1rem',
                    color: isDark ? '#e0e0e0' : 'var(--color-text)',
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

