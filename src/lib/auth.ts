// User account data types
export interface User {
    id: string;
    email: string;
    name: string;
    phone?: string;
    postcode?: string;
    avatar?: string;
    createdAt: string;
    lastLogin: string;
    emailVerified: boolean;
    preferences: UserPreferences;
}

export interface UserPreferences {
    notifications: {
        email: boolean;
        sms: boolean;
        marketing: boolean;
    };
    defaultLocation?: string;
    savedAddresses: SavedAddress[];
}

export interface SavedAddress {
    id: string;
    label: string;
    address: string;
    postcode: string;
    isDefault: boolean;
}

export interface FavoriteBusiness {
    id: string;
    businessId: string;
    businessName: string;
    tradeName: string;
    city: string;
    savedAt: string;
    notes?: string;
}

export interface QuoteRequestHistory {
    id: string;
    businessId: string;
    businessName: string;
    tradeName: string;
    urgency: string;
    description: string;
    status: "pending" | "quoted" | "accepted" | "declined" | "completed";
    createdAt: string;
    updatedAt: string;
    quote?: {
        amount: number;
        currency: string;
        validUntil: string;
        notes: string;
    };
}

export interface UserStats {
    totalQuoteRequests: number;
    acceptedQuotes: number;
    favoriteBusinesses: number;
    reviewsWritten: number;
}

// Mock user data for demonstration
export const mockUser: User = {
    id: "user-1",
    email: "john.smith@example.com",
    name: "John Smith",
    phone: "07123 456789",
    postcode: "SW1A 1AA",
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date().toISOString(),
    emailVerified: true,
    preferences: {
        notifications: {
            email: true,
            sms: false,
            marketing: false,
        },
        savedAddresses: [
            {
                id: "addr-1",
                label: "Home",
                address: "10 Downing Street",
                postcode: "SW1A 2AA",
                isDefault: true,
            },
        ],
    },
};

// Local storage keys
export const STORAGE_KEYS = {
    USER: "emergency-tradesmen-user",
    FAVORITES: "emergency-tradesmen-favorites",
    QUOTE_HISTORY: "emergency-tradesmen-quote-history",
    AUTH_TOKEN: "emergency-tradesmen-auth-token",
} as const;

// User management functions
export function saveUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

export function getUser(): User | null {
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    return userData ? JSON.parse(userData) : null;
}

export function clearUser(): void {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
}

export function isAuthenticated(): boolean {
    return !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
}

// Favorites management
export function getFavorites(): FavoriteBusiness[] {
    const favoritesData = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return favoritesData ? JSON.parse(favoritesData) : [];
}

export function saveFavorites(favorites: FavoriteBusiness[]): void {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
}

export function addFavorite(favorite: Omit<FavoriteBusiness, "id" | "savedAt">): void {
    const favorites = getFavorites();
    const newFavorite: FavoriteBusiness = {
        ...favorite,
        id: `fav-${Date.now()}`,
        savedAt: new Date().toISOString(),
    };
    favorites.push(newFavorite);
    saveFavorites(favorites);
}

export function removeFavorite(businessId: string): void {
    const favorites = getFavorites();
    const updated = favorites.filter((f) => f.businessId !== businessId);
    saveFavorites(updated);
}

export function isFavorite(businessId: string): boolean {
    const favorites = getFavorites();
    return favorites.some((f) => f.businessId === businessId);
}

// Quote history management
export function getQuoteHistory(): QuoteRequestHistory[] {
    const historyData = localStorage.getItem(STORAGE_KEYS.QUOTE_HISTORY);
    return historyData ? JSON.parse(historyData) : [];
}

export function saveQuoteHistory(history: QuoteRequestHistory[]): void {
    localStorage.setItem(STORAGE_KEYS.QUOTE_HISTORY, JSON.stringify(history));
}

export function addQuoteToHistory(quote: Omit<QuoteRequestHistory, "id" | "createdAt" | "updatedAt">): void {
    const history = getQuoteHistory();
    const newQuote: QuoteRequestHistory = {
        ...quote,
        id: `quote-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    history.unshift(newQuote); // Add to beginning
    saveQuoteHistory(history);
}

export function getUserStats(): UserStats {
    const favorites = getFavorites();
    const quoteHistory = getQuoteHistory();

    return {
        totalQuoteRequests: quoteHistory.length,
        acceptedQuotes: quoteHistory.filter((q) => q.status === "accepted").length,
        favoriteBusinesses: favorites.length,
        reviewsWritten: 0, // Would come from reviews system
    };
}

// Mock authentication functions
export function mockLogin(email: string, password: string): Promise<{ user: User; token: string }> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (email && password.length >= 6) {
                const token = `mock-token-${Date.now()}`;
                localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
                saveUser(mockUser);
                resolve({ user: mockUser, token });
            } else {
                reject(new Error("Invalid credentials"));
            }
        }, 1000);
    });
}

export function mockRegister(
    name: string,
    email: string,
    password: string
): Promise<{ user: User; token: string }> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (name && email && password.length >= 6) {
                const newUser: User = {
                    id: `user-${Date.now()}`,
                    email,
                    name,
                    createdAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString(),
                    emailVerified: false,
                    preferences: {
                        notifications: {
                            email: true,
                            sms: false,
                            marketing: false,
                        },
                        savedAddresses: [],
                    },
                };
                const token = `mock-token-${Date.now()}`;
                localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
                saveUser(newUser);
                resolve({ user: newUser, token });
            } else {
                reject(new Error("Invalid registration data"));
            }
        }, 1000);
    });
}

export function logout(): void {
    clearUser();
    // Don't clear favorites and quote history - keep them for when user logs back in
}
