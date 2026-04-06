/**
 * Fix mangled Amazon button links in Supabase blog posts
 * Two posts have truncated <a> tags where the href got cut off
 */

const SUPABASE_URL = 'https://xwqvhymkwuasotsgmarn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cXZoeW1rd3Vhc290c2dtYXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5MDM0MywiZXhwIjoyMDgxNTY2MzQzfQ.ZJQXY5OzkfO4Ey2G5enTdPHx_shgDMGAUaTJAHKDKus';

const FIXES = [
    {
        slug: 'refrigerant-leak-safety-us',
        amazonUrl: 'https://www.amazon.com/COSTWAY-Portable-Conditioners-Dehumidifier-Voice-Enabled/dp/B0B1VK8MPK?linkCode=ll2&tag=emergencytrad-20&linkId=ef9e4b1859351e3c750e3205983121e6&language=en_US&ref_=as_li_ss_tl',
        buttonText: 'Buy on Amazon →'
    },
    {
        slug: 'refrigerant-leak-safety-gb',
        amazonUrl: 'https://www.amazon.co.uk/COSTWAY-Portable-Conditioner-Dehumidifier-Automatic/dp/B0D2W516B5?linkCode=ll2&tag=et0a8-21&linkId=6196e1b84afed702131bb76d77875625&ref_=as_li_ss_tl',
        buttonText: 'Buy on Amazon →'
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

function fixMangledButton(content, amazonUrl, buttonText) {
    // Find the mangled pattern: style fragment ending with ">Buy on Amazon →</a>
    const mangledRegex = /[^<]*#f0c14b[^>]*">([^<]*Buy on Amazon →)<\/a>/gi;
    
    if (mangledRegex.test(content)) {
        const fixed = content.replace(
            mangledRegex,
            `<a href="${amazonUrl}" class="amazon-button" target="_blank" rel="noopener noreferrer">${buttonText}</a>`
        );
        return fixed;
    }
    
    return null; // No mangled button found
}

async function main() {
    for (const fix of FIXES) {
        console.log(`\nProcessing: ${fix.slug}`);
        
        const post = await fetchPost(fix.slug);
        if (!post) {
            console.log('  ✗ Post not found');
            continue;
        }
        
        const fixedContent = fixMangledButton(post.content, fix.amazonUrl, fix.buttonText);
        
        if (fixedContent) {
            const success = await updatePost(post.id, fixedContent);
            if (success) {
                console.log('  ✓ Fixed mangled Amazon button');
            } else {
                console.log('  ✗ Failed to update post');
            }
        } else {
            console.log('  - No mangled button found (already clean or different format)');
        }
    }
    
    console.log('\n=== Done ===');
}

main().catch(console.error);
