import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables manually since we need two different sets
const parseEnv = (filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n').reduce((acc, line) => {
        const [key, ...values] = line.split('=');
        if (key && values.length > 0) {
            acc[key.trim()] = values.join('=').trim();
        }
        return acc;
    }, {});
};

const devEnv = parseEnv('.env');
const prodEnv = parseEnv('.env.production');

const devUrl = devEnv.VITE_SUPABASE_URL;
const devKey = devEnv.SUPABASE_SERVICE_ROLE_KEY || devEnv.VITE_SUPABASE_ANON_KEY;

const prodUrl = prodEnv.VITE_SUPABASE_URL;
const prodKey = prodEnv.SUPABASE_SERVICE_ROLE_KEY;

if (!prodKey) {
    console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY in .env.production');
    process.exit(1);
}

const devSupabase = createClient(devUrl, devKey);
const prodSupabase = createClient(prodUrl, prodKey);

async function migrateBlogs() {
    console.log('🔄 Fetching posts from DEV...');

    const { data: posts, error: fetchError } = await devSupabase
        .from('posts')
        .select('*');

    if (fetchError) {
        console.error('❌ Error fetching from DEV:', fetchError);
        return;
    }

    console.log(`✅ Found ${posts.length} posts in DEV.`);

    if (posts.length === 0) {
        console.log('⚠️ No posts to migrate.');
        return;
    }

    console.log('🔄 Inserting posts into PROD...');

    // Prepare posts for insertion (remove ID if we want new IDs, or keep them to sync)
    // It's usually safer to keep IDs if we want to update existing ones, but upsert works best.
    // We should remove 'id' if there are conflicts, but let's try upserting with ID first.
    const { data: inserted, error: insertError } = await prodSupabase
        .from('posts')
        .upsert(posts, { onConflict: 'slug' }) // Assume slug is unique
        .select();

    if (insertError) {
        console.error('❌ Error inserting into PROD:', insertError);
    } else {
        console.log(`✅ Successfully migrated ${inserted.length} posts to PROD!`);
    }
}

migrateBlogs();
