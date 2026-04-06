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
            const tocMatch = p.content.match(/<div class="toc-box"[^>]*>[\s\S]*?<\/div>/);
            if (tocMatch) {
                console.log('TOC:', tocMatch[0].substring(0, 300));
            } else {
                console.log('NO TOC found');
            }
            
            console.log('\n--- H2 headings ---');
            const h2Match = p.content.match(/<h2>([^<]+)<\/h2>/gi);
            if (h2Match) {
                h2Match.forEach(m => console.log(m));
            }
        }
    }
}

debugTOC();
