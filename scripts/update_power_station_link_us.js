import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const POST_ID = '138267d2-90c0-4b06-a5eb-7e98791306b9';
const NEW_LINK = 'https://www.amazon.com/BLUETTI-Portable-AC180-Generator-Off-grid/dp/B0C1SMJTDT?crid=3ND7VXV9YS9YA&dib=eyJ2IjoiMSJ9.Iw-1dpNCW6BqbhV2CTUYz6rC1mmTy0Vd5UaVwCiOvfMFmG1gAw6UsM2cRD15_l-1JK2fuWkWAZsH96ghTPmT-3NeSAYljy4WEz_VJpds4Qg6t_50ie5btZ98R6T17CsGUWOWhZzjl9iw1vrxTOpgKCklKHVTrjTK8HOW3rwBBPmY9dvdWWuLZ0RufFRogi3Q5uuQcpC-5KVihrQSMWY5l9xsGbV7UL5zoxQGypIeWSI.giNOrxoVMdaYiDnjMi1PSSo0_ENGt9VLbPjua8zhpkQ&dib_tag=se&keywords=BLUETTI%2BAC180%2Bportable%2Bpower%2Bstation&qid=1773670184&sprefix=bluetti%2Bac180%2Bportable%2Bpower%2Bstation%2Caps%2C157&sr=8-3&th=1&linkCode=ll2&tag=emergencytrad-20&linkId=35e97d3caf51b17294501b87c3298638&language=en_US&ref_=as_li_ss_tl';
const BUTTON_TEXT = 'Get the BLUETTI AC180 on Amazon →';

async function updatePowerStationLink() {
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
    // This looks for <a> tags or markdown links containing amazon and BLUETTI/AC180
    const existingUKLinkRegex = /<a href="https:\/\/www\.amazon\.co\.uk\/.*?BLUETTI.*?">Buy on Amazon .*?<\/a>/gi;
    const existingMangledRegex = /<a href="https:\/\/www\.amazon\..*?">Buy on Amazon.*?<\/a>/gi;
    content = content.replace(existingUKLinkRegex, '');
    content = content.replace(existingMangledRegex, '');

    // 2. Identify the image markdown
    const imageMarkdown = '![BLUETTI AC180 portable power station in use outdoors with solar panel and laptop](/images/blog/portable-power/bluetti-solar-outdoor.webp)';
    
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
            console.log('✅ Successfully updated BLUETTI Amazon link and positioned button under image.');
        }
    } else {
        console.error('❌ Could not find the product image markdown in the post content.');
        // Debug snippet
        console.log('Post content snippet starts with:', content.substring(0, 500));
    }
}

updatePowerStationLink();
