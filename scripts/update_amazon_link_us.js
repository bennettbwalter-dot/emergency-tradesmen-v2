import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const POST_ID = '00ca3130-a73e-4408-ba57-c5e71a285f46';
const NEW_LINK = 'https://www.amazon.com/COSTWAY-Portable-Conditioners-Dehumidifier-Voice-Enabled/dp/B0B1VK8MPK?crid=2BO2FWZJ273EN&dib=eyJ2IjoiMSJ9.zPvhYuLGRgRYImpKKiN22yzNahL7Mqv_RAvEzUvrDifYe3dQJRzSJS9ZXc8MZAjGki-yQ-UEt9du4XkaI45qo-jU-tx1fauc-OuEUHHeD7GEOKeZCxcxefN2H2Bepq1Oocs69i6nGx7YQtRRmhC03-VrxUqVyUuhMh7Z_lUQKBSTD-NXqXHbHX_hNos7puZLx7Y7fWKrJeO_Fk-S6wLNi_Siz0zTpMlOBeiwluqeaoM.iCK5kLVLbdtgieVdR73xS49uym23ZrQ5ZBmevH7dEqw&dib_tag=se&keywords=COSTWAY%2B6-in-1%2BPortable%2BAir%2BConditioner&qid=1773667998&sprefix=costway%2B6-in-1%2Bportable%2Bair%2Bconditioner%2Caps%2C231&sr=8-2-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1&linkCode=ll2&tag=emergencytrad-20&linkId=ef9e4b1859351e3c750e3205983121e6&language=en_US&ref_=as_li_ss_tl';

async function updateAmazonLink() {
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

    // Pattern to match the button link for COSTWAY
    // [Get the COSTWAY 6-in-1 Portable AC on Amazon →](...)
    const regex = /\[Get the COSTWAY 6-in-1 Portable AC on Amazon →\]\(https:\/\/www\.amazon\.(?:co\.uk|com)\/.*?\)/;
    
    if (regex.test(post.content)) {
        const updatedContent = post.content.replace(regex, `[Get the COSTWAY 6-in-1 Portable AC on Amazon →](${NEW_LINK})`);
        
        const { error: updateError } = await supabase
            .from('posts')
            .update({ content: updatedContent })
            .eq('id', POST_ID);

        if (updateError) {
            console.error('Error updating post content:', updateError);
        } else {
            console.log('✅ Successfully updated Amazon affiliate link in US blog post.');
        }
    } else {
        console.error('❌ Could not find the Amazon button pattern in the post content.');
        // Log a snippet for debugging if it failed
        const index = post.content.indexOf('COSTWAY');
        console.log('Context:', post.content.substring(index, index + 500));
    }
}

updateAmazonLink();
