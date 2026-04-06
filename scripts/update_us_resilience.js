/**
 * Update USA blog: ultimate-us-emergency-home-resilience-2026
 * 1. Update hero/cover image
 * 2. Add image to empty container
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

async function updatePost(id, updates) {
    const url = `${SUPABASE_URL}/rest/v1/posts?id=eq.${id}`;
    const res = await fetch(url, {
        method: 'PATCH',
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify(updates)
    });
    return res.ok;
}

async function main() {
    const post = await fetchPost('ultimate-us-emergency-home-resilience-2026');
    if (!post) {
        console.log('Post not found');
        return;
    }

    console.log('Current cover_image:', post.cover_image);

    // 1. Update cover image
    const newCoverImage = '/images/blog/generated/home-security-safety.png';
    
    // 2. Fix empty container - same pattern as UK but with amber ring
    const emptyContainer = `<div class="relative w-full my-14 overflow-hidden rounded-2xl shadow-[020px50px-12pxrgba(0,0,0,0.3)] border border-white/5 ring-1 ring-amber-500/10 group aspect-video transition-all duration-300 hover:shadow-[020px50px-12pxrgba(245,158,11,0.25)]"> <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div> </div>`;
    
    const fixedContainer = `<div class="relative w-full my-14 overflow-hidden rounded-2xl shadow-[020px50px-12pxrgba(0,0,0,0.3)] border border-white/5 ring-1 ring-amber-500/10 group aspect-video transition-all duration-300 hover:shadow-[020px50px-12pxrgba(245,158,11,0.25)]"> <img src="/images/blog/generated/home-security-safety-1.png" alt="US Emergency Home Resilience 2026" class="w-full h-full object-cover" loading="lazy"> <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div> </div>`;

    let content = post.content;
    let containerFixed = false;
    
    if (content.includes(emptyContainer)) {
        content = content.replace(emptyContainer, fixedContainer);
        containerFixed = true;
        console.log('✓ Empty container found and fixed');
    } else {
        console.log('✗ Empty container not found');
        // Try to find partial match
        const partialIdx = content.indexOf('relative w-full my-14 overflow-hidden rounded-2xl');
        if (partialIdx > -1) {
            console.log('Found partial match at:', partialIdx);
            console.log('Context:', content.substring(partialIdx, partialIdx + 300));
        }
    }

    // Update both cover_image and content
    const success = await updatePost(post.id, {
        cover_image: newCoverImage,
        content: content
    });
    
    if (success) {
        console.log('✓ Cover image updated to:', newCoverImage);
        console.log('✓ Container fixed:', containerFixed);
    } else {
        console.log('✗ Failed to update post');
    }
}

main().catch(console.error);
