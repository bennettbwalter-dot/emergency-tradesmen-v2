import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const POST_ID = 'd4c63f50-8ca0-43d0-ac95-9f0db1098a97';
const NEW_LINK = 'https://www.amazon.com/BLUETTI-Portable-AC180-Generator-Off-grid/dp/B0C1SMJTDT?crid=3ND7VXV9YS9YA&dib=eyJ2IjoiMSJ9.Iw-1dpNCW6BqbhV2CTUYz6rC1mmTy0Vd5UaVwCiOvfMFmG1gAw6UsM2cRD15_l-1JK2fuWkWAZsH96ghTPmT-3NeSAYljy4WEz_VJpds4Qg6t_50ie5btZ98R6T17CsGUWOWhZzjl9iw1vrxTOpgKCklKHVTrjTK8HOW3rwBBPmY9dvdWWuLZ0RufFRogi3Q5uuQcpC-5KVihrQSMWY5l9xsGbV7UL5zoxQGypIeWSI.giNOrxoVMdaYiDnjMi1PSSo0_ENGt9VLbPjua8zhpkQ&dib_tag=se&keywords=BLUETTI%2BAC180%2Bportable%2Bpower%2Bstation&qid=1773670184&sprefix=bluetti%2Bac180%2Bportable%2Bpower%2Bstation%2Caps%2C157&sr=8-3&th=1&linkCode=ll2&tag=emergencytrad-20&linkId=35e97d3caf51b17294501b87c3298638&language=en_US&ref_=as_li_ss_tl';
const BUTTON_TEXT = 'Get the BLUETTI AC180 on Amazon →';

async function updateEnergyShockLink() {
    console.log(`--- Updating Amazon Affiliate Link for US Post: ${POST_ID} ---`);

    const { data: post, error } = await supabase
        .from('posts')
        .select('content')
        .eq('id', POST_ID)
        .single();

    if (error || !post) {
        console.error('Error fetching post:', error);
        return;
    }

    let content = post.content;

    // 1. Remove existing mangled Amazon buttons/links for BLUETTI
    // This matches common mangled patterns or existing UK links in the Energy Shock post
    const existingUKLinkRegex = /<a href="https:\/\/www\.amazon\.co\.uk\/.*?BLUETTI-Portable-AC180-Generator-Off-grid.*?".*?>Buy on Amazon .*?<\/a>/gi;
    const existingMangledRegex = /<a href="https:\/\/www\.amazon\..*?">Buy on Amazon.*?<\/a>/gi;
    content = content.replace(existingUKLinkRegex, '');
    content = content.replace(existingMangledRegex, '');

    // 2. Identify the image markdown
    const imageMarkdown = '![BLUETTI AC180 1152Wh portable power station with 1800W AC outlets](/images/blog/energy-shock/bluetti-ac180.webp)';
    
    if (content.includes(imageMarkdown)) {
        // Insert button directly under the image
        const replacement = `${imageMarkdown}\n\n[${BUTTON_TEXT}](${NEW_LINK})`;
        content = content.replace(imageMarkdown, replacement);
        
        // 3. Update the database
        const { error: updateError } = await supabase
            .from('posts')
            .update({ content: content })
            .eq('id', POST_ID);

        if (updateError) {
            console.error('Error updating post content:', updateError);
        } else {
            console.log('✅ Successfully updated BLUETTI Amazon link in Energy Shock blog.');
        }
    } else {
        console.error('❌ Could not find the product image markdown in the post content.');
        // Debug snippet
        const index = content.indexOf('BLUETTI');
        console.log('Post content snippet:', content.substring(index, index + 500));
    }
}

updateEnergyShockLink();
