/**
 * Remove the orphaned second Amazon button from refrigerant-leak-safety-gb
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

function removeOrphanedButton(content) {
    // Find the amazon-product-section block
    const sectionRegex = /(<div class="amazon-product-section">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>)/i;
    const sectionMatch = content.match(sectionRegex);
    
    if (!sectionMatch) {
        console.log('No amazon-product-section found');
        return content;
    }
    
    const sectionContent = sectionMatch[1];
    const sectionEndIdx = sectionMatch.index + sectionContent.length;
    
    // Look for another amazon-button after the section
    const afterSection = content.slice(sectionEndIdx);
    const orphanedBtnRegex = /<a href="https:\/\/www\.amazon\.[^"]+" class="amazon-button"[^>]*>Buy on Amazon →<\/a>\s*<\/div>/i;
    const orphanedMatch = afterSection.match(orphanedBtnRegex);
    
    if (orphanedMatch) {
        console.log('Found orphaned button after product section');
        console.log('Orphaned button:', orphanedMatch[0].substring(0, 150));
        
        // Remove the orphaned button + its wrapper div
        const fixed = content.slice(0, sectionEndIdx) + afterSection.replace(orphanedBtnRegex, '');
        return fixed;
    }
    
    console.log('No orphaned button found after section');
    return content;
}

async function main() {
    const post = await fetchPost('refrigerant-leak-safety-gb');
    if (!post) {
        console.log('Post not found');
        return;
    }

    const fixed = removeOrphanedButton(post.content);
    
    if (fixed !== post.content) {
        const remainingBtns = (fixed.match(/Buy on Amazon/g) || []).length;
        const remainingBoxes = (fixed.match(/class="product-box"/g) || []).length;
        console.log(`After fix - Buttons: ${remainingBtns}, Boxes: ${remainingBoxes}`);
        
        const success = await updatePost(post.id, fixed);
        if (success) {
            console.log('✓ Orphaned button removed');
        } else {
            console.log('✗ Failed to update');
        }
    } else {
        console.log('No changes needed');
    }
}

main().catch(console.error);
