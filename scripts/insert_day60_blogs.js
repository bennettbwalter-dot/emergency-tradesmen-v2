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
        slug = '7-ways-to-safe-proof-your-garden-electrics-spring-2026';
        excerpt = 'As the UK moves into spring, ensuring your garden electrical circuits are RCD-protected and IP-rated is critical for safety and compliance with Part P regulations.';
        coverImage = '/images/blog/generated/garden-electrics-hero-gb.jpg';
        
        // Inject images
        content = content.replace('## Why This Is Dangerous', `![NICEIC Certified Electrician Inspecting Fuse Box](/images/blog/generated/garden-electrics-inline-gb.jpg)\n*Always hire a registered professional for permanent outdoor wiring to ensure compliance with BS 7671 standards.*\n\n## Why This Is Dangerous`);
    } else {
        slug = '5-hidden-warning-signs-of-attic-mold-rainy-spring';
        excerpt = 'A rainy spring in the US creates a high-risk scenario for toxic attic mold. Learn the hidden warning signs and why professional IICRC remediation is essential.';
        coverImage = '/images/blog/generated/attic-mold-hero-us.png';

        // Inject images
        content = content.replace('## Why This Is Dangerous', `![Macro View of Stachybotrys Mold on Wood](/images/blog/generated/attic-mold-macro-us.png)\n*Microscopic mold colonies can establish themselves on damp structural wood within 48-72 hours of moisture exposure.*\n\n## Why This Is Dangerous`);
        content = content.replace('### The Role of Ventilation', `![Infographic: The Ventilation Failure - Choked Attic Eaves](/images/blog/generated/attic-ventilation-failure-us.png)\n*Blocked soffit vents "choke" the attic, trapping moisture and creating a pressure-cooker effect for mold growth.*\n\n### The Role of Ventilation`);
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
    const ukPath = 'C:\\Users\\Nick\\OneDrive\\protection\\OneDrive\\content-assistant\\brain\\memory\\allmemories\\blog_day60_garden_electrics_uk.md';
    const usPath = 'C:\\Users\\Nick\\OneDrive\\protection\\OneDrive\\content-assistant\\brain\\memory\\allmemories\\blog_day60_attic_mold_us.md';

    try {
        await processBlog(ukPath, 'UK');
        await processBlog(usPath, 'US');
        console.log('Task Completed Successfully.');
    } catch (err) {
        console.error('Task Failed:', err);
    }
}

main();
