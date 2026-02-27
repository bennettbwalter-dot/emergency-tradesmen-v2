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
    const commonTitle = "The Silent Incursion: Why a Blocked Drain is a Highway for Emergency Pest Ingress";
    const commonExcerpt = "Floodwaters drive rodents into our homes through a hidden network of pipes. Learn how a blocked drain becomes a highway for pests and how to secure your property.";
    const coverImage = '/images/blog/pest-ingress/street-view.jpg';
    const published_at = new Date().toISOString();

    const regions = [
        {
            file: 'scripts/blog_pest_ingress_gb.md',
            slug: 'blocked-drain-pest-ingress-gb',
            title: commonTitle
        },
        {
            file: 'scripts/blog_pest_ingress_us.md',
            slug: 'blocked-drain-pest-ingress-us',
            title: commonTitle.replace(/Tradesmen/g, 'Contractors') // Safety check although title doesn't have it
        }
    ];

    for (const region of regions) {
        console.log(`Processing ${region.slug}...`);
        try {
            const content = fs.readFileSync(region.file, 'utf8');

            const post = {
                title: region.title,
                slug: region.slug,
                excerpt: commonExcerpt,
                content: content,
                cover_image: coverImage,
                published: true,
                published_at: published_at
            };

            const { data, error } = await supabase
                .from('posts')
                .upsert(post, { onConflict: 'slug' })
                .select();

            if (error) {
                console.error(`Error publishing ${region.slug}: `, error.message);
            } else {
                console.log(`Successfully published ${region.slug}`);
            }
        } catch (fileError) {
            console.error(`File error for ${region.file}:`, fileError.message);
        }
    }
}

publishBlog();
