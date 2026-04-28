"use client"
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface SimpleThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const SimpleThemeContext = createContext<SimpleThemeContextType | undefined>(undefined);

export function SimpleThemeProvider({ children }: { children: React.ReactNode }) {
    // Check for saved theme or determine default based on device type
    const [theme, setThemeState] = useState<Theme>(() => {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('app-theme') as Theme : null;
        if (saved) return saved;
        return 'dark';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        localStorage.setItem('app-theme', newTheme);
        setThemeState(newTheme);
    };

    const toggleTheme = () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
    };

    return (
        <SimpleThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </SimpleThemeContext.Provider>
    );
}

export function useSimpleTheme() {
    const context = useContext(SimpleThemeContext);
    if (context === undefined) {
        throw new Error('useSimpleTheme must be used within a SimpleThemeProvider');
    }
    return context;
}
