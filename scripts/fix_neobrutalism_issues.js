/**
 * Chunk 5 Fix: Fix mismatched divs and missing columns
 */

const SUPABASE_URL = 'https://xwqvhymkwuasotsgmarn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cXZoeW1rd3Vhc290c2dtYXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5MDM0MywiZXhwIjoyMDgxNTY2MzQzfQ.ZJQXY5OzkfO4Ey2G5enTdPHx_shgDMGAUaTJAHKDKus';

const FIXES = [
    {
        slug: 'building-envelope-audit-us',
        type: 'missing-closing-div'
    },
    {
        slug: 'flat-roof-leak-prevention-us',
        type: 'missing-closing-div'
    },
    {
        slug: 'flat-roof-leak-prevention-gb',
        type: 'missing-closing-div'
    },
    {
        slug: 'emergency-handyman-us',
        type: 'missing-closing-div'
    },
    {
        slug: 'smart-leak-detection-gb',
        type: 'missing-donts-column'
    }
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

function fixMismatchedDivs(content) {
    const openCount = (content.match(/<div/g) || []).length;
    const closeCount = (content.match(/<\/div>/g) || []).length;
    
    if (openCount === closeCount) return content;
    
    // Add missing closing divs at the end of main content
    const missing = openCount - closeCount;
    const closingDivs = '</div>'.repeat(missing);
    
    // Insert before </main> or at the end
    const mainCloseIdx = content.indexOf('</main>');
    if (mainCloseIdx > -1) {
        return content.slice(0, mainCloseIdx) + closingDivs + '\n' + content.slice(mainCloseIdx);
    }
    
    return content + closingDivs;
}

function fixMissingDontsColumn(content) {
    // Check if there's a dos-column but no donts-column
    if (content.includes('class="dos-column"') && !content.includes('class="donts-column"')) {
        // Find the dos-column section and add a donts-column after it
        const dosMatch = content.match(/<div class="dos-column">([\s\S]*?)<\/div>/i);
        if (dosMatch) {
            const dontsColumn = `<div class="donts-column">
<h3>CANNOT</h3>
<ul>
<li>Ignore early warning signs—small issues become expensive emergencies fast.</li>
<li>Use unlicensed contractors for specialist leak detection work.</li>
<li>Attempt DIY repairs on pressurised water systems without isolating the supply first.</li>
</ul>
</div>`;
            
            // Insert after the dos-column closing tag
            const insertIdx = content.indexOf(dosMatch[0]) + dosMatch[0].length;
            return content.slice(0, insertIdx) + '\n' + dontsColumn + content.slice(insertIdx);
        }
    }
    return content;
}

async function main() {
    for (const fix of FIXES) {
        console.log(`\nProcessing: ${fix.slug} (${fix.type})`);
        const post = await fetchPost(fix.slug);
        if (!post) {
            console.log('  ✗ Not found');
            continue;
        }
        
        let fixed = post.content;
        
        if (fix.type === 'missing-closing-div') {
            fixed = fixMismatchedDivs(fixed);
        } else if (fix.type === 'missing-donts-column') {
            fixed = fixMissingDontsColumn(fixed);
        }
        
        if (fixed !== post.content) {
            const success = await updatePost(post.id, fixed);
            console.log(success ? '  ✓ Fixed' : '  ✗ Failed');
        } else {
            console.log('  - No changes needed');
        }
    }
    
    console.log('\n=== Done ===');
}

main().catch(console.error);
