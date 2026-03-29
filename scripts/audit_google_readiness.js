import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkReadiness() {
    const { data: posts, error } = await supabase
        .from('posts')
        .select('slug, title, excerpt, content, cover_image, published_at')
        .eq('published', true)
        .order('published_at', { ascending: false });

    if (error) { console.error(error); return; }

    const report = [];

    posts.forEach(post => {
        const wordCount = post.content.split(/\s+/).length;
        const imageCount = (post.content.match(/!\[.*?\]\(.*?\)/g) || []).length;
        const excerptLength = post.excerpt?.length || 0;
        const isWebp = post.cover_image?.endsWith('.webp');
        
        // Section checks
        const hasFAQ = post.content.toLowerCase().includes('faq') || post.content.toLowerCase().includes('frequently asked questions');
        const hasLegal = post.content.toLowerCase().includes('regulation') || post.content.toLowerCase().includes('compliance') || post.content.toLowerCase().includes('legal');
        const hasCost = post.content.toLowerCase().includes('cost') || post.content.toLowerCase().includes('price') || post.content.toLowerCase().includes('fee');

        let score = 0;
        let findings = [];

        if (wordCount >= 1200) score += 20; else findings.push(`Short: ${wordCount}/1200 words`);
        if (imageCount >= 3) score += 20; else findings.push(`Images: ${imageCount}/3`);
        if (excerptLength >= 130 && excerptLength <= 170) score += 20; else findings.push(`Excerpt len: ${excerptLength}`);
        if (isWebp) score += 20; else findings.push('Non-WebP cover');
        if (hasFAQ && hasLegal && hasCost) score += 20; else {
            let missing = [];
            if (!hasFAQ) missing.push('FAQ');
            if (!hasLegal) missing.push('Legal');
            if (!hasCost) missing.push('Cost');
            findings.push(`Missing Sections: ${missing.join(', ')}`);
        }

        report.push({
            slug: post.slug,
            score,
            findings
        });
    });

    console.log('\n=== GOOGLE READINESS AUDIT ===\n');
    report.forEach(r => {
        const status = r.score === 100 ? '✅ READY' : (r.score >= 50 ? '⚠️ UPDATE' : '❌ WEAK ');
        console.log(`${status} | Score: ${r.score}% | ${r.slug}`);
        if (r.findings.length > 0) {
            console.log(`   - Fix: ${r.findings.join(', ')}`);
        }
    });

    const ready = report.filter(r => r.score === 100).length;
    console.log(`\nSummary: ${ready}/${posts.length} blogs are 100% ready for Google Indexing & Discover.\n`);
}

checkReadiness();
