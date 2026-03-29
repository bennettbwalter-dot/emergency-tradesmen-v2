import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = fs.existsSync(path.join(__dirname, '../.env.production'))
    ? path.join(__dirname, '../.env.production')
    : path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const BASE_URL = 'https://emergencytradesmen.net';

async function generateRSS() {
    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing Supabase credentials');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false });

    if (error) {
        console.error('❌ Error fetching posts:', error);
        return;
    }

    let rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2004/atom">
<channel>
    <title>Emergency Tradesmen Blog</title>
    <link>${BASE_URL}/blog</link>
    <description>Latest insights and advice on emergency home repairs, plumbing, electrical, and more.</description>
    <language>en-gb</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml" />`;

    posts.forEach(post => {
        const isUS = post.slug.endsWith('-us');
        const prefix = isUS ? '/us' : '';
        const url = `${BASE_URL}${prefix}/blog/${post.slug}`;

        rss += `
    <item>
        <title><![CDATA[${post.title}]]></title>
        <link>${url}</link>
        <guid isPermaLink="true">${url}</guid>
        <pubDate>${new Date(post.published_at || post.created_at).toUTCString()}</pubDate>
        <description><![CDATA[${post.excerpt || post.title}]]></description>
    </item>`;
    });

    rss += `
</channel>
</rss>`;

    const outputPath = path.join(__dirname, '../public/rss.xml');
    fs.writeFileSync(outputPath, rss);
    console.log(` ✅ Generated RSS feed at ${outputPath} (${posts.length} items)`);
}

generateRSS();
