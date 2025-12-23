import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    // 从 localStorage 读取用户偏好，默认为 'auto'
    const [themeMode, setThemeMode] = useState(() => {
        return localStorage.getItem('themeMode') || 'auto';
    });

    // 计算实际的主题（dark 或 light）
    const [actualTheme, setActualTheme] = useState('light');

    useEffect(() => {
        const updateTheme = () => {
            let theme;
            if (themeMode === 'auto') {
                theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            } else {
                theme = themeMode;
            }
            setActualTheme(theme);
            document.documentElement.setAttribute('data-theme', theme);
        };

        updateTheme();

        // 监听系统主题变化
        if (themeMode === 'auto') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => updateTheme();
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [themeMode]);

    const setTheme = (mode) => {
        setThemeMode(mode);
        localStorage.setItem('themeMode', mode);
    };

    const value = {
        themeMode, // 'auto', 'light', 'dark'
        actualTheme, // 'light' or 'dark'
        isDark: actualTheme === 'dark',
        setTheme
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
