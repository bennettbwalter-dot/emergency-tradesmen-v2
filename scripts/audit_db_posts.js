
import fs from 'fs';
import path from 'path';

const postsPath = path.resolve(process.cwd(), 'scripts', 'all_posts.json');
const reportPath = path.resolve(process.cwd(), 'scripts', 'db_audit_report.md');

if (!fs.existsSync(postsPath)) {
    console.error('all_posts.json not found. Run fetch_all_blogs.js first.');
    process.exit(1);
}

const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));

let report = '# Database Blog Post Audit Report\n\n';
report += `Total Posts: ${posts.length}\n\n`;
report += '| Slug | Region (Detected) | Word Count | Headings (H2/H3) | Meta (Exc/Img) | Status |\n';
report += '|---|---|---|---|---|---|\n';

let passCount = 0;
let failCount = 0;

posts.forEach(post => {
    const content = post.content || '';
    const wordCount = content.split(/\s+/).length;

    // Detect Region
    let region = 'Unknown';
    const lowerContent = (content + (post.title || '')).toLowerCase();
    const isUK = lowerContent.includes(' uk ') || lowerContent.includes('£') || lowerContent.includes('999') || lowerContent.includes('colour') || lowerContent.includes('neighbour');
    const isUS = lowerContent.includes(' us ') || lowerContent.includes('usa') || lowerContent.includes('$') || lowerContent.includes('911') || lowerContent.includes('color') || lowerContent.includes('neighbor');

    if (isUK && !isUS) region = 'UK';
    else if (isUS && !isUK) region = 'US';
    else if (isUK && isUS) region = 'Mixed';

    // Check Headings
    const h2Count = (content.match(/^## /gm) || []).length;
    const h3Count = (content.match(/^### /gm) || []).length;
    const hasHeadings = h2Count > 0;

    // Check Metadata
    const hasExcerpt = !!post.excerpt;
    const hasImage = !!post.cover_image;

    // Status
    // Criteria: Word count >= 1000, HAS headings, HAS excerpt, HAS cover image
    const isPassing = wordCount >= 1000 && hasHeadings && hasExcerpt && hasImage;

    if (isPassing) passCount++;
    else failCount++;

    const statusIcon = isPassing ? '✅' : '❌';

    report += `| \`${post.slug}\` | ${region} | ${wordCount} | ${h2Count} / ${h3Count} | ${hasExcerpt ? '✅' : '❌'} / ${hasImage ? '✅' : '❌'} | ${statusIcon} |\n`;
});

report += `\n**Summary:**\n- Passing: ${passCount}\n- Failing: ${failCount}\n`;

fs.writeFileSync(reportPath, report);
console.log(`Audit report generated at ${reportPath}`);
