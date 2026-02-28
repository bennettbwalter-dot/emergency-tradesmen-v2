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
    const commonTitle = "EV Charger Broken? Find 24/7 Emergency EV Charger Repair Service Near Me for Immediate Support";
    const commonExcerpt = "In 2026, 60% of failed EV charging attempts require professional intervention. Find 24/7 emergency EV charger repair service for immediate support. Verified electricians for home and commercial charging station faults arriving in 30-90 minutes.";
    const coverImage = '/images/blog/ev-charger-repair/hero.jpg';
    const published_at = "2026-02-28T12:00:00.000+00:00";

    const regions = [
        {
            file: 'scripts/blog_ev_charger_gb.md',
            slug: 'emergency-ev-charger-repair-gb',
            title: commonTitle
        },
        {
            file: 'scripts/blog_ev_charger_us.md',
            slug: 'emergency-ev-charger-repair-us',
            title: commonTitle.replace(/Electrician/g, 'Contractor')
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
