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
        slug = 'plug-in-solar-balcony-power-party-uk';
        excerpt = 'A no-drama, no-roof, no-panic guide for renters, flat-dwellers, and anyone in Blighty who wants to zap their bills with sunshine.';
        coverImage = '/images/blog/generated/solar-balcony.png';
    } else {
        slug = 'plug-in-solar-balcony-power-party-us';
        excerpt = 'A no-drama, no-roof, no-panic guide for renters, apartment folks, and anyone in the States who wants to zap their bills with sunshine.';
        coverImage = '/images/blog/generated/solar-balcony.png';
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
    const ukPath = path.join(process.cwd(), 'scripts', 'content', 'plug-in-solar-uk.md');
    const usPath = path.join(process.cwd(), 'scripts', 'content', 'plug-in-solar-us.md');

    try {
        await processBlog(ukPath, 'UK');
        await processBlog(usPath, 'US');
        console.log('Task Completed Successfully.');
    } catch (err) {
        console.error('Task Failed:', err);
    }
}

main();
