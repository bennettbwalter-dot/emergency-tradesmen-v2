import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load env vars
dotenv.config();

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
    console.log('🔄 Fetching businesses from Supabase...');

    // Fetch all verified businesses efficiently
    const { data: businesses, error } = await supabase
        .from('businesses')
        .select('id, updated_at')
        .eq('verified', true); // Only index verified businesses

    if (error) {
        console.error('❌ Error fetching businesses:', error);
        return;
    }

    console.log(`✅ Found ${businesses.length} verified businesses.`);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // 1. Static Pages
    const staticPages = [
        '', '/about', '/pricing', '/terms', '/privacy', '/compare',
        '/contact', '/user/login', '/business/login'
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

    xml += `
</urlset>`;

    const outputPath = path.join(__dirname, '../public/sitemap.xml');
    fs.writeFileSync(outputPath, xml);
    console.log(`✅ Sitemap generated at ${outputPath}`);
    console.log(`📊 Summary:`);
    console.log(`   - Static: ${staticPages.length}`);
    console.log(`   - City Pages: ${trades.length * cities.length}`);
    console.log(`   - Business Profiles: ${businesses.length}`);
    console.log(`   - Total URLs: ${staticPages.length + (trades.length * cities.length) + businesses.length}`);
}

generateSitemap();
