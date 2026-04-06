/**
 * Fix Amazon buttons missing class in 4 posts
 */

const SUPABASE_URL = 'https://xwqvhymkwuasotsgmarn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cXZoeW1rd3Vhc290c2dtYXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5MDM0MywiZXhwIjoyMDgxNTY2MzQzfQ.ZJQXY5OzkfO4Ey2G5enTdPHx_shgDMGAUaTJAHKDKus';

const AFFECTED = [
    'radon-emergency-us',
    'portable-power-stations-home-backup-gb',
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

function fixAmazonButtons(content) {
    // Convert inline-styled Amazon buttons to class-based
    const regex = /<a\s+href="(https:\/\/www\.amazon\.[^"]+)"\s+[^>]*style="[^"]*background-color:\s*#f0c14b[^"]*"[^>]*>([^<]+)<\/a>/gi;
    const fixed = content.replace(regex, '<a href="$1" class="amazon-button" target="_blank" rel="noopener noreferrer">$2</a>');
    return fixed;
}

async function main() {
    for (const slug of AFFECTED) {
        console.log(`\nProcessing: ${slug}`);
        const post = await fetchPost(slug);
        if (!post) {
            console.log('  ✗ Not found');
            continue;
        }
        
        const fixed = fixAmazonButtons(post.content);
        if (fixed !== post.content) {
            const success = await updatePost(post.id, fixed);
            console.log(success ? '  ✓ Fixed' : '  ✗ Failed');
        } else {
            console.log('  - Already clean');
        }
    }
}

main().catch(console.error);
