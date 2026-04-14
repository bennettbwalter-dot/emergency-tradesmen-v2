import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    if (import.meta.env.DEV) {
        throw new Error(
            '🔴 Missing Supabase env vars. Create a .env file from .env.example and add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
        );
    }
    console.warn('[Supabase] Credentials missing — database features disabled.');
}

// Fallback to avoid crash if env vars are missing (prevents blank screen)
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
);
