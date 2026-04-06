/**
 * Add image to empty container in the-definitive-uk-home-security-safety-standards-2026
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
    const post = await fetchPost('the-definitive-uk-home-security-safety-standards-2026');
    if (!post) {
        console.log('Post not found');
        return;
    }

    const content = post.content;

    // The empty container to fix:
    const emptyContainer = `<div class="relative w-full my-14 overflow-hidden rounded-2xl shadow-[020px50px-12pxrgba(0,0,0,0.3)] border border-white/5 ring-1 ring-blue-500/10 group aspect-video transition-all duration-300 hover:shadow-[020px50px-12pxrgba(59,130,246,0.25)]"> <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div> </div>`;

    // The fixed container with image:
    const fixedContainer = `<div class="relative w-full my-14 overflow-hidden rounded-2xl shadow-[020px50px-12pxrgba(0,0,0,0.3)] border border-white/5 ring-1 ring-blue-500/10 group aspect-video transition-all duration-300 hover:shadow-[020px50px-12pxrgba(59,130,246,0.25)]"> <img src="/images/blog/generated/home-security-safety-1.png" alt="UK Home Security Safety Standards 2026" class="w-full h-full object-cover" loading="lazy"> <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div> </div>`;

    if (!content.includes(emptyContainer)) {
        console.log('Empty container not found - may have different format');
        // Try to find partial match
        const partialIdx = content.indexOf('relative w-full my-14 overflow-hidden rounded-2xl');
        if (partialIdx > -1) {
            console.log('Found partial match at:', partialIdx);
            console.log('Context:', content.substring(partialIdx, partialIdx + 300));
        }
        return;
    }

    const fixed = content.replace(emptyContainer, fixedContainer);
    const success = await updatePost(post.id, fixed);
    if (success) {
        console.log('✓ Image added to empty container');
    } else {
        console.log('✗ Failed to update');
    }
}

main().catch(console.error);
