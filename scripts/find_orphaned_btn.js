/**
 * Find and remove the orphaned button
 */

const SUPABASE_URL = 'https://xwqvhymkwuasotsgmarn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cXZoeW1rd3Vhc290c2dtYXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5MDM0MywiZXhwIjoyMDgxNTY2MzQzfQ.ZJQXY5OzkfO4Ey2G5enTdPHx_shgDMGAUaTJAHKDKus';

async function main() {
    const url = `${SUPABASE_URL}/rest/v1/posts?select=*&slug=eq.refrigerant-leak-safety-gb`;
    const res = await fetch(url, {
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
        }
    });
    const data = await res.json();
    const content = data[0].content;
    
    // Find all "Buy on Amazon" positions
    let idx = 0;
    let n = 1;
    while ((idx = content.indexOf('Buy on Amazon', idx)) !== -1) {
        console.log(`\n=== Button ${n} at position ${idx} ===`);
        console.log('Context 300 chars before:');
        console.log(content.substring(Math.max(0, idx - 300), idx));
        console.log('\nContext 200 chars after:');
        console.log(content.substring(idx, idx + 200));
        idx++;
        n++;
    }
}

main().catch(console.error);
