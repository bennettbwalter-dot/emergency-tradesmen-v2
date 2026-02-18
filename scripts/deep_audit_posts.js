
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function deepAudit() {
    const { data: posts, error } = await supabase
        .from('posts')
        .select('id, slug, title, content, cover_image');

    if (error) {
        console.error(error);
        return;
    }

    const auditResults = posts.map(post => {
        const content = post.content || '';
        const imgTags = (content.match(/<img/g) || []).length;
        const mdImages = (content.match(/!\[.*?\]\(.*?\)/g) || []).length;
        const total = imgTags + mdImages;

        return {
            slug: post.slug,
            title: post.title,
            imageCount: total,
            hasCover: !!post.cover_image
        };
    });

    fs.writeFileSync('deep_audit_results.json', JSON.stringify(auditResults, null, 2));

    const missing = auditResults.filter(r => r.imageCount < 2);
    console.log(`Deep Audit: ${posts.length} posts checked.`);
    console.log(`${missing.length} posts have fewer than 2 content images.`);

    missing.forEach(m => console.log(`  - [${m.imageCount}] ${m.slug} | ${m.title}`));
}

deepAudit();
