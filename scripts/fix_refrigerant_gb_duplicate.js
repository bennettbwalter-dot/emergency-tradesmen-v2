/**
 * Remove duplicate Amazon section from refrigerant-leak-safety-gb
 * Keep only the COSTWAY product box, remove the second duplicate
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

function removeDuplicateAmazon(content) {
    // Find the second amazon-product-section (the duplicate Digital Refrigerant Leak Detector one)
    // and remove it entirely
    
    // The duplicate section starts with the unsplash image and "Digital Refrigerant Leak Detector"
    const duplicateRegex = /<div class="amazon-product-section">\s*<div class="product-box">\s*<div class="product-image-wrapper">\s*<img[^>]*unsplash[^>]*Digital Refrigerant Leak Detector[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/gi;
    
    const matches = [...content.matchAll(duplicateRegex)];
    console.log('Duplicate sections found:', matches.length);
    
    if (matches.length > 0) {
        let fixed = content;
        matches.forEach(m => {
            fixed = fixed.replace(m[0], '');
        });
        return fixed;
    }
    
    // Fallback: find all amazon-product-section blocks and keep only the first one
    const allSections = [];
    let sectionRegex = /<div class="amazon-product-section">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/gi;
    let match;
    while ((match = sectionRegex.exec(content)) !== null) {
        allSections.push({ index: match.index, content: match[0] });
    }
    
    console.log('Total amazon-product-section blocks:', allSections.length);
    
    if (allSections.length > 1) {
        // Remove all but the first section
        let fixed = content;
        for (let i = allSections.length - 1; i >= 1; i--) {
            const section = allSections[i];
            fixed = fixed.slice(0, section.index) + fixed.slice(section.index + section.content.length);
        }
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

    const fixed = removeDuplicateAmazon(post.content);
    
    if (fixed !== post.content) {
        // Count remaining Amazon elements
        const remainingBtns = (fixed.match(/Buy on Amazon/g) || []).length;
        const remainingBoxes = (fixed.match(/class="product-box"/g) || []).length;
        console.log(`Remaining Amazon buttons: ${remainingBtns}`);
        console.log(`Remaining product boxes: ${remainingBoxes}`);
        
        const success = await updatePost(post.id, fixed);
        if (success) {
            console.log('✓ Duplicate Amazon section removed');
        } else {
            console.log('✗ Failed to update');
        }
    } else {
        console.log('No duplicates found');
    }
}

main().catch(console.error);
