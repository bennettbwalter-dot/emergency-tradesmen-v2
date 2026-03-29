import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function auditUSBlogs() {
    console.log('Auditing US blog posts for UK branding/terminology...');
    const { data: posts, error } = await supabase
        .from('posts')
        .select('slug, content')
        .ilike('slug', '%-us');

    if (error) {
        console.error('Error fetching posts:', error);
        return;
    }

    const ukIndicators = [
        'Gas Safe',
        'NICEIC',
        'NAPIT',
        'Part P',
        'City & Guilds',
        '£',
        'Tradesmen',
        'Boiler',
        'Breakdown Recovery',
        'Postcode',
        'vetted-pro-badge' // This is the specific image we know has UK badges
    ];

    const auditResults = [];

    posts.forEach(post => {
        const issues = [];
        ukIndicators.forEach(indicator => {
            if (post.content && post.content.includes(indicator)) {
                issues.push(indicator);
            }
        });

        if (issues.length > 0) {
            auditResults.push({
                slug: post.slug,
                issues: issues
            });
        }
    });

    console.log('--- US Blog Audit Results ---');
    console.log(JSON.stringify(auditResults, null, 2));
    console.log('-----------------------------');
}

auditUSBlogs();
