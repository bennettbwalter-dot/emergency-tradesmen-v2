/**
 * Chunk 4: Audit Amazon product containers across all posts
 * Check structure, alignment, and styling consistency
 */

import posts from './all_posts.json' with { type: 'json' };

const AMAZON_POSTS = [
    'smart-leak-detection-us',
    'radon-emergency-us',
    'portable-power-stations-home-backup-gb',
    'portable-power-stations-emergency-backup-us',
    'smart-leak-detection-2026-gb',
    'refrigerant-leak-safety-us',
    'refrigerant-leak-safety-gb'
];

console.log('=== AMAZON PRODUCT CONTAINER AUDIT ===\n');

AMAZON_POSTS.forEach(slug => {
    const post = posts.find(p => p.slug === slug);
    if (!post) {
        console.log(`✗ ${slug}: Not found`);
        return;
    }
    
    const content = post.content;
    const issues = [];
    
    // Check for amazon-product-section
    const hasProductSection = content.includes('amazon-product-section');
    
    // Check for product-box
    const productBoxCount = (content.match(/class="product-box"/g) || []).length;
    
    // Check for product-image
    const productImageCount = (content.match(/class="product-image"/g) || []).length;
    
    // Check for amazon-button class
    const amazonBtnRegex = /<a[^>]*class="amazon-button"[^>]*>Buy on Amazon[^<]*<\/a>/gi;
    const amazonBtnCount = (content.match(amazonBtnRegex) || []).length;
    
    // Check for inline-styled buttons (bad)
    const inlineBtnRegex = /<a[^>]*style="[^"]*background-color:\s*#f0c14b[^"]*"[^>]*>Buy on Amazon[^<]*<\/a>/gi;
    const inlineBtnCount = (content.match(inlineBtnRegex) || []).length;
    
    // Check for product-image-wrapper
    const hasImageWrapper = content.includes('class="product-image-wrapper"');
    
    // Check for product-info
    const hasProductInfo = content.includes('class="product-info"');
    
    console.log(`\n${'─'.repeat(50)}`);
    console.log(`📦 ${slug}`);
    console.log(`${'─'.repeat(50)}`);
    console.log(`  Product sections: ${hasProductSection ? '✓' : '✗'}`);
    console.log(`  Product boxes: ${productBoxCount}`);
    console.log(`  Product images: ${productImageCount}`);
    console.log(`  Image wrappers: ${hasImageWrapper ? '✓' : '✗'}`);
    console.log(`  Product info divs: ${hasProductInfo ? '✓' : '✗'}`);
    console.log(`  Styled buttons: ${amazonBtnCount}`);
    console.log(`  Inline-styled buttons: ${inlineBtnCount > 0 ? '✗ ' + inlineBtnCount : '✓ 0'}`);
    
    if (inlineBtnCount > 0) issues.push('Has inline-styled Amazon buttons');
    if (productBoxCount === 0 && !hasProductSection) issues.push('Missing Amazon product structure entirely');
    if (productImageCount === 0 && hasProductSection) issues.push('Product section missing product images');
    
    if (issues.length > 0) {
        console.log(`  ⚠️  Issues:`);
        issues.forEach(i => console.log(`    - ${i}`));
    } else {
        console.log(`  ✅ All good`);
    }
});
