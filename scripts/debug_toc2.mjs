import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function debugTOC() {
    const slugs = [
        'emergency-ev-charger-repair-gb',
        '7-ways-to-safe-proof-your-garden-electrics-spring-2026-gb'
    ];
    
    for (const slug of slugs) {
        const { data: p } = await supabase.from('posts').select('content').eq('slug', slug).single();
        if (p) {
            console.log('\n=== ' + slug + ' ===');
            
            console.log('\n--- All heading-like patterns ---');
            const patterns = [
                /<h2[^>]*>([^<]+)<\/h2>/gi,
                /<h3[^>]*>([^<]+)<\/h3>/gi,
                /<h[234][^>]*>([^<]+)<\/h[234]>/gi,
                /<p><strong>([^<]+)<\/strong><\/p>/gi,
                /^(\d+\..+)$/m
            ];
            
            patterns.forEach((pat, i) => {
                const matches = p.content.match(pat);
                if (matches) {
                    console.log('Pattern', i, ':', matches.slice(0, 5));
                }
            });
        }
    }
}

debugTOC();
