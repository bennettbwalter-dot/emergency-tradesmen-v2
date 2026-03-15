import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const suspiciousSlugs = [
    'finding-reliable-local-contractors-gb',
    'sewage-smell-in-house-p-trap-gb',
    'find-reliable-contractors-fast-gb',
    'home-emergency-shut-off-protocol-gb',
    'fastest-response-emergency-contractors-network-gb',
    'water-damage-restoration-category-mold-gb',
    'furnace-blowing-cold-air-limit-switch-gb',
    '2026-bump-proof-deadbolt-upgrade-gb',
    'emergency-furnace-replacement-2026-gb',
    '2026-high-security-deadbolt-upgrade-gb',
    '2026-anti-snap-lock-lockdown-gb',
    'electrical-fire-warning-signs-gb' // Checking this one too as it might be US-centric
];

async function cleanup() {
    console.log('Starting regional data cleanup...');

    // 1. Fetch titles and slugs of suspicious posts to confirm
    const { data: posts, error: fetchError } = await supabase
        .from('posts')
        .select('slug, title')
        .in('slug', suspiciousSlugs);

    if (fetchError) {
        console.error('Error fetching posts:', fetchError);
        return;
    }

    const toDelete = posts.filter(p => {
        const title = p.title.toLowerCase();
        // Delete if title explicitly mentions US, USA, or uses US-only terms like Furnace/Contractors in a UK slug context
        const isUSContent = title.includes('us guide') || 
                           title.includes('us edition') || 
                           title.includes('usa') || 
                           title.includes('chicago') ||
                           title.includes('us homeowner');
        
        if (isUSContent) {
            console.log(`Matched US-centric content: [${p.slug}] ${p.title}`);
            return true;
        }
        return false;
    });

    if (toDelete.length === 0) {
        console.log('No misaligned posts found to delete.');
        return;
    }

    console.log(`Removing ${toDelete.length} misaligned UK posts...`);
    
    const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .in('slug', toDelete.map(p => p.slug));

    if (deleteError) {
        console.error('Error deleting posts:', deleteError);
    } else {
        console.log('✅ Successfully removed misaligned UK posts.');
        toDelete.forEach(p => console.log(` - Removed: ${p.slug}`));
    }
}

cleanup();
