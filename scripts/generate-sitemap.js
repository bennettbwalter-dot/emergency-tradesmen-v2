import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
const envPath = fs.existsSync(path.join(__dirname, '../.env.production'))
    ? path.join(__dirname, '../.env.production')
    : path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Data from src/lib/trades.ts
const ukTrades = [
    "plumber", "electrician", "locksmith", "gas-engineer", "drain-specialist", "glazier", "breakdown"
];

const usTrades = [
    "plumber", "electrician", "locksmith", "drain-specialist", "glazier", "roofer", "water-restoration", "breakdown"
];

// 1. Load US Data (Complex Structure)
const usCitiesPath = path.join(__dirname, '../src/lib/us_cities.json');
const usData = JSON.parse(fs.readFileSync(usCitiesPath, 'utf8'));

// Flatten US Cities
let usCities = [];
if (usData && usData.states) {
    usData.states.forEach(state => {
        if (state.metros) {
            state.metros.forEach(metro => {
                if (metro.cities) {
                    metro.cities.forEach(city => {
                        if (city.name) usCities.push(city.name);
                        if (city.suburbs) {
                            city.suburbs.forEach(sub => {
                                if (sub.name) usCities.push(sub.name);
                            });
                        }
                    });
                }
            });
        }
    });
}
// Deduplicate
usCities = [...new Set(usCities)];

// 2. Load UK Data (Source from cityPostcodes.ts mostly, but we can't import TS)
// Manually defining major UK cities for sitemap to avoid TS compilation issues in this script
// This list matches the keys in cityPostcodes.ts
const ukCities = [
    "London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Sheffield", "Bradford", "Liverpool", "Edinburgh", "Bristol",
    "Cardiff", "Coventry", "Nottingham", "Leicester", "Sunderland", "Belfast", "Newcastle upon Tyne", "Brighton", "Hull",
    "Plymouth", "Stoke-on-Trent", "Wolverhampton", "Derby", "Swansea", "Southampton", "Salford", "Aberdeen", "Portsmouth",
    "York", "Peterborough", "Dundee", "Oxford", "Cambridge", "Norwich", "Exeter", "Luton", "Milton Keynes", "Northampton",
    "Bournemouth", "Reading", "Blackpool", "Preston", "Huddersfield", "Slough", "Swindon", "Bolton", "Oldham", "Rochdale",
    "Doncaster", "Rotherham", "Stockport", "Wigan", "Burnley", "Blackburn", "Preston", "Worcester", "Gloucester", "Cheltenham"
];

const commonProblems = [
    "burst-pipe", "no-hot-water", "boiler-breakdown", "power-cut-fault", "lockout", "broken-window", "drain-unblocking"
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
        '/contact', '/user/login', '/business/login', '/blog', '/vetting-process'
    ];

    staticPages.forEach(p => {
        xml += `
  <url>
    <loc>${BASE_URL}${p}</loc>
    <changefreq>weekly</changefreq>
    <priority>${p === '' || p === '/us' ? '1.0' : '0.8'}</priority>
  </url>`;
    });

    // 2. Dynamic City Pages (UK)
    ukTrades.forEach(trade => {
        ukCities.forEach(city => {
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

    // 3. Dynamic City Pages (US)
    usTrades.forEach(trade => {
        usCities.forEach(city => {
            const citySlug = city.toLowerCase().replace(/ /g, '-').replace('&', 'and');
            const url = `/us/emergency-${trade}/${citySlug}`;
            xml += `
  <url>
    <loc>${BASE_URL}${url}</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
        });
    });

    // 4. Dynamic Symptom Pages (UK Only for now)
    commonProblems.forEach(problem => {
        ukCities.forEach(city => {
            const citySlug = city.toLowerCase().replace(/ /g, '-').replace('&', 'and');
            const url = `/${problem}/${citySlug}`;
            xml += `
  <url>
    <loc>${BASE_URL}${url}</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
        });
    });

    // 5. Dynamic Business Profiles
    businesses.forEach(biz => {
        const prefix = biz.country_code === 'US' ? '/us' : '';
        xml += `
  <url>
    <loc>${BASE_URL}${prefix}/business/${biz.id}</loc>
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
    console.log(` ✅ Sitemap generated at ${outputPath}`);
    console.log(` 📊 Summary:`);
    console.log(`    - Static: ${staticPages.length}`);
    console.log(`    - UK City Pages: ${ukTrades.length * ukCities.length}`);
    console.log(`    - US City Pages: ${usTrades.length * usCities.length}`);
    console.log(`    - Symptom Pages: ${commonProblems.length * ukCities.length}`);
    console.log(`    - Business Profiles: ${businesses.length}`);
    console.log(`    - Blog Posts: ${posts?.length || 0}`);
    const total = staticPages.length + (ukTrades.length * ukCities.length) + (usTrades.length * usCities.length) + (commonProblems.length * ukCities.length) + businesses.length + (posts?.length || 0);
    console.log(`    - Total URLs: ${total}`);
}

generateSitemap();
