import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function publishBlog() {
    const filePath = 'scripts/blog_emergency_boiler_replacement.md';
    const content = fs.readFileSync(filePath, 'utf8');

    const post = {
        title: "When the Old Boiler Dies: Emergency Replacements and the 2026 Eco-Heating Boom",
        slug: 'emergency-boiler-replacement-2026-eco-bloom',
        excerpt: "Woke up to a cold house? The 2026 Warm Homes Plan means your emergency replacement could be a major upgrade. Learn how turn a crisis into comfort.",
        content: content,
        cover_image: '/images/blog/boiler-upgrade-2026/boiler-upgrade-concept.png',
        published: true,
        published_at: new Date().toISOString()
    };

    console.log(`Publishing post: ${post.title}`);

    const { data, error } = await supabase
        .from('posts')
        .upsert(post, { onConflict: 'slug' })
        .select();

    if (error) {
        console.error(`Error publishing post: `, error.message);
    } else {
        console.log(`Successfully published post: ${post.title}`);
        console.log(`Live at: http://localhost:3000/blog/${post.slug}`);
    }
}

publishBlog();
