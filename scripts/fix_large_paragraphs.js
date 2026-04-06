/**
 * Fix large text blocks in blog posts
 * Break paragraphs over 150 words into smaller chunks
 */

const SUPABASE_URL = 'https://xwqvhymkwuasotsgmarn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cXZoeW1rd3Vhc290c2dtYXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5MDM0MywiZXhwIjoyMDgxNTY2MzQzfQ.ZJQXY5OzkfO4Ey2G5enTdPHx_shgDMGAUaTJAHKDKus';

const AFFECTED = [
    'ac-blowing-warm-air-capacitor-leak-us',
    'water-leaking-through-ceiling-first-steps-us',
    'the-definitive-uk-home-security-safety-standards-2026',
    'ultimate-us-emergency-home-resilience-2026',
    'smart-leak-detection-us',
    'frozen-pipe-thaw-flood-prevention-us',
    'car-battery-alternator-failure-gb',
    '2026-grid-instability-generator-resilience-us',
    '2026-energy-crisis-generator-safety-gb',
    'radon-emergency-us',
    'spring-thaw-burst-pipe-prevention-gb',
    'commercial-electrician-us',
    'commercial-gas-safe-uk',
    'emergency-trades-us',
    'facility-management-emergency-us',
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

async function updatePost(id, content) {
    const url = `${SUPABASE_URL}/rest/v1/posts?id=eq.${id}`;
    const res = await fetch(url, {
        method: 'PATCH',
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ content })
    });
    return res.ok;
}

function breakLargeParagraphs(content) {
    const paragraphRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    
    return content.replace(paragraphRegex, (match, text) => {
        const cleanText = text.replace(/<[^>]+>/g, '').trim();
        const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
        
        if (wordCount <= 150) return match;
        
        // Check if this is a FAQ section (don't break those)
        if (cleanText.toLowerCase().includes('frequently asked questions')) return match;
        
        // Split on sentence boundaries (period, question mark, exclamation followed by space + capital)
        const sentences = cleanText.match(/[^.!?]+[.!?]+/g);
        if (!sentences || sentences.length < 3) return match;
        
        // Group sentences into chunks of ~80-120 words
        const chunks = [];
        let currentChunk = '';
        let currentWordCount = 0;
        
        for (const sentence of sentences) {
            const sentenceWords = sentence.trim().split(/\s+/).length;
            
            if (currentWordCount + sentenceWords > 120 && currentChunk.length > 0) {
                chunks.push(currentChunk.trim());
                currentChunk = sentence.trim();
                currentWordCount = sentenceWords;
            } else {
                currentChunk += ' ' + sentence.trim();
                currentWordCount += sentenceWords;
            }
        }
        
        if (currentChunk.trim()) chunks.push(currentChunk.trim());
        
        if (chunks.length <= 1) return match;
        
        return chunks.map(chunk => `<p>${chunk}</p>`).join('\n');
    });
}

async function main() {
    let fixedCount = 0;
    
    for (const slug of AFFECTED) {
        console.log(`\nProcessing: ${slug}`);
        const post = await fetchPost(slug);
        if (!post) {
            console.log('  ✗ Not found');
            continue;
        }
        
        const fixed = breakLargeParagraphs(post.content);
        if (fixed !== post.content) {
            const success = await updatePost(post.id, fixed);
            if (success) {
                console.log('  ✓ Fixed large paragraphs');
                fixedCount++;
            } else {
                console.log('  ✗ Failed');
            }
        } else {
            console.log('  - No large blocks found');
        }
    }
    
    console.log(`\n=== Summary ===`);
    console.log(`Posts fixed: ${fixedCount}/${AFFECTED.length}`);
}

main().catch(console.error);
