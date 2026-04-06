/**
 * Fix Amazon product box image for refrigerant-leak-safety-gb
 * Use the COSTWAY product image, not the hero image
 */

const SUPABASE_URL = 'https://xwqvhymkwuasotsgmarn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cXZoeW1rd3Vhc290c2dtYXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5MDM0MywiZXhwIjoyMDgxNTY2MzQzfQ.ZJQXY5OzkfO4Ey2G5enTdPHx_shgDMGAUaTJAHKDKus';

async function fetchPost(slug) {
    const url = `${SUPABASE_URL}/rest/v1/posts?select=*&slug=eq.${encodeURIComponent(slug)}`;
    const res = await fetch(url, {
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
        }
    });
    const data = await res.json();
    return data[0];
}

async function updatePost(id, content) {
    const url = `${SUPABASE_URL}/rest/v1/posts?id=eq.${id}`;
    const res = await fetch(url, {
        method: 'PATCH',
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ content })
    });
    return res.ok;
}

function fixProductBoxImage(content) {
    // Replace the hero image in the product box with the COSTWAY product image
    const oldImage = '/images/blog/generated/refrigerant-hero-gb.png';
    const newImage = '/blog/ac-heatwave-preparation-signs-repair-uk-2026/costway-6in1.webp';
    
    if (content.includes(oldImage)) {
        const fixed = content.replace(oldImage, newImage);
        console.log('✓ Replaced hero image with COSTWAY product image');
        return fixed;
    }
    
    console.log('Hero image not found in product box');
    return content;
}

async function main() {
    const post = await fetchPost('refrigerant-leak-safety-gb');
    if (!post) {
        console.log('Post not found');
        return;
    }

    const fixed = fixProductBoxImage(post.content);
    
    if (fixed !== post.content) {
        const success = await updatePost(post.id, fixed);
        if (success) {
            console.log('✓ Updated');
        } else {
            console.log('✗ Failed');
        }
    } else {
        console.log('No changes needed');
    }
}

main().catch(console.error);
