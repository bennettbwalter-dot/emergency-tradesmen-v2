/**
 * Verify live Supabase data for the 17 flagged posts
 */

const SUPABASE_URL = 'https://xwqvhymkwuasotsgmarn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cXZoeW1rd3Vhc290c2dtYXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5MDM0MywiZXhwIjoyMDgxNTY2MzQzfQ.ZJQXY5OzkfO4Ey2G5enTdPHx_shgDMGAUaTJAHKDKus';

const FLAGGED = [
    'radon-emergency-us',
    'portable-power-stations-home-backup-gb',
    'portable-power-stations-emergency-backup-us',
    'smart-leak-detection-2026-gb',
    'emergency-contractor-us',
    'commercial-electrician-us',
    'commercial-drainage-gb',
    'building-envelope-audit-us',
    'commercial-refrigeration-repair-us',
    'commercial-gas-safe-uk',
    'emergency-trades-us',
    'facility-management-emergency-us',
    'flat-roof-leak-prevention-us',
    'flat-roof-leak-prevention-gb',
    'emergency-services-gb',
    'emergency-handyman-us',
    'emergency-tradesmen-uk'
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

async function main() {
    let clean = 0;
    let issues = 0;
    
    for (const slug of FLAGGED) {
        const post = await fetchPost(slug);
        if (!post) {
            console.log(`✗ ${slug}: Not found`);
            continue;
        }
        
        const c = post.content;
        const postIssues = [];
        
        if (/[\u4e00-\u9fff]/.test(c)) postIssues.push('Chinese chars');
        if (/style="[^"]*background-color:\s*#f0c14b/.test(c)) postIssues.push('Inline Amazon btn');
        
        const openDivs = (c.match(/<div/g) || []).length;
        const closeDivs = (c.match(/<\/div>/g) || []).length;
        if (openDivs !== closeDivs) postIssues.push(`Div mismatch: ${openDivs}/${closeDivs}`);
        
        if (postIssues.length > 0) {
            console.log(`⚠️  ${slug}: ${postIssues.join(', ')}`);
            issues++;
        } else {
            clean++;
        }
    }
    
    console.log(`\n=== Live Data Results ===`);
    console.log(`Clean: ${clean}/${FLAGGED.length}`);
    console.log(`Issues: ${issues}/${FLAGGED.length}`);
}

main().catch(console.error);
