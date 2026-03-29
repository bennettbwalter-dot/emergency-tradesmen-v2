
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function countWords(str) {
    return str.split(/\s+/).filter(word => word.length > 0).length;
}

async function auditPosts() {
    const auditResults = [];

    // Audit Database Posts
    console.log('Auditing database posts...');
    const { data: dbPosts, error } = await supabase.from('posts').select('*');
    if (!error && dbPosts) {
        dbPosts.forEach(post => {
            auditResults.push({
                source: 'Database',
                slug: post.slug,
                title: post.title,
                wordCount: countWords(post.content || ''),
            });
        });
    }

    // Audit Static Posts (Manual extraction from BlogPostPage.tsx)
    const blogPostPagePath = path.resolve(process.cwd(), 'src/pages/BlogPostPage.tsx');
    const content = fs.readFileSync(blogPostPagePath, 'utf8');

    // This is a rough extraction for the specific static blocks in the file
    const staticPosts = [
        { name: 'UK Emergency Tradesmen', slug: 'uk-emergency-tradesmen-expert-repairs' },
        { name: 'Electrical Fire Warning Signs', slug: 'electrical-fire-warning-signs' },
        { name: 'Carbon Monoxide Safety Guide', slug: 'carbon-monoxide-safety-guide' },
        { name: 'Spring Thaw Boost', slug: 'spring-thaw-pipe-burst-prevention' }
    ];

    // For simplicity, I'll just look for the slugs and a bit of the content in the file
    staticPosts.forEach(post => {
        const regex = new RegExp(post.slug + ".*?content:.*?\`(.*?)\`", "s");
        const match = content.match(regex);
        if (match) {
            auditResults.push({
                source: 'Static',
                slug: post.slug,
                title: post.name,
                wordCount: countWords(match[1]),
            });
        }
    });

    console.table(auditResults);
}

auditPosts();
