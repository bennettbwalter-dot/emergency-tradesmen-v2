const fs = require('fs');
const path = require('path');

const posts = JSON.parse(fs.readFileSync('scripts/all_posts_content_v2.json', 'utf8'));

const results = [];

posts.forEach(post => {
    const { slug, title, content } = post;
    const isUK = slug.endsWith('-gb');
    const isUS = slug.endsWith('-us');

    // Check for External Backlinks (roughly looking for http links that aren't emergencytradesmen.net)
    const externalLinks = (content.match(/\[.*?\]\(https?:\/\/(?!emergencytradesmen\.net|localhost).*?\)/g) || []);

    // Check for Internal Links (links to emergencytradesmen.net or relative links)
    const internalLinks = (content.match(/\[.*?\]\((https?:\/\/emergencytradesmen\.net|\/|#).*?\)/g) || []);

    // Check for Regulatory References
    const regs = [
        'HSE', 'Gas Safe', 'NHS', 'Building Regulations', 'BS7671', 'Wiring Regulations', // UK
        'EPA', 'CDC', 'CPSC', 'OSHA', 'National Electrical Code', 'NFPA', 'NEC', 'ASAP' // US
    ];
    const foundRegs = regs.filter(reg => content.toLowerCase().includes(reg.toLowerCase()));

    results.push({
        slug,
        title,
        externalCount: externalLinks.length,
        internalCount: internalLinks.length,
        regCount: foundRegs.length,
        foundRegs,
        isUK,
        isUS
    });
});

fs.writeFileSync('scripts/audit_results.json', JSON.stringify(results, null, 2));

console.log('Audit complete. Results in scripts/audit_results.json');
console.table(results.map(r => ({
    slug: r.slug,
    ext: r.externalCount,
    int: r.internalCount,
    regs: r.regCount
})));
