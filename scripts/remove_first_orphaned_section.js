/**
 * Remove the first orphaned amazon-product-section (button only, no product box)
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

function removeOrphanedSection(content) {
    // Find all amazon-product-section blocks
    const sectionRegex = /<div class="amazon-product-section">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/gi;
    const sections = [...content.matchAll(sectionRegex)];
    
    console.log('Total amazon-product-section blocks:', sections.length);
    
    if (sections.length < 2) {
        console.log('Only one section - nothing to remove');
        return content;
    }
    
    // The first section is the orphaned one (no product-image inside)
    const firstSection = sections[0][0];
    const hasImage = firstSection.includes('product-image');
    console.log('First section has image:', hasImage);
    console.log('First section length:', firstSection.length);
    
    if (!hasImage) {
        // Remove the first orphaned section
        const fixed = content.replace(firstSection, '');
        const imgCount = (fixed.match(/<img/g) || []).length;
        const btnCount = (fixed.match(/Buy on Amazon/g) || []).length;
        console.log(`After fix - Images: ${imgCount}, Buttons: ${btnCount}`);
        return fixed;
    }
    
    console.log('First section has image - not removing');
    return content;
}

async function main() {
    const post = await fetchPost('refrigerant-leak-safety-gb');
    if (!post) {
        console.log('Post not found');
        return;
    }

    const fixed = removeOrphanedSection(post.content);
    
    if (fixed !== post.content) {
        const success = await updatePost(post.id, fixed);
        if (success) {
            console.log('✓ Orphaned section removed');
        } else {
            console.log('✗ Failed to update');
        }
    } else {
        console.log('No changes needed');
    }
}

main().catch(console.error);
