/**
 * Show exact content around the orphaned image
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
    
    // Find the orphaned image at position 15271
    const idx = content.indexOf('/blog/ac-heatwave-preparation-signs-repair-uk-2026/costway-6in1.webp');
    if (idx > -1) {
        console.log('Found at position:', idx);
        console.log('\n=== 500 chars before ===');
        console.log(content.substring(Math.max(0, idx - 500), idx));
        console.log('\n=== 500 chars after ===');
        console.log(content.substring(idx, idx + 500));
    }
}

main().catch(console.error);
