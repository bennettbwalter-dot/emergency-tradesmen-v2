import { createContext, useContext, useState, ReactNode } from 'react';

interface ChatbotState {
    detectedTrade: string | null;
    detectedCity: string | null;
    isRequestingLocation: boolean;
    setDetectedTrade: (trade: string | null) => void;
    setDetectedCity: (city: string | null) => void;
    setIsRequestingLocation: (isRequesting: boolean) => void;
}

const ChatbotContext = createContext<ChatbotState | undefined>(undefined);

export function ChatbotProvider({ children }: { children: ReactNode }) {
    const [detectedTrade, setDetectedTrade] = useState<string | null>(null);
    const [detectedCity, setDetectedCity] = useState<string | null>(null);
    const [isRequestingLocation, setIsRequestingLocation] = useState(false);

    return (
        <ChatbotContext.Provider value={{ detectedTrade, detectedCity, isRequestingLocation, setDetectedTrade, setDetectedCity, setIsRequestingLocation }}>
            {children}
        </ChatbotContext.Provider>
    );
}

export function useChatbot() {
    const context = useContext(ChatbotContext);
    if (context === undefined) {
        throw new Error('useChatbot must be used within a ChatbotProvider');
    }
    return context;
}
