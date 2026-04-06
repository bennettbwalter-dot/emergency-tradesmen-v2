/**
 * Fix div mismatch in 3 posts
 */

const SUPABASE_URL = 'https://xwqvhymkwuasotsgmarn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cXZoeW1rd3Vhc290c2dtYXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5MDM0MywiZXhwIjoyMDgxNTY2MzQzfQ.ZJQXY5OzkfO4Ey2G5enTdPHx_shgDMGAUaTJAHKDKus';

const AFFECTED = [
    'radon-emergency-us',
    'portable-power-stations-emergency-backup-us',
    'smart-leak-detection-2026-gb'
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

function fixDivMismatch(content) {
    const openCount = (content.match(/<div/g) || []).length;
    const closeCount = (content.match(/<\/div>/g) || []).length;
    
    if (openCount === closeCount) return content;
    
    const missing = openCount - closeCount;
    if (missing <= 0) return content; // Extra closing divs, not missing
    
    const closingDivs = '</div>'.repeat(missing);
    const mainCloseIdx = content.indexOf('</main>');
    
    if (mainCloseIdx > -1) {
        return content.slice(0, mainCloseIdx) + closingDivs + '\n' + content.slice(mainCloseIdx);
    }
    
    return content + closingDivs;
}

async function main() {
    for (const slug of AFFECTED) {
        console.log(`\nProcessing: ${slug}`);
        const post = await fetchPost(slug);
        if (!post) {
            console.log('  ✗ Not found');
            continue;
        }
        
        const openCount = (post.content.match(/<div/g) || []).length;
        const closeCount = (post.content.match(/<\/div>/g) || []).length;
        console.log(`  Before: ${openCount} open, ${closeCount} close`);
        
        const fixed = fixDivMismatch(post.content);
        if (fixed !== post.content) {
            const success = await updatePost(post.id, fixed);
            if (success) {
                const newOpen = (fixed.match(/<div/g) || []).length;
                const newClose = (fixed.match(/<\/div>/g) || []).length;
                console.log(`  ✓ After: ${newOpen} open, ${newClose} close`);
            } else {
                console.log('  ✗ Failed to update');
            }
        } else {
            console.log('  - No changes needed');
        }
    }
    
    console.log('\n=== Done ===');
}

main().catch(console.error);
