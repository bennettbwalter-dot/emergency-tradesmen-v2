/**
 * Remove the orphaned button block (no amazon-product-section wrapper)
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
            'Prefer': 'return-minimal'
        },
        body: JSON.stringify({ content })
    });
    return res.ok;
}

function removeOrphanedButtonBlock(content) {
    // Pattern: the orphaned button block that appears right before the proper amazon-product-section
    // It looks like: </p>\n<a href="https://www.amazon..." class="amazon-button"...>Buy on Amazon →</a>\n</div>\n</div>\n</div>\n\n\n<div class="amazon-product-section">
    
    const orphanedRegex = /<\/p>\s*<a href="https:\/\/www\.amazon\.[^"]+" class="amazon-button"[^>]*>Buy on Amazon →<\/a>\s*<\/div>\s*<\/div>\s*<\/div>\s*\n*\s*<div class="amazon-product-section">/gi;
    
    const matches = [...content.matchAll(orphanedRegex)];
    console.log('Orphaned button blocks found:', matches.length);
    
    if (matches.length > 0) {
        // Replace with just </p>\n\n<div class="amazon-product-section">
        const fixed = content.replace(orphanedRegex, '</p>\n\n<div class="amazon-product-section">');
        const imgCount = (fixed.match(/<img/g) || []).length;
        const btnCount = (fixed.match(/Buy on Amazon/g) || []).length;
        console.log(`After fix - Images: ${imgCount}, Buttons: ${btnCount}`);
        return fixed;
    }
    
    console.log('No match - trying simpler pattern');
    
    // Simpler: find the button that's NOT inside a product-box
    // The orphaned one has </a>\n</div>\n</div>\n</div>\n\n\n<div class="amazon-product-section">
    const simplerRegex = /<a href="https:\/\/www\.amazon\.[^"]+" class="amazon-button"[^>]*>Buy on Amazon →<\/a>\s*<\/div>\s*<\/div>\s*<\/div>\s*\n+\s*<div class="amazon-product-section">/gi;
    const simplerMatches = [...content.matchAll(simplerRegex)];
    console.log('Simpler matches:', simplerMatches.length);
    
    if (simplerMatches.length > 0) {
        const fixed = content.replace(simplerRegex, '\n<div class="amazon-product-section">');
        const imgCount = (fixed.match(/<img/g) || []).length;
        const btnCount = (fixed.match(/Buy on Amazon/g) || []).length;
        console.log(`After fix - Images: ${imgCount}, Buttons: ${btnCount}`);
        return fixed;
    }
    
    return content;
}

async function main() {
    const post = await fetchPost('refrigerant-leak-safety-gb');
    if (!post) {
        console.log('Post not found');
        return;
    }

    const fixed = removeOrphanedButtonBlock(post.content);
    
    if (fixed !== post.content) {
        const success = await updatePost(post.id, fixed);
        if (success) {
            console.log('✓ Orphaned button block removed');
        } else {
            console.log('✗ Failed to update');
        }
    } else {
        console.log('No changes needed');
    }
}

main().catch(console.error);
