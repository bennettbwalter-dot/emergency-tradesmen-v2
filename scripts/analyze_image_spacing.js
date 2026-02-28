
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function detailedAudit() {
    const { data: posts } = await supabase
        .from('posts')
        .select('title, slug, content');

    for (const post of posts) {
        if (!post.content) continue;
        const lines = post.content.split('\n');
        const images = [];
        const headers = [];
        let wordCount = 0;

        lines.forEach((line, idx) => {
            if (line.match(/!\[.*?\]\(.*?\)/)) images.push({ line: idx, text: line.trim().substring(0, 80) });
            if (line.match(/^#{2,3}\s/)) headers.push({ line: idx, text: line.trim().substring(0, 80) });
            wordCount += line.split(/\s+/).filter(w => w.length > 0).length;
        });

        if (images.length > 0) {
            console.log(`\n=== ${post.title} (${post.slug}) ===`);
            console.log(`  Total: ${lines.length} lines, ${wordCount} words, ${images.length} images, ${headers.length} headers`);
            images.forEach(img => console.log(`  IMG L${img.line}: ${img.text}`));

            // Check for clusters
            for (let i = 0; i < images.length - 1; i++) {
                const gap = images[i + 1].line - images[i].line;
                if (gap < 15) {
                    console.log(`  *** CLUSTER: images at L${images[i].line} and L${images[i + 1].line} (gap: ${gap} lines)`);
                }
            }
        }
    }
}

detailedAudit();
