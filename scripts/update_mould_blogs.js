/**
 * Update mould remediation blogs (UK + US)
 * 1. Update hero/cover images
 * 2. Add images to empty containers
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

async function fixEmptyContainers(content, imageSrc, altText) {
    // UK pattern: ring-blue-500/10
    const blueContainer = `<div class="relative w-full my-14 overflow-hidden rounded-2xl shadow-[020px50px-12pxrgba(0,0,0,0.3)] border border-white/5 ring-1 ring-blue-500/10 group aspect-video transition-all duration-300 hover:shadow-[020px50px-12pxrgba(59,130,246,0.25)]"> <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div> </div>`;
    
    // US pattern: ring-amber-500/10
    const amberContainer = `<div class="relative w-full my-14 overflow-hidden rounded-2xl shadow-[020px50px-12pxrgba(0,0,0,0.3)] border border-white/5 ring-1 ring-amber-500/10 group aspect-video transition-all duration-300 hover:shadow-[020px50px-12pxrgba(245,158,11,0.25)]"> <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div> </div>`;

    const blueFixed = `<div class="relative w-full my-14 overflow-hidden rounded-2xl shadow-[020px50px-12pxrgba(0,0,0,0.3)] border border-white/5 ring-1 ring-blue-500/10 group aspect-video transition-all duration-300 hover:shadow-[020px50px-12pxrgba(59,130,246,0.25)]"> <img src="${imageSrc}" alt="${altText}" class="w-full h-full object-cover" loading="lazy"> <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div> </div>`;
    
    const amberFixed = `<div class="relative w-full my-14 overflow-hidden rounded-2xl shadow-[020px50px-12pxrgba(0,0,0,0.3)] border border-white/5 ring-1 ring-amber-500/10 group aspect-video transition-all duration-300 hover:shadow-[020px50px-12pxrgba(245,158,11,0.25)]"> <img src="${imageSrc}" alt="${altText}" class="w-full h-full object-cover" loading="lazy"> <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div> </div>`;

    let fixed = content;
    let count = 0;
    
    if (fixed.includes(blueContainer)) {
        fixed = fixed.replace(blueContainer, blueFixed);
        count++;
    }
    if (fixed.includes(amberContainer)) {
        fixed = fixed.replace(amberContainer, amberFixed);
        count++;
    }
    
    return { content: fixed, count };
}

async function processBlog(slug, newCoverImage, imageSrc, altText) {
    console.log(`\n=== Processing: ${slug} ===`);
    
    const post = await fetchPost(slug);
    if (!post) {
        console.log('✗ Post not found');
        return;
    }
    
    console.log('Current cover_image:', post.cover_image);
    
    const { content: fixedContent, count } = await fixEmptyContainers(post.content, imageSrc, altText);
    console.log(`Empty containers fixed: ${count}`);
    
    const success = await updatePost(post.id, {
        cover_image: newCoverImage,
        content: fixedContent
    });
    
    if (success) {
        console.log('✓ Cover image updated to:', newCoverImage);
        console.log('✓ Content updated');
    } else {
        console.log('✗ Failed to update post');
    }
}

async function main() {
    // UK mould blog
    await processBlog(
        'mould-remediation-gb',
        '/images/blog/generated/mould-hero.png',
        '/images/blog/generated/mould-hero.png',
        'UK Emergency Mould Remediation 2026'
    );
    
    // US mould blog
    await processBlog(
        '5-hidden-warning-signs-of-attic-mold-rainy-spring-us',
        '/images/blog/generated/mould-hero.png',
        '/images/blog/generated/mould-hero.png',
        'US Hidden Warning Signs of Attic Mold After Rainy Spring'
    );
    
    console.log('\n=== Done ===');
}

main().catch(console.error);
