
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function auditBlogLinks() {
    console.log('--- Starting Blog Link Audit ---');
    const { data: posts, error } = await supabase.from('posts').select('id, slug, title, content');

    if (error) {
        console.error('Error fetching posts:', error);
        return;
    }

    const report = [];

    posts.forEach(post => {
        const content = post.content || '';

        // Regex for links
        const mdLinks = content.match(/\[.*?\]\((.*?)\)/g) || [];
        const htmlLinks = content.match(/<a.*?href="(.*?)".*?>/g) || [];
        const allLinks = [...mdLinks, ...htmlLinks];

        const externalLinks = allLinks.filter(l => l.includes('http') && !l.includes('emergency-tradesmen.com'));
        const internalLinks = allLinks.filter(l => l.includes('/blog/') || (!l.includes('http') && l.includes('/')));

        // Authority domains (UK/US)
        const authorityDomains = ['hse.gov.uk', 'gassaferegister.co.uk', 'nhs.uk', 'gov.uk', 'epa.gov', 'cdc.gov', 'fema.gov', 'nfpa.org', 'redcross.org', 'environment-agency.gov.uk'];
        const hasAuthority = externalLinks.some(l => authorityDomains.some(d => l.toLowerCase().includes(d)));

        report.push({
            slug: post.slug,
            title: post.title,
            externalCount: externalLinks.length,
            internalCount: internalLinks.length,
            hasAuthority,
            links: externalLinks.slice(0, 3) // Preview of links
        });
    });

    // Sort by low external links
    report.sort((a, b) => a.externalCount - b.externalCount);

    fs.writeFileSync('scripts/blog_link_audit_results.json', JSON.stringify(report, null, 2));
    console.log(`Audit complete. Results saved to scripts/blog_link_audit_results.json. Found ${report.length} posts.`);

    // Summary
    const zeroAuthority = report.filter(r => !r.hasAuthority).length;
    console.log(`Summary: ${zeroAuthority} posts have NO authoritative links.`);
}

auditBlogLinks();
