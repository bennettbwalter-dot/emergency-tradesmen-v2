import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

(async () => {
    // Fix 1: Attic Mold = US post, add -us suffix
    const fix1 = await supabase
        .from('posts')
        .update({ slug: '5-hidden-warning-signs-of-attic-mold-rainy-spring-us' })
        .eq('id', '9f84c830-f86d-4e7d-83fa-848d484025aa');
    console.log('Fix 1 (Attic Mold -> -us):', fix1.error ? `ERROR: ${fix1.error.message}` : 'OK');

    // Fix 2: Garden Electrics = UK post, add -gb suffix
    const fix2 = await supabase
        .from('posts')
        .update({ slug: '7-ways-to-safe-proof-your-garden-electrics-spring-2026-gb' })
        .eq('id', 'd15a5a86-a16d-4ef0-847d-2da091fd7542');
    console.log('Fix 2 (Garden Electrics -> -gb):', fix2.error ? `ERROR: ${fix2.error.message}` : 'OK');

    // Also check the emergency-plumber-london-guide - it has no suffix but is a UK post
    const fix3 = await supabase
        .from('posts')
        .update({ slug: 'emergency-plumber-london-guide-gb' })
        .eq('id', 'becf4e0d-a2cd-4574-a172-0fbfee3a30e8');
    console.log('Fix 3 (Emergency Plumber London -> -gb):', fix3.error ? `ERROR: ${fix3.error.message}` : 'OK');

    console.log('\nDone. All regional slugs corrected.');
})();
