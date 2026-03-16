import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function deepCleanup() {
    console.log('--- Comprehensive Regional Data Cleanup ---');
    
    const { data: posts, error } = await supabase
        .from('posts')
        .select('slug, title')
        .eq('published', true);

    if (error) {
        console.error('Error fetching posts:', error);
        return;
    }

    const toDelete = [];

    posts.forEach(p => {
        const slug = p.slug.toLowerCase();
        const title = p.title.toLowerCase();
        
        const isUKSlug = slug.endsWith('-gb') || slug.endsWith('-uk') || slug.includes('-uk-2026');
        const isUSSlug = slug.endsWith('-us') || slug.endsWith('-usa') || slug.includes('-us-2026');

        // Rule 1: UK slug with US-centric title
        if (isUKSlug) {
            const hasUSIndicator = 
                title.includes('us guide') || 
                title.includes('us edition') || 
                title.includes('usa') || 
                title.includes('chicago') || 
                title.includes('new york') || 
                title.includes('nyc') || 
                title.includes('us homeowner') ||
                title.includes('911') ||
                (title.includes('furnace') && !title.includes('boiler')); // Furnace is mostly US, Boiler is UK/US but Furnace is strong signal

            if (hasUSIndicator) {
                toDelete.push({ slug: p.slug, title: p.title, reason: 'US content in UK slug' });
            }
        }

        // Rule 2: US slug with UK-centric title
        if (isUSSlug) {
            const hasUKIndicator = 
                title.includes('uk guide') || 
                title.includes('uk edition') || 
                title.includes('london') || 
                title.includes('tradesmen') ||
                title.includes('0800') ||
                title.includes('uk homeowner');

            if (hasUKIndicator) {
                toDelete.push({ slug: p.slug, title: p.title, reason: 'UK content in US slug' });
            }
        }
    });

    if (toDelete.length === 0) {
        console.log('No misaligned posts found.');
        return;
    }

    console.log(`Found ${toDelete.length} misaligned posts:`);
    toDelete.forEach(p => {
        console.log(`[${p.reason}] ${p.slug} | ${p.title}`);
    });

    console.log('\nDeleting misaligned posts...');
    const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .in('slug', toDelete.map(p => p.slug));

    if (deleteError) {
        console.error('Error deleting posts:', deleteError);
    } else {
        console.log('✅ Successfully removed all misaligned regional posts.');
    }
}

deepCleanup();
