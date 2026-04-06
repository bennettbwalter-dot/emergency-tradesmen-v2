/**
 * Blog Content Audit - Step 1: Analyze all posts for issues
 * - Large text blocks (paragraphs over 150 words)
 * - Fun fact sections structure
 * - Amazon element structure
 * - Neobrutalism styling consistency
 */

import posts from './all_posts.json' with { type: 'json' };

const auditResults = [];

posts.forEach((post, idx) => {
    if (!post.published) return;
    
    const content = post.content || '';
    const slug = post.slug || '';
    const title = post.title || '';
    
    const issues = {
        slug,
        title: title.substring(0, 70),
        largeBlocks: [],
        funFactIssues: [],
        amazonIssues: [],
        stylingIssues: [],
        structureIssues: []
    };
    
    // 1. Check for large text blocks (paragraphs over 150 words)
    const paragraphs = content.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
    paragraphs.forEach((p, i) => {
        const text = p.replace(/<[^>]+>/g, '').trim();
        const wordCount = text.split(/\s+/).filter(Boolean).length;
        if (wordCount > 150) {
            issues.largeBlocks.push({
                index: i,
                wordCount,
                preview: text.substring(0, 100) + '...'
            });
        }
    });
    
    // 2. Check fun-fact sections
    const funFactMatches = content.match(/<div class="fun-fact"[^>]*>[\s\S]*?<\/div>/gi) || [];
    funFactMatches.forEach((ff, i) => {
        // Check if it has proper structure
        if (!ff.includes('background:')) {
            issues.funFactIssues.push({
                index: i,
                issue: 'Missing inline styling',
                preview: ff.substring(0, 100)
            });
        }
    });
    
    // 3. Check Amazon elements
    const amazonBtnRegex = /<a[^>]*amazon[^>]*>[^<]*<\/a>/gi;
    const amazonBtns = content.match(amazonBtnRegex) || [];
    amazonBtns.forEach((btn, i) => {
        if (!btn.includes('class="amazon-button"')) {
            issues.amazonIssues.push({
                index: i,
                issue: 'Missing amazon-button class',
                preview: btn.substring(0, 100)
            });
        }
    });
    
    // Check for product-box structure
    const productBoxRegex = /<div class="product-box"[^>]*>[\s\S]*?<\/div>\s*<\/div>/gi;
    const productBoxes = content.match(productBoxRegex) || [];
    productBoxes.forEach((pb, i) => {
        if (!pb.includes('product-image')) {
            issues.amazonIssues.push({
                index: i,
                issue: 'Product box missing product-image class'
            });
        }
    });
    
    // 4. Check for Neobrutalism styling consistency
    // Check if callout/fun-fact/expert-tip have the proper left-border style
    const calloutRegex = /class="(callout|fun-fact|expert-tip)"/gi;
    const callouts = content.match(calloutRegex) || [];
    callouts.forEach((c, i) => {
        // These should be styled via CSS, not inline
    });
    
    // 5. Check for missing TOC
    if (!content.includes('toc-box') && !content.includes('in-this-article')) {
        issues.structureIssues.push('Missing Table of Contents');
    }
    
    // 6. Check for missing author bio
    if (!content.includes('author-bio')) {
        issues.structureIssues.push('Missing author bio section');
    }
    
    // Only add to results if there are issues
    const hasIssues = issues.largeBlocks.length > 0 || 
                      issues.funFactIssues.length > 0 || 
                      issues.amazonIssues.length > 0 ||
                      issues.stylingIssues.length > 0 ||
                      issues.structureIssues.length > 0;
    
    if (hasIssues) {
        auditResults.push(issues);
    }
});

// Output results
console.log('=== BLOG CONTENT AUDIT RESULTS ===\n');
console.log(`Total published posts: ${posts.filter(p => p.published).length}`);
console.log(`Posts with issues: ${auditResults.length}\n`);

auditResults.forEach((result, i) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`${i + 1}. ${result.slug}`);
    console.log(`   Title: ${result.title}`);
    console.log(`${'='.repeat(60)}`);
    
    if (result.largeBlocks.length > 0) {
        console.log(`\n  📝 LARGE TEXT BLOCKS (${result.largeBlocks.length}):`);
        result.largeBlocks.forEach(block => {
            console.log(`    - Paragraph ${block.index}: ${block.wordCount} words`);
            console.log(`      Preview: ${block.preview}`);
        });
    }
    
    if (result.funFactIssues.length > 0) {
        console.log(`\n  ⚡ FUN FACT ISSUES (${result.funFactIssues.length}):`);
        result.funFactIssues.forEach(ff => {
            console.log(`    - ${ff.issue}`);
        });
    }
    
    if (result.amazonIssues.length > 0) {
        console.log(`\n  🛒 AMAZON ISSUES (${result.amazonIssues.length}):`);
        result.amazonIssues.forEach(am => {
            console.log(`    - ${am.issue}`);
        });
    }
    
    if (result.structureIssues.length > 0) {
        console.log(`\n  🏗️  STRUCTURE ISSUES:`);
        result.structureIssues.forEach(si => {
            console.log(`    - ${si}`);
        });
    }
    
    console.log('');
});
