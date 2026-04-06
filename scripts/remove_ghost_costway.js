/**
 * Remove ghost duplicate COSTWAY product section from refrigerant-leak-safety-us
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

async function main() {
    const post = await fetchPost('refrigerant-leak-safety-us');
    if (!post) {
        console.log('Post not found');
        return;
    }

    const content = post.content;
    
    // The ghost duplicate section to remove:
    // <h2 id="11-emergency-hardware-the-2026-portable-ac-standard">11. Emergency Hardware: The 2026 Portable AC Standard</h2>
    // <div class="capsule-box"> ... COSTWAY info ... </div>
    // <div style="text-align: center; margin: 30px 0;"> <img src="/blog/ac-heatwave-preparation-signs-repair-us-2026/costway-6in1.webp" ...> <br> <a href="https://www.amazon.com/COSTWAY..." ...>Buy on Amazon →</a> </div>
    
    const ghostSectionRegex = /<h2 id="11-emergency-hardware-the-2026-portable-ac-standard">[\s\S]*?<\/div>\s*<div style="text-align: center; margin: 30px 0;">[\s\S]*?<a href="https:\/\/www\.amazon\.com\/COSTWAY-Portable-Conditioners-Dehumidifier-Voice-Enabled[^>]*>Buy on Amazon →<\/a>\s*<\/div>/gi;
    
    const match = content.match(ghostSectionRegex);
    if (match) {
        console.log('Found ghost section, length:', match[0].length);
        console.log('Preview:', match[0].substring(0, 200));
        
        const fixed = content.replace(ghostSectionRegex, '');
        
        const success = await updatePost(post.id, fixed);
        if (success) {
            console.log('✓ Ghost duplicate removed');
        } else {
            console.log('✗ Failed to update');
        }
    } else {
        console.log('Ghost section not found - may already be removed or pattern mismatch');
    }
}

main().catch(console.error);
