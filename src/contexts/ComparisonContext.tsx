import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

const COMPARISON_STORAGE_KEY = "emergency_tradesmen_comparison";

interface ComparisonContextType {
    items: string[];
    addToComparison: (businessId: string) => boolean;
    removeFromComparison: (businessId: string) => void;
    clearComparison: () => void;
    isInComparison: (businessId: string) => boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<string[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem(COMPARISON_STORAGE_KEY);
        if (stored) {
            try {
                setItems(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse comparison list", e);
            }
        }
    }, []);

    const saveItems = (newItems: string[]) => {
        setItems(newItems);
        localStorage.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(newItems));
    };

    const addToComparison = (businessId: string): boolean => {
        if (items.includes(businessId)) return false;
        if (items.length >= 4) return false;

        const newItems = [...items, businessId];
        saveItems(newItems);
        return true;
    };

    const removeFromComparison = (businessId: string) => {
        const newItems = items.filter(id => id !== businessId);
        saveItems(newItems);
    };

    const clearComparison = () => {
        saveItems([]);
    };

    const isInComparison = (businessId: string): boolean => {
        return items.includes(businessId);
    };

    return (
        <ComparisonContext.Provider value={{ items, addToComparison, removeFromComparison, clearComparison, isInComparison }}>
            {children}
        </ComparisonContext.Provider>
    );
}

export function useComparison() {
    const context = useContext(ComparisonContext);
    if (context === undefined) {
        throw new Error("useComparison must be used within a ComparisonProvider");
    }
    return context;
}
