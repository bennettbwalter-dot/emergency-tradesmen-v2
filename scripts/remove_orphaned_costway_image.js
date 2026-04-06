/**
 * Remove the orphaned COSTWAY image + button from refrigerant-leak-safety-gb
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

function removeOrphanedImage(content) {
    // Remove the old-style COSTWAY image + button that's outside the product box
    // Pattern: <img src="/blog/ac-heatwave...costway-6in1.webp" style="..."> <br> <a href="https://www.amazon..." ...>Buy on Amazon →</a> </div>
    const orphanedRegex = /\s*<img\s+src="[^"]*costway-6in1\.webp"[^>]*style="[^"]*"[^>]*>\s*<br>\s*<a\s+href="https:\/\/www\.amazon\.[^"]+"[^>]*>Buy on Amazon →<\/a>\s*<\/div>/gi;
    
    const matches = [...content.matchAll(orphanedRegex)];
    console.log('Orphaned image+button pairs found:', matches.length);
    
    if (matches.length > 0) {
        matches.forEach(m => {
            console.log('Removing:', m[0].substring(0, 200));
        });
        
        const fixed = content.replace(orphanedRegex, '');
        return fixed;
    }
    
    console.log('No orphaned image+button found');
    return content;
}

async function main() {
    const post = await fetchPost('refrigerant-leak-safety-gb');
    if (!post) {
        console.log('Post not found');
        return;
    }

    const fixed = removeOrphanedImage(post.content);
    
    if (fixed !== post.content) {
        const imgCount = (fixed.match(/<img/g) || []).length;
        const btnCount = (fixed.match(/Buy on Amazon/g) || []).length;
        console.log(`After fix - Images: ${imgCount}, Buttons: ${btnCount}`);
        
        const success = await updatePost(post.id, fixed);
        if (success) {
            console.log('✓ Orphaned image+button removed');
        } else {
            console.log('✗ Failed to update');
        }
    } else {
        console.log('No changes needed');
    }
}

main().catch(console.error);
