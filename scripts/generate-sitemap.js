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
            .select('id, updated_at, country_code') // Fetch country_code to segment by region if needed, though we treat them all in business sitemaps
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

    const sitemaps = []; // Track created sitemaps for the index

    // Helper to write a sitemap file
    const writeSitemap = (filename, urls) => {
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
        urls.forEach(u => {
            xml += `
  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    ${u.changefreq ? `<changefreq>${u.changefreq}</changefreq>` : ''}
    ${u.priority ? `<priority>${u.priority}</priority>` : ''}
  </url>`;
        });
        xml += `
</urlset>`;

        const outputPath = path.join(__dirname, `../public/${filename}`);
        fs.writeFileSync(outputPath, xml);
        console.log(` ✅ Generated ${filename} (${urls.length} URLs)`);
        sitemaps.push(filename);
    };

    // 1. Static Pages
    const staticUrls = [
        '', '/about', '/pricing', '/terms', '/privacy', '/compare',
        '/contact', '/user/login', '/business/login', '/blog', '/vetting-process'
    ].map(p => ({
        loc: `${BASE_URL}${p}`,
        changefreq: 'weekly',
        priority: p === '' || p === '/us' ? '1.0' : '0.8'
    }));
    writeSitemap('sitemap-static.xml', staticUrls);

    // 2. Dynamic City Pages (UK)
    const ukUrls = [];
    ukTrades.forEach(trade => {
        ukCities.forEach(city => {
            const citySlug = city.toLowerCase().replace(/ /g, '-').replace('&', 'and');
            ukUrls.push({
                loc: `${BASE_URL}/emergency-${trade}/${citySlug}`,
                changefreq: 'daily',
                priority: '0.9'
            });
        });
    });
    // UK Symptoms
    commonProblems.forEach(problem => {
        ukCities.forEach(city => {
            const citySlug = city.toLowerCase().replace(/ /g, '-').replace('&', 'and');
            ukUrls.push({
                loc: `${BASE_URL}/${problem}/${citySlug}`,
                changefreq: 'daily',
                priority: '0.9'
            });
        });
    });
    writeSitemap('sitemap-uk.xml', ukUrls);

    // 3. Dynamic City Pages (US)
    const usUrls = [];
    usTrades.forEach(trade => {
        usCities.forEach(city => {
            const citySlug = city.toLowerCase().replace(/ /g, '-').replace('&', 'and');
            usUrls.push({
                loc: `${BASE_URL}/us/emergency-${trade}/${citySlug}`,
                changefreq: 'daily',
                priority: '0.9'
            });
        });
    });
    // Split US sitemaps if too large (approx 40k max per file to be safe)
    const CHUNK_SIZE = 40000;
    for (let i = 0; i < usUrls.length; i += CHUNK_SIZE) {
        const chunk = usUrls.slice(i, i + CHUNK_SIZE);
        writeSitemap(`sitemap-us-${Math.floor(i / CHUNK_SIZE) + 1}.xml`, chunk);
    }

    // 4. Dynamic Business Profiles
    const ukBusinesses = businesses.filter(b => b.country_code === 'GB');
    const usBusinesses = businesses.filter(b => b.country_code === 'US');

    // UK Businesses
    for (let i = 0; i < ukBusinesses.length; i += CHUNK_SIZE) {
        const chunk = ukBusinesses.slice(i, i + CHUNK_SIZE);
        const bizUrls = chunk.map(biz => ({
            loc: `${BASE_URL}/business/${biz.id}`,
            lastmod: biz.updated_at ? biz.updated_at.split('T')[0] : new Date().toISOString().split('T')[0],
            changefreq: 'weekly',
            priority: '0.7'
        }));
        writeSitemap(`sitemap-businesses-uk-${Math.floor(i / CHUNK_SIZE) + 1}.xml`, bizUrls);
    }

    // US Businesses
    for (let i = 0; i < usBusinesses.length; i += CHUNK_SIZE) {
        const chunk = usBusinesses.slice(i, i + CHUNK_SIZE);
        const bizUrls = chunk.map(biz => ({
            loc: `${BASE_URL}/us/business/${biz.id}`,
            lastmod: biz.updated_at ? biz.updated_at.split('T')[0] : new Date().toISOString().split('T')[0],
            changefreq: 'weekly',
            priority: '0.7'
        }));
        writeSitemap(`sitemap-businesses-us-${Math.floor(i / CHUNK_SIZE) + 1}.xml`, bizUrls);
    }

    // 5. Blog Posts
    if (posts && posts.length > 0) {
        const blogUrls = posts.map(post => ({
            loc: `${BASE_URL}/blog/${post.slug}`,
            lastmod: post.updated_at ? post.updated_at.split('T')[0] : new Date().toISOString().split('T')[0],
            changefreq: 'weekly',
            priority: '0.8'
        }));
        writeSitemap('sitemap-blog.xml', blogUrls);
    }

    // 6. Generate Sitemap Index
    let indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    sitemaps.forEach(filename => {
        indexXml += `
  <sitemap>
    <loc>${BASE_URL}/${filename}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>`;
    });

    indexXml += `
</sitemapindex>`;

    const indexPath = path.join(__dirname, '../public/sitemap.xml');
    fs.writeFileSync(indexPath, indexXml);
    console.log(` ✅ Generated Sitemap Index at ${indexPath}`);
    console.log(` 📊 Total Sitemaps: ${sitemaps.length}`);
}

generateSitemap();
