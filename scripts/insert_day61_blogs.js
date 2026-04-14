import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function processBlog(filePath, region) {
    const rawContent = fs.readFileSync(filePath, 'utf8');
    const lines = rawContent.split('\n');
    let title = lines[0].replace('# ', '').trim();
    let content = rawContent;
    let slug = '';
    let excerpt = '';
    let coverImage = '';

    if (region === 'UK') {
        slug = '5-reasons-your-rcd-keeps-tripping-during-heavy-spring-rain-uk';
        excerpt = 'If your RCD continually trips during heavy rain, you likely have water ingress compromising a live electrical circuit. This is a severe fire hazard under BS 7671. Learn the causes and why you need an emergency electrician.';
        coverImage = '/images/blog/generated/rcd-keeps-tripping-hero-gb.png';
        
        // Inject images
        content = content.replace('### 1. Water Ingress', `![Water Ingress in Outdoor Sockets](/images/blog/generated/rcd-tripping-inline-gb.jpg)\n*Water effortlessly bypasses broken seals and pools inside fittings, causing immediate RCD trips.*\n\n### 1. Water Ingress`);
    } else {
        slug = '7-warning-signs-your-failed-window-seals-are-costing-you-money-us';
        excerpt = 'If you see condensation trapped between your double-pane glass, the window seal has completely failed. Learn why ignoring it severely reduces your home\'s energy efficiency and how a glazier can fix it.';
        coverImage = '/images/blog/generated/window-seals-hero-us.png';

        // Inject images
        content = content.replace('### 1. Condensation Between', `![Condensation Between the Glass Panes](/images/blog/generated/failed-window-seals-inline-us.png)\n*Condensation between the glass panes is an undeniable sign of IGU seal failure.*\n\n### 1. Condensation Between`);
    }

    console.log(`Processing ${region} blog: ${title}`);

    const { data: existingPost } = await supabase
        .from('posts')
        .select('id')
        .eq('slug', slug)
        .single();

    if (existingPost) {
        console.log(`Updating existing post: ${slug}`);
        const { error } = await supabase
            .from('posts')
            .update({
                title,
                content,
                excerpt,
                published: true,
                published_at: new Date().toISOString(),
                cover_image: coverImage,
                updated_at: new Date().toISOString()
            })
            .eq('slug', slug);

        if (error) console.error('Error updating:', error);
        else console.log('Successfully updated post');
    } else {
        console.log(`Inserting new post: ${slug}`);
        const { error } = await supabase
            .from('posts')
            .insert({
                title,
                slug,
                content,
                excerpt,
                published: true,
                published_at: new Date().toISOString(),
                cover_image: coverImage,
                author_id: null
            });

        if (error) console.error('Error inserting:', error);
        else console.log('Successfully inserted post');
    }
}

async function main() {
    const ukPath = 'C:\\Users\\Nick\\OneDrive\\protection\\OneDrive\\content-assistant\\brain\\memory\\allmemories\\blog_day61_rcd_tripping_uk.md';
    const usPath = 'C:\\Users\\Nick\\OneDrive\\protection\\OneDrive\\content-assistant\\brain\\memory\\allmemories\\blog_day61_failed_window_seals_us.md';

    try {
        await processBlog(ukPath, 'UK');
        await processBlog(usPath, 'US');
        console.log('Task Completed Successfully.');
    } catch (err) {
        console.error('Task Failed:', err);
    }
}

main();
