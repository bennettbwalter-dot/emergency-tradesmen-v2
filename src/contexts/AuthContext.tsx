import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";

// Map Supabase user to our app's User type
interface User {
    id: string;
    email: string;
    name: string;
    phone?: string;
    postcode?: string;
    avatar?: string;
    createdAt: string;
    lastLogin: string;
    emailVerified: boolean;
    preferences: {
        notifications: {
            email: boolean;
            sms: boolean;
            marketing: boolean;
        };
        savedAddresses: Array<{
            id: string;
            label: string;
            address: string;
            postcode: string;
            isDefault: boolean;
        }>;
    };
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    signOut: () => Promise<void>;

    updateUser: (updates: Partial<User>) => void;
    loginWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function mapSupabaseUser(supabaseUser: SupabaseUser): User {
    return {
        id: supabaseUser.id,
        email: supabaseUser.email || "",
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0] || "User",
        phone: supabaseUser.user_metadata?.phone,
        postcode: supabaseUser.user_metadata?.postcode,
        avatar: supabaseUser.user_metadata?.avatar,
        createdAt: supabaseUser.created_at,
        lastLogin: supabaseUser.last_sign_in_at || supabaseUser.created_at,
        emailVerified: !!supabaseUser.email_confirmed_at,
        preferences: supabaseUser.user_metadata?.preferences || {
            notifications: { email: true, sms: false, marketing: false },
            savedAddresses: [],
        },
    };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for existing session on mount
        const initializeAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    setUser(mapSupabaseUser(session.user));
                }
            } catch (error) {
                console.error("Error getting session:", error);
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session?.user) {
                    setUser(mapSupabaseUser(session.user));
                } else {
                    setUser(null);
                }
                setIsLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            if (data.user) {
                setUser(mapSupabaseUser(data.user));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (name: string, email: string, password: string) => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name,
                        preferences: {
                            notifications: { email: true, sms: false, marketing: false },
                            savedAddresses: [],
                        },
                    },
                },
            });
            if (error) throw error;
            if (data.user) {
                setUser(mapSupabaseUser(data.user));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const loginWithGoogle = async () => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });
            if (error) throw error;
        } catch (error) {
            console.error("Error logging in with Google:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    const updateUser = async (updates: Partial<User>) => {
        if (user) {
            // Update local state immediately
            const updatedUser = { ...user, ...updates };
            setUser(updatedUser);

            // Sync to Supabase user metadata
            await supabase.auth.updateUser({
                data: {
                    name: updatedUser.name,
                    phone: updatedUser.phone,
                    postcode: updatedUser.postcode,
                    avatar: updatedUser.avatar,
                    preferences: updatedUser.preferences,
                },
            });
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                loginWithGoogle,
                register,
                logout,
                signOut: logout, // Add signOut as an alias to logout
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}
