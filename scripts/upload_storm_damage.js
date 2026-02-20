
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadPost(filePath, postData) {
    const content = fs.readFileSync(path.resolve(process.cwd(), filePath), 'utf-8');
    const finalPost = { ...postData, content };

    console.log(`Uploading post: ${finalPost.slug}`);

    const { data, error } = await supabase
        .from('posts')
        .upsert(finalPost, { onConflict: 'slug' })
        .select();

    if (error) {
        console.error(`Error uploading ${finalPost.slug}:`, error);
    } else {
        console.log(`Successfully uploaded ${finalPost.slug}:`, data?.[0]?.id);
    }
}

async function main() {
    // UK Version
    await uploadPost('scripts/expanded_storm_damage_gb.md', {
        slug: 'emergency-storm-damage-repair-gb',
        title: "Storm Surge: The Survival Guide for High-Wind Emergency Home Repairs",
        excerpt: "As 70km/h gusts hit the UK, learn how to assess wind damage safely, the '48-hour window' for insurance, and why professional tarping is critical to saving your home's integrity.",
        cover_image: '/blog/storm-damage-repair/damaged-house.jpg',
        published: true,
        published_at: new Date().toISOString(),
        author_id: null
    });

    // US Version
    await uploadPost('scripts/expanded_storm_damage_us.md', {
        slug: 'emergency-storm-damage-repair-us',
        title: "Storm Surge: The Survival Guide for High-Wind Emergency Home Repairs",
        excerpt: "With a major winter storm targeting the Northeast, learn how to assess wind damage safely, navigate 'Acts of God' deductibles, and prevent massive water ingress with emergency tarping.",
        cover_image: '/blog/storm-damage-repair/damaged-house.jpg',
        published: true,
        published_at: new Date().toISOString(),
        author_id: null
    });
}

main();
