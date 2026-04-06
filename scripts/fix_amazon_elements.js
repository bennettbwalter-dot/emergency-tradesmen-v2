/**
 * Fix all Amazon elements in blog posts stored in Supabase
 * - Convert raw Amazon link buttons to use proper class-based styling
 * - Ensure no raw URLs are displayed
 * - Clean up product box structure
 * - Fix image alignment
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

async function fetchAllPosts() {
    const url = `${SUPABASE_URL}/rest/v1/posts?select=*&published=eq.true`;
    const res = await fetch(url, {
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
        }
    });
    return await res.json();
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

function fixAmazonContent(content, slug) {
    let fixed = content;
    const isUS = slug.includes('usa') || slug.includes('-us');
    const amazonDomain = isUS ? 'https://www.amazon.com' : 'https://www.amazon.co.uk';

    // 1. Fix inline-styled Amazon buttons to use class-based styling
    // Pattern: <a href="https://www.amazon..." style="display: inline-block; background-color: #f0c14b;..." target="_blank" rel="noopener noreferrer">Buy on Amazon →</a>
    const inlineButtonRegex = /<a\s+href="(https:\/\/www\.amazon\.[^"]+)"\s+target="[^"]*"\s+rel="[^"]*"\s+style="[^"]*background-color:\s*#f0c14b[^"]*"[^>]*>([^<]+)<\/a>/gi;
    fixed = fixed.replace(inlineButtonRegex, (match, url, text) => {
        return `<a href="${url}" class="amazon-button" target="_blank" rel="noopener noreferrer">${text.trim()}</a>`;
    });

    // 2. Fix alternative inline button patterns (with different attribute orders)
    const altButtonRegex = /<a\s+href="(https:\/\/www\.amazon\.[^"]+)"\s+[^>]*style="[^"]*background-color:\s*#f0c14b[^"]*"[^>]*>([^<]+)<\/a>/gi;
    fixed = fixed.replace(altButtonRegex, (match, url, text) => {
        return `<a href="${url}" class="amazon-button" target="_blank" rel="noopener noreferrer">${text.trim()}</a>`;
    });

    // 3. Fix markdown-style Amazon links that appear as buttons
    // Pattern: [Buy on Amazon →](https://www.amazon...)
    const markdownButtonRegex = /\[([^\]]*?Amazon[^\]]*?)\]\((https:\/\/www\.amazon\.[^)]+)\)/gi;
    fixed = fixed.replace(markdownButtonRegex, (match, text, url) => {
        return `<a href="${url}" class="amazon-button" target="_blank" rel="noopener noreferrer">${text.trim()}</a>`;
    });

    // 4. Fix product box inline styles to use class-based structure
    // Pattern: <div style="...background-color: #fff8f3; border: 2px solid #e8923a;..." class="product-box">
    const productBoxStyleRegex = /<div\s+style="[^"]*background-color:\s*#fff8f3[^"]*"[^>]*class="product-box"/gi;
    fixed = fixed.replace(productBoxStyleRegex, '<div class="product-box"');

    // 5. Fix product box with class then style
    const productBoxStyleRegex2 = /<div\s+class="product-box"\s+style="[^"]*"[^>]*>/gi;
    fixed = fixed.replace(productBoxStyleRegex2, '<div class="product-box">');

    // 6. Fix product image inline styles
    const productImageStyleRegex = /<img\s+([^>]*)style="[^"]*width:\s*240px[^"]*"[^>]*class="product-image"/gi;
    fixed = fixed.replace(productImageStyleRegex, '<img $1 class="product-image"');

    // 7. Clean up any remaining raw URL text that's not inside an <a> tag
    // This catches cases where URLs are displayed as plain text
    const rawUrlRegex = /(?<!["'=])https?:\/\/www\.amazon\.[^\s<>"']{10,}(?![^<]*>)/gi;
    fixed = fixed.replace(rawUrlRegex, '');

    // 8. Fix amazon-infographic-fix inline styles
    const infographicStyleRegex = /<style>[\s\S]*?#amazon-infographic-fix[\s\S]*?<\/style>/gi;
    fixed = fixed.replace(infographicStyleRegex, '');

    // 9. Fix amazon-product-section inline styles  
    const productSectionStyleRegex = /<style>[\s\S]*?\.amazon-product-section[\s\S]*?<\/style>/gi;
    fixed = fixed.replace(productSectionStyleRegex, '');

    // 10. Clean up empty style tags
    fixed = fixed.replace(/<style>\s*<\/style>/gi, '');
    fixed = fixed.replace(/<style>\s*<\/style>/gi, '');

    return fixed;
}

async function main() {
    console.log('Fetching all published posts...');
    const posts = await fetchAllPosts();
    console.log(`Found ${posts.length} posts`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const post of posts) {
        const hasAmazon = post.content.toLowerCase().includes('amazon');
        if (!hasAmazon) {
            skippedCount++;
            continue;
        }

        console.log(`\nProcessing: ${post.slug}`);
        const originalContent = post.content;
        const fixedContent = fixAmazonContent(originalContent, post.slug);

        if (fixedContent !== originalContent) {
            const success = await updatePost(post.id, fixedContent);
            if (success) {
                console.log(`  ✓ Updated`);
                updatedCount++;
            } else {
                console.log(`  ✗ Failed to update`);
            }
        } else {
            console.log(`  - No changes needed`);
            skippedCount++;
        }
    }

    console.log(`\n=== Summary ===`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Skipped: ${skippedCount}`);
}

main().catch(console.error);
