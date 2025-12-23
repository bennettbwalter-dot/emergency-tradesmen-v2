import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load env vars
if (fs.existsSync('.env.production')) {
    dotenv.config({ path: '.env.production' });
} else {
    dotenv.config();
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Data from src/lib/trades.ts
const trades = [
    "plumber", "electrician", "locksmith", "gas-engineer", "drain-specialist", "glazier", "breakdown"
];

const cities = [
    "Manchester", "Birmingham", "Leeds", "Sheffield", "Nottingham", "Leicester", "Derby",
    "Coventry", "Wolverhampton", "Stoke-on-Trent", "Liverpool", "Preston", "Bolton",
    "Oldham", "Rochdale", "Bradford", "Huddersfield", "York", "Hull", "Doncaster",
    "Northampton", "Milton Keynes", "Luton", "Bedford", "Peterborough", "Cambridge",
    "Norwich", "Ipswich", "Reading", "Oxford", "Swindon", "Cheltenham", "Gloucester",
    "Worcester", "Hereford", "Shrewsbury", "Telford", "Cannock", "Tamworth", "Nuneaton",
    "Rugby", "Bath", "Brighton & Hove", "Bristol", "Canterbury", "Carlisle", "Chelmsford",
    "Chester", "Chichester", "Colchester", "Durham", "Ely", "Exeter", "Lancaster",
    "Lichfield", "Lincoln", "London", "London", "Newcastle-upon-Tyne", "Plymouth", "Portsmouth",
    "Ripon", "Salford", "Salisbury", "Southampton", "Southend-on-Sea", "St Albans",
    "Sunderland", "Truro", "Wakefield", "Wells", "Winchester", "Westminster",
    "Warrington", "Wigan", "Middlesbrough", "Blackpool", "Barnsley"
];

const BASE_URL = 'https://emergencytradesmen.net';

async function generateSitemap() {
    console.log('🔄 Fetching data from Supabase...');

    // 1. Fetch all verified businesses with pagination
    let allBusinesses = [];
    let from = 0;
    const step = 1000;
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase
            .from('businesses')
            .select('id, updated_at')
            .eq('verified', true)
            .range(from, from + step - 1);

        if (error) {
            console.error('❌ Error fetching businesses:', error);
            break;
        }

        allBusinesses = [...allBusinesses, ...data];
        if (data.length < step) {
            hasMore = false;
        } else {
            from += step;
        }
    }

    const businesses = allBusinesses;

    // 2. Fetch published blog posts
    const { data: posts, error: postError } = await supabase
        .from('posts')
        .select('slug, updated_at')
        .eq('published', true);

    if (postError) {
        console.error('❌ Error fetching posts:', postError);
        return;
    }

    console.log(`✅ Found ${businesses.length} verified businesses.`);
    console.log(`✅ Found ${posts?.length || 0} published blog posts.`);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // 1. Static Pages
    const staticPages = [
        '', '/about', '/pricing', '/terms', '/privacy', '/compare',
        '/contact', '/user/login', '/business/login', '/blog'
    ];

    staticPages.forEach(p => {
        xml += `
  <url>
    <loc>${BASE_URL}${p}</loc>
    <changefreq>weekly</changefreq>
    <priority>${p === '' ? '1.0' : '0.8'}</priority>
  </url>`;
    });

    // 2. Dynamic City Pages (Trade + City)
    trades.forEach(trade => {
        cities.forEach(city => {
            const citySlug = city.toLowerCase().replace(/ /g, '-').replace('&', 'and');
            const url = `/emergency-${trade}/${citySlug}`;
            xml += `
  <url>
    <loc>${BASE_URL}${url}</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
        });
    });

    // 3. Dynamic Business Profiles
    businesses.forEach(biz => {
        xml += `
  <url>
    <loc>${BASE_URL}/business/${biz.id}</loc>
    <lastmod>${biz.updated_at ? biz.updated_at.split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    // 4. Dynamic Blog Posts
    posts?.forEach(post => {
        xml += `
  <url>
    <loc>${BASE_URL}/blog/${post.slug}</loc>
    <lastmod>${post.updated_at ? post.updated_at.split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    xml += `
</urlset>`;

    const outputPath = path.join(__dirname, '../public/sitemap.xml');
    fs.writeFileSync(outputPath, xml);
    console.log(`✅ Sitemap generated at ${outputPath}`);
    console.log(`📊 Summary:`);
    console.log(`   - Static: ${staticPages.length}`);
    console.log(`   - City Pages: ${trades.length * cities.length}`);
    console.log(`   - Business Profiles: ${businesses.length}`);
    console.log(`   - Blog Posts: ${posts?.length || 0}`);
    console.log(`   - Total URLs: ${staticPages.length + (trades.length * cities.length) + businesses.length + (posts?.length || 0)}`);
}

generateSitemap();
