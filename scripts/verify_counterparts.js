import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const deletedSlugs = [
    'finding-reliable-local-contractors-gb',
    'sewage-smell-in-house-p-trap-gb',
    'find-reliable-contractors-fast-gb',
    'home-emergency-shut-off-protocol-gb',
    'fastest-response-emergency-contractors-network-gb',
    'water-damage-restoration-category-mold-gb',
    '2026-bump-proof-deadbolt-upgrade-gb',
    'furnace-blowing-cold-air-limit-switch-gb',
    'emergency-plumber-nyc-guide-gb',
    'ac-blowing-warm-air-capacitor-leak-gb',
    'structural-cracks-foundation-repair-gb',
    'emergency-plumber-london-guide-us', 
    'emergency-boarding-up-plywood-gb',
    'emergency-furnace-replacement-2026-gb',
    'how-we-verify-tradespeople-gb',
    'car-wont-start-click-vs-crank-gb',
    'find-reliable-tradesmen-contractors-fast-gb',
    'electrical-emergencies-every-homeowner-should-know-gb'
];

async function verifyCounterparts() {
    console.log('--- Verifying Counterparts for Deleted Posts ---');
    
    // Fetch all current slugs
    const { data: posts, error } = await supabase
        .from('posts')
        .select('slug');

    if (error) {
        console.error(error);
        return;
    }

    const currentSlugs = posts.map(p => p.slug);
    const lonelySlugs = [];

    deletedSlugs.forEach(slug => {
        const base = slug.replace(/-gb$|-uk$|-us$|-usa$|-uk-2026$|-us-2026$/, '');
        const suffixes = ['', '-gb', '-uk', '-us', '-usa', '-uk-2026', '-us-2026'];
        
        const hasCounterpart = suffixes.some(s => {
            const variant = base + s;
            return variant !== slug && currentSlugs.includes(variant);
        });

        if (!hasCounterpart) {
            lonelySlugs.push(slug);
        }
    });

    if (lonelySlugs.length === 0) {
        console.log('✅ All deleted posts have counterparts in the system. No unique content lost.');
    } else {
        console.log('⚠️ The following deleted posts do NOT have counterparts:');
        lonelySlugs.forEach(s => console.log(` - ${s}`));
        console.log('\nThese posts might have been unique content that was mislabeled. We should consider restoring and localizing them.');
    }
}

verifyCounterparts();
