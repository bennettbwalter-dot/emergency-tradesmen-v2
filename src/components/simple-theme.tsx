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
    // Always default to dark mode for this premium app
    const [theme, setTheme] = useState<Theme>('dark');

    useEffect(() => {
        // Check system preference or local storage if needed, but defaulting to dark for now
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
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
