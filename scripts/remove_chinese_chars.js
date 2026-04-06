/**
 * Remove Chinese characters (我们) from blog posts
 * Found in 10 posts
 */

const SUPABASE_URL = 'https://xwqvhymkwuasotsgmarn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cXZoeW1rd3Vhc290c2dtYXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5MDM0MywiZXhwIjoyMDgxNTY2MzQzfQ.ZJQXY5OzkfO4Ey2G5enTdPHx_shgDMGAUaTJAHKDKus';

const AFFECTED_POSTS = [
    'emergency-contractor-us',
    'commercial-electrician-us',
    'commercial-drainage-gb',
    'commercial-refrigeration-repair-us',
    'commercial-gas-safe-uk',
    'emergency-trades-us',
    'facility-management-emergency-us',
    'emergency-services-gb',
    'emergency-handyman-us',
    'emergency-tradesmen-uk'
];

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

function removeChinese(content) {
    // Remove all Chinese characters (CJK Unified Ideographs)
    const chineseRegex = /[\u4e00-\u9fff]/g;
    const matches = content.match(chineseRegex);
    const count = matches ? matches.length : 0;
    const cleaned = content.replace(chineseRegex, '');
    return { cleaned, count };
}

async function main() {
    let totalRemoved = 0;
    
    for (const slug of AFFECTED_POSTS) {
        console.log(`\nProcessing: ${slug}`);
        
        const post = await fetchPost(slug);
        if (!post) {
            console.log('  ✗ Post not found');
            continue;
        }
        
        const { cleaned, count } = removeChinese(post.content);
        
        if (count > 0) {
            const success = await updatePost(post.id, cleaned);
            if (success) {
                console.log(`  ✓ Removed ${count} Chinese character(s)`);
                totalRemoved += count;
            } else {
                console.log('  ✗ Failed to update');
            }
        } else {
            console.log('  - No Chinese characters found');
        }
    }
    
    console.log(`\n=== Summary ===`);
    console.log(`Total Chinese characters removed: ${totalRemoved}`);
}

main().catch(console.error);
