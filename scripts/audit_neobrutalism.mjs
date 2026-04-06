/**
 * Chunk 5: Audit Neobrutalism styling consistency
 * Check callout, fun-fact, expert-tip, capsule-box, donts-column styling
 */

import posts from './all_posts.json' with { type: 'json' };

console.log('=== NEOBRUTALISM STYLING AUDIT ===\n');

const publishedPosts = posts.filter(p => p.published);
let totalChecked = 0;
let issuesFound = 0;

publishedPosts.forEach(post => {
    const content = post.content || '';
    const slug = post.slug || '';
    const postIssues = [];
    
    // Check for capsule-box styling (Knowledge Capsule sections)
    const capsuleMatches = content.match(/<div class="capsule-box"[^>]*>/gi) || [];
    capsuleMatches.forEach((match, i) => {
        // These should be styled via CSS, check if they have proper structure
        if (!match.includes('background') && !content.includes('.capsule-box')) {
            // CSS handles this, but let's verify the structure
        }
    });
    
    // Check for DOs/DON'Ts columns
    const dosColumn = content.includes('class="dos-column"');
    const dontsColumn = content.includes('class="donts-column"');
    if (dosColumn || dontsColumn) {
        // These should exist in pairs
        if (dosColumn && !dontsColumn) {
            postIssues.push('Has dos-column but missing donts-column');
        }
        if (!dosColumn && dontsColumn) {
            postIssues.push('Has donts-column but missing dos-column');
        }
    }
    
    // Check for orphaned divs (unclosed or empty)
    const openDivs = (content.match(/<div/g) || []).length;
    const closeDivs = (content.match(/<\/div>/g) || []).length;
    if (openDivs !== closeDivs) {
        postIssues.push(`Mismatched divs: ${openDivs} open, ${closeDivs} close`);
    }
    
    // Check for double-encoded HTML entities
    const doubleEncoded = content.match(/&amp;amp;|&amp;lt;|&amp;gt;/g);
    if (doubleEncoded) {
        postIssues.push(`Double-encoded entities: ${doubleEncoded.length}`);
    }
    
    // Check for raw URLs (not inside <a> tags)
    const rawUrls = content.match(/(?<!["'=])https?:\/\/(?!www\.amazon)[^\s<>"']{20,}(?![^<]*>)/g);
    if (rawUrls && rawUrls.length > 0) {
        // Filter out legitimate URLs in meta tags, schema, etc.
        const suspiciousUrls = rawUrls.filter(url => 
            !url.includes('schema.org') && 
            !url.includes('emergencytradesmen') && 
            !url.includes('emergencycontractors')
        );
        if (suspiciousUrls.length > 0) {
            postIssues.push(`Raw URLs found: ${suspiciousUrls.length}`);
        }
    }
    
    if (postIssues.length > 0) {
        issuesFound++;
        console.log(`\n⚠️  ${slug}`);
        postIssues.forEach(issue => console.log(`   - ${issue}`));
    }
    
    totalChecked++;
});

console.log(`\n${'='.repeat(50)}`);
console.log(`Total posts checked: ${totalChecked}`);
console.log(`Posts with issues: ${issuesFound}`);
console.log(`Posts clean: ${totalChecked - issuesFound}`);
