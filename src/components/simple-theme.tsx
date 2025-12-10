import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext<any>(null);

export function SimpleThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<string>(() => {
        try {
            return localStorage.getItem("vite-ui-theme") || "dark";
        } catch {
            return "dark";
        }
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(theme);
    }, [theme]);

    const setTheme = (t: string) => {
        try {
            localStorage.setItem("vite-ui-theme", t);
        } catch { }
        setThemeState(t);
    };

    const value = {
        theme,
        setTheme,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useSimpleTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        return { theme: "dark", setTheme: () => { } };
    }
    return context;
};
