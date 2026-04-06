/**
 * Scan all blog posts for unwanted/incorrect text
 * - Foreign characters
 * - Encoding issues
 * - Formatting artifacts
 * - Garbled text
 */

import posts from './all_posts.json' with { type: 'json' };

const issues = [];

posts.forEach((post, idx) => {
    if (!post.published) return;
    
    const content = post.content || '';
    const title = post.title || '';
    const slug = post.slug || '';
    
    // Check for non-ASCII characters (excluding common HTML entities and punctuation)
    const nonAsciiRegex = /[^\x00-\x7F]/g;
    const nonAsciiMatches = content.match(nonAsciiRegex);
    
    if (nonAsciiMatches) {
        const uniqueChars = [...new Set(nonAsciiMatches)];
        // Filter out common legitimate characters like em-dash, curly quotes, etc.
        const suspicious = uniqueChars.filter(c => {
            const code = c.charCodeAt(0);
            // Allow: curly quotes, em-dash, en-dash, ellipsis, degree symbol, pound, euro, etc.
            const allowed = [
                0x2018, 0x2019, 0x201C, 0x201D, // curly quotes
                0x2013, 0x2014, // en-dash, em-dash
                0x2026, // ellipsis
                0x00B0, // degree
                0x00A3, // pound
                0x20AC, // euro
                0x2122, // trademark
                0x00AE, // registered
                0x00A9, // copyright
                0x2605, 0x2606, // stars
                0x2713, 0x2714, // checkmarks
                0x274C, 0x2705, // x mark, check
                0x2192, 0x2190, 0x2191, 0x2193, // arrows
                0xFE0F, // variation selector
            ];
            return !allowed.includes(code);
        });
        
        if (suspicious.length > 0) {
            issues.push({
                idx,
                slug,
                title: title.substring(0, 60),
                type: 'Non-ASCII characters',
                chars: suspicious.map(c => `${c} (U+${c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')})`),
                context: findContext(content, nonAsciiRegex)
            });
        }
    }
    
    // Check for common garbled patterns
    const garbledPatterns = [
        /[\u4e00-\u9fff]+/g, // Chinese
        /[\u3040-\u309f]+/g, // Japanese hiragana
        /[\u30a0-\u30ff]+/g, // Japanese katakana
        /[\uac00-\ud7af]+/g, // Korean
        /[\u0600-\u06ff]+/g, // Arabic
        /[\u0400-\u04ff]+/g, // Cyrillic
        /&amp;[a-z]+;/g, // malformed HTML entities (but not common ones)
        /\uFFFD/g, // replacement character
        /\u200B/g, // zero-width space
        /\uFEFF/g, // BOM
    ];
    
    garbledPatterns.forEach((pattern, pIdx) => {
        const matches = content.match(pattern);
        if (matches && matches.length > 0) {
            // Skip common legitimate patterns
            if (pattern.source.includes('&amp;')) {
                // Only flag if it's not a common entity
                const legitEntities = /&amp;(nbsp|lt|gt|quot|apos|amp);/g;
                const legitMatches = content.match(legitEntities) || [];
                if (matches.length > legitMatches.length) {
                    issues.push({
                        idx,
                        slug,
                        title: title.substring(0, 60),
                        type: 'Garbled/Foreign text',
                        pattern: pattern.source,
                        count: matches.length - legitMatches.length,
                        examples: [...new Set(matches)].slice(0, 5)
                    });
                }
            } else {
                issues.push({
                    idx,
                    slug,
                    title: title.substring(0, 60),
                    type: 'Garbled/Foreign text',
                    pattern: pattern.source,
                    count: matches.length,
                    examples: [...new Set(matches)].slice(0, 5)
                });
            }
        }
    });
    
    // Check for double-encoded HTML entities
    const doubleEncoded = content.match(/&amp;amp;|&amp;lt;|&amp;gt;|&amp;quot;/g);
    if (doubleEncoded) {
        issues.push({
            idx,
            slug,
            title: title.substring(0, 60),
            type: 'Double-encoded HTML',
            examples: [...new Set(doubleEncoded)].slice(0, 5)
        });
    }
    
    // Check for orphaned markdown symbols
    const orphanedMarkdown = content.match(/(?<!\*)\*(?!\*)|\*{3,}|#{4,}/g);
    if (orphanedMarkdown) {
        issues.push({
            idx,
            slug,
            title: title.substring(0, 60),
            type: 'Orphaned markdown',
            examples: [...new Set(orphanedMarkdown)].slice(0, 5)
        });
    }
});

function findContext(content, regex) {
    const match = content.match(regex);
    if (!match) return '';
    const char = match[0];
    const idx = content.indexOf(char);
    const start = Math.max(0, idx - 50);
    const end = Math.min(content.length, idx + 50);
    return content.substring(start, end).replace(/\n/g, ' ');
}

// Output results
console.log('=== BLOG CONTENT SCAN RESULTS ===\n');
console.log(`Total posts scanned: ${posts.filter(p => p.published).length}\n`);

if (issues.length === 0) {
    console.log('✅ No issues found! All content is clean.');
} else {
    console.log(`⚠️  Found ${issues.length} potential issue(s):\n`);
    issues.forEach((issue, i) => {
        console.log(`--- Issue ${i + 1} ---`);
        console.log(`Post: ${issue.slug}`);
        console.log(`Title: ${issue.title}`);
        console.log(`Type: ${issue.type}`);
        if (issue.chars) console.log(`Characters: ${issue.chars.join(', ')}`);
        if (issue.count) console.log(`Count: ${issue.count}`);
        if (issue.examples) console.log(`Examples: ${issue.examples.slice(0, 3).join(', ')}`);
        if (issue.context) console.log(`Context: ...${issue.context}...`);
        console.log('');
    });
}
