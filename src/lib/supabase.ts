import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        '🔴 Missing Supabase env vars. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        // Bypass Web Locks API  -  prevents "lock stolen" errors when multiple
        // auth calls fire concurrently (e.g. refreshUser + initBusiness).
        // Supabase handles concurrent token refreshes gracefully.
        lock: <R>(_name: string, _acquireTimeout: number, fn: () => Promise<R>): Promise<R> => fn(),
    },
});

