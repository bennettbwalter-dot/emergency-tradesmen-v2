import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const POST_ID = '406669da-cb1d-4ccf-b46e-502cdbcf1985';
const NEW_LINK = 'https://www.amazon.com/Aranet-Radon-Detector-Home-Ink/dp/B0DK3CRP79?crid=TSLBRYMMIDYG&dib=eyJ2IjoiMSJ9.JVRctVRtK0LnFrCva62B3ZNMhPHnfPFjf3qn45zo73mwq_Ym8ix4WWwuYIbJUObFTcm8dKRa0unjLLw_7uj14YeQ8SRp9TyISte3IgRF52zD93Q78iSwdFovYwZ4LCI6sVjyKwVn7ZZhwRhd212B0ZM-fzp0BoJuW7pns6XWFnGAc-xC_NstCrkkItnKsMyITYnlUzgjRpdE_yj8GwV7q3K5h35169TEryM26EpMvy0.xJPzSJUU2yTPntSC8S6EWLIzF7urvVyHBWPe7lgE5Tc&dib_tag=se&keywords=SAF+Aranet+Radon+Detector+for+Home%3A+Measures+10+Min%2C+Temperature%2C+Relative+Humidity%2C+Pressure%2C+E-Ink+Display%2C+7+Year+Battery%2C+Portable+with+Free+App&nsdOptOutParam=true&qid=1773669248&sprefix=saf+aranet+radon+detector+for+home+measures+10+min%2C+temperature%2C+relative+humidity%2C+pressure%2C+e-ink+display%2C+7+year+battery%2C+portable+with+free+app%2Caps%2C190&sr=8-1-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&psc=1&linkCode=ll2&tag=emergencytrad-20&linkId=5db248b5c277b8e78e79ba9b615ca2d2&language=en_US&ref_=as_li_ss_tl';
const BUTTON_TEXT = 'Get the SAF Aranet Radon Detector on Amazon →';

async function updateAranetLink() {
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

    // 1. Remove existing Amazon links for Aranet/Radon to avoid duplication
    // This matches common mangled patterns or existing UK links
    const existingLinkRegex = /\[.*?\]\(https:\/\/www\.amazon\.(?:co\.uk|com)\/.*?(?:Aranet|Radon|B0DK3CRP79).*?\)/gi;
    content = content.replace(existingLinkRegex, '');

    // 2. Identify the image markdown
    const imageMarkdown = '![SAF Aranet Radon Detector](/blog/spring-condensation/aranet-radon-detector.webp)';
    
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
            console.log('✅ Successfully updated Aranet Amazon link and positioned button under image.');
        }
    } else {
        console.error('❌ Could not find the product image markdown in the post content.');
        // Debug snippet
        console.log('Post content snippet starts with:', content.substring(0, 500));
    }
}

updateAranetLink();
