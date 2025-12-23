import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const Button = ({ children, onClick, variant = 'primary', className = '', style = {}, ...props }) => {
    const { isDark } = useTheme();

    // 主要按钮样式：描边 + 光晕效果
    const primaryStyle = {
        background: isDark ? 'transparent' : 'transparent',
        border: '2px solid var(--color-primary)',
        color: 'var(--color-primary)',
        padding: '12px 24px',
        borderRadius: '50px',
        fontWeight: '600',
        fontSize: '1rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: `0 0 15px rgba(255, 183, 178, ${isDark ? '0.3' : '0.4'}), 0 0 30px rgba(255, 183, 178, ${isDark ? '0.15' : '0.2'})`,
        ...style
    };

    // 次要按钮样式
    const secondaryStyle = {
        background: 'transparent',
        border: `2px solid ${isDark ? 'var(--color-secondary)' : 'var(--color-secondary)'}`,
        color: 'var(--color-secondary)',
        padding: '12px 24px',
        borderRadius: '50px',
        fontWeight: '600',
        fontSize: '1rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: `0 0 15px rgba(95, 212, 168, ${isDark ? '0.3' : '0.4'}), 0 0 30px rgba(95, 212, 168, ${isDark ? '0.15' : '0.2'})`,
        ...style
    };

    const buttonStyle = variant === 'secondary' ? secondaryStyle : primaryStyle;

    return (
        <button
            className={className}
            onClick={onClick}
            style={buttonStyle}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;

