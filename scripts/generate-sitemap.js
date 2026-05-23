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
// 2. Load UK Data
const ukCities = [
    "London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Sheffield", "Bradford", "Liverpool", "Edinburgh", "Bristol",
    "Cardiff", "Coventry", "Nottingham", "Leicester", "Sunderland", "Belfast", "Newcastle upon Tyne", "Brighton", "Hull",
    "Plymouth", "Stoke-on-Trent", "Wolverhampton", "Derby", "Swansea", "Southampton", "Salford", "Aberdeen", "Portsmouth",
    "York", "Peterborough", "Dundee", "Oxford", "Cambridge", "Norwich", "Exeter", "Luton", "Milton Keynes", "Northampton",
    "Bournemouth", "Reading", "Blackpool", "Preston", "Huddersfield", "Slough", "Swindon", "Bolton", "Oldham", "Rochdale",
    "Doncaster", "Rotherham", "Stockport", "Wigan", "Burnley", "Blackburn", "Worcester", "Gloucester", "Cheltenham",
    "Bedford", "Ipswich", "Hereford", "Shrewsbury", "Telford", "Canterbury", "Carlisle", "Chelmsford", "Chester", "Colchester",
    "Durham", "Lancaster", "Lincoln", "Southend-on-Sea", "St Albans", "Truro", "Wakefield", "Winchester", "Westminster",
    "Warrington", "Middlesbrough", "Barnsley", "Newport", "Poole", "Basildon", "Maidstone", "Crawley", "Worthing",
    "Sutton Coldfield", "Dudley", "Walsall", "Watford", "High Wycombe", "Harlow", "Stevenage", "Redditch", "Chesterfield",
    "Mansfield", "Beeston", "Loughborough", "Burton upon Trent", "Crewe", "Macclesfield", "Scunthorpe", "Grimsby", "Harrogate",
    "Halifax", "Batley", "Keighley", "South Shields", "Gateshead", "Darlington", "Hartlepool", "Stockton-on-Tees", "Hemel Hempstead",
    "Gillingham", "Eastbourne", "Rayleigh", "Lowestoft", "Woking", "Maidenhead", "Basingstoke", "Fareham", "Gosport", "Ewell",
    "Crosby", "Paignton", "Torquay", "Bebington", "Halesowen", "Kidderminster", "Rugby", "Leamington Spa", "Kettering",
    "Wellingborough", "Dunstable", "Aylesbury", "Cheshunt", "Welwyn Garden City", "Margate", "Royal Tunbridge Wells", "Ashford",
    "Braintree", "Canvey Island", "Clacton-on-Sea", "Sittingbourne", "Gravesend", "Dartford", "Weymouth", "Falmouth", "St Austell",
    "Scarborough", "Bridlington", "Castleford", "Pontefract", "Sale", "Widnes", "Runcorn", "Ellesmere Port", "Birkenhead",
    "Wallasey", "Barrow-in-Furness", "Workington", "Whitehaven", "Chorley", "Accrington", "Lytham St Annes", "Stafford",
    "Bromsgrove", "Grantham", "Ely", "Lichfield", "Ripon", "Salisbury", "Wells", "Solihull", "Guildford", "Staines", "Chatham",
    "Hastings", "Nuneaton", "Tamworth", "Cannock", "Bath"
];

// Keep in sync with src/lib/trades.ts → commonProblems. Problems are region-scoped.
const ukProblems = [
    "burst-pipe", "no-hot-water", "boiler-breakdown", "power-cut-fault", "lockout", "broken-window", "drain-unblocking",
    "gas-leak", "toilet-overflow", "frozen-pipes"
];
const usProblems = [
    "burst-pipe", "no-hot-water", "power-cut-fault", "lockout", "broken-window", "drain-unblocking", "water-damage",
    "toilet-overflow", "frozen-pipes", "ac-not-cooling", "furnace-breakdown", "water-heater-failure"
];

const BASE_URL_GB = 'https://emergencytradesmen.net';
const BASE_URL_US = 'https://emergencycontractors.net';

async function generateSitemap() {
    console.log('🔄 Fetching data from Supabase...');

    // 1. Fetch all verified businesses
    let allBusinesses = [];
    let from = 0;
    const step = 1000;
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase
            .from('businesses')
            .select('id, updated_at, country_code, name, logo_url, trade, city')
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
        .select('slug, updated_at, title, cover_image')
        .eq('published', true);

    if (postError) {
        console.error('❌ Error fetching posts:', postError);
        return;
    }

    console.log(`✅ Found ${businesses.length} verified businesses.`);
    console.log(`✅ Found ${posts?.length || 0} published blog posts.`);

    // Build a set of active trade-city-country combinations
    const activeCombinations = new Set();
    businesses.forEach(b => {
        if (b.trade && b.city && b.country_code) {
            const tradeSlug = b.trade.toLowerCase().replace('emergency-', '');
            const citySlug = b.city.toLowerCase().replace(/ /g, '-').replace('&', 'and');
            activeCombinations.add(`${tradeSlug}|${citySlug}|${b.country_code.toUpperCase()}`);
        }
    });

    const ukSitemaps = [];
    const usSitemaps = [];

    // Helper to write a sitemap file
    const writeSitemap = (filename, urls, category = 'uk') => {
        try {
            let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;
            urls.forEach(u => {
                xml += `
  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    ${u.changefreq ? `<changefreq>${u.changefreq}</changefreq>` : ''}
    ${u.priority ? `<priority>${u.priority}</priority>` : ''}${u.images ? u.images.map(img => `
    <image:image>
      <image:loc>${img.loc}</image:loc>${img.title ? `
      <image:title>${img.title}</image:title>` : ''}
    </image:image>`).join('') : ''}
  </url>`;
            });
            xml += `
</urlset>`;

            const outputPath = path.join(__dirname, `../public/${filename}`);
            fs.writeFileSync(outputPath, xml, { flag: 'w' });
            console.log(` ✅ Generated ${filename} (${urls.length} URLs)`);
            
            if (category === 'uk') ukSitemaps.push(filename);
            else usSitemaps.push(filename);
        } catch (err) {
            console.error(` ❌ Failed to generate ${filename}:`, err);
        }
    };

    // 1. Static Pages
    const staticPaths = [
        '', '/about', '/pricing', '/terms', '/privacy', '/compare',
        '/contact', '/blog', '/vetting-process', '/locations'
    ];

    const staticUrlsGB = staticPaths.map(p => ({
        loc: `${BASE_URL_GB}${p}`,
        changefreq: 'weekly',
        priority: p === '' ? '1.0' : (p === '/about' ? '0.9' : '0.8')
    }));
    writeSitemap('sitemap-static-uk.xml', staticUrlsGB, 'uk');

    const staticUrlsUS = staticPaths.map(p => ({
        loc: `${BASE_URL_US}${p}`,
        changefreq: 'weekly',
        priority: p === '' ? '1.0' : (p === '/about' ? '0.9' : '0.8')
    }));
    writeSitemap('sitemap-static-us.xml', staticUrlsUS, 'us');

    // 2. Dynamic City Pages (UK)
    const ukUrls = [];
    ukTrades.forEach(trade => {
        ukCities.forEach(city => {
            const citySlug = city.toLowerCase().replace(/ /g, '-').replace('&', 'and');
            if (activeCombinations.has(`${trade}|${citySlug}|GB`)) {
                ukUrls.push({
                    loc: `${BASE_URL_GB}/emergency-${trade}/${citySlug}`,
                    changefreq: 'daily',
                    priority: '0.9'
                });
            }
        });
    });
    ukProblems.forEach(problem => {
        ukCities.forEach(city => {
            const citySlug = city.toLowerCase().replace(/ /g, '-').replace('&', 'and');
            ukUrls.push({
                loc: `${BASE_URL_GB}/${problem}/${citySlug}`,
                changefreq: 'daily',
                priority: '0.9'
            });
        });
    });
    writeSitemap('sitemap-uk.xml', ukUrls, 'uk');

    // 3. Dynamic City Pages (US)
    const usUrls = [];
    usTrades.forEach(trade => {
        usCities.forEach(city => {
            const citySlug = city.toLowerCase().replace(/ /g, '-').replace('&', 'and');
            if (activeCombinations.has(`${trade}|${citySlug}|US`)) {
                usUrls.push({
                    loc: `${BASE_URL_US}/emergency-${trade}/${citySlug}`,
                    changefreq: 'daily',
                    priority: '0.9'
                });
            }
        });
    });
    usProblems.forEach(problem => {
        usCities.forEach(city => {
            const citySlug = city.toLowerCase().replace(/ /g, '-').replace('&', 'and');
            usUrls.push({
                loc: `${BASE_URL_US}/${problem}/${citySlug}`,
                changefreq: 'daily',
                priority: '0.9'
            });
        });
    });
    const CHUNK_SIZE = 40000;
    for (let i = 0; i < usUrls.length; i += CHUNK_SIZE) {
        const chunk = usUrls.slice(i, i + CHUNK_SIZE);
        writeSitemap(`sitemap-us-${Math.floor(i / CHUNK_SIZE) + 1}.xml`, chunk, 'us');
    }

    // 4. Dynamic Business Profiles
    const ukBusinesses = businesses.filter(b => b.country_code === 'GB');
    const usBusinesses = businesses.filter(b => b.country_code === 'US');

    // UK Businesses
    for (let i = 0; i < ukBusinesses.length; i += CHUNK_SIZE) {
        const chunk = ukBusinesses.slice(i, i + CHUNK_SIZE);
        const bizUrls = chunk.map(biz => ({
            loc: `${BASE_URL_GB}/business/${biz.id}`,
            lastmod: biz.updated_at ? biz.updated_at.split('T')[0] : new Date().toISOString().split('T')[0],
            changefreq: 'weekly',
            priority: '0.7',
            images: biz.logo_url ? [{
                loc: biz.logo_url.startsWith('http') ? biz.logo_url : `${BASE_URL_GB}${biz.logo_url}`,
                title: biz.name
            }] : []
        }));
        writeSitemap(`sitemap-businesses-uk-${Math.floor(i / CHUNK_SIZE) + 1}.xml`, bizUrls, 'uk');
    }

    // US Businesses
    for (let i = 0; i < usBusinesses.length; i += CHUNK_SIZE) {
        const chunk = usBusinesses.slice(i, i + CHUNK_SIZE);
        const bizUrls = chunk.map(biz => ({
            loc: `${BASE_URL_US}/business/${biz.id}`,
            lastmod: biz.updated_at ? biz.updated_at.split('T')[0] : new Date().toISOString().split('T')[0],
            changefreq: 'weekly',
            priority: '0.7',
            images: biz.logo_url ? [{
                loc: biz.logo_url.startsWith('http') ? biz.logo_url : `${BASE_URL_US}${biz.logo_url}`,
                title: biz.name
            }] : []
        }));
        writeSitemap(`sitemap-businesses-us-${Math.floor(i / CHUNK_SIZE) + 1}.xml`, bizUrls, 'us');
    }

    // 5. Blog Posts
    if (posts && posts.length > 0) {
        const blogUrlsUK = [];
        const blogUrlsUS = [];

        posts.forEach(post => {
            const isUS = post.slug.endsWith('-us');
            const baseUrl = isUS ? BASE_URL_US : BASE_URL_GB;
            const item = {
                loc: `${baseUrl}/blog/${post.slug}`,
                lastmod: post.updated_at ? post.updated_at.split('T')[0] : new Date().toISOString().split('T')[0],
                changefreq: 'weekly',
                priority: '0.8',
                images: post.cover_image ? [{
                    loc: post.cover_image.startsWith('http') ? post.cover_image : `${baseUrl}${post.cover_image}`,
                    title: post.title
                }] : []
            };
            if (isUS) blogUrlsUS.push(item);
            else blogUrlsUK.push(item);
        });

        if (blogUrlsUK.length > 0) writeSitemap('sitemap-blog-uk.xml', blogUrlsUK, 'uk');
        if (blogUrlsUS.length > 0) writeSitemap('sitemap-blog-us.xml', blogUrlsUS, 'us');
    }

    // 6. Generate Index Files
    const generateIndex = (filename, sitemapList, baseUrl) => {
        let indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
        sitemapList.forEach(f => {
            indexXml += `
  <sitemap>
    <loc>${baseUrl}/${f}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>`;
        });
        indexXml += `
</sitemapindex>`;
        fs.writeFileSync(path.join(__dirname, `../public/${filename}`), indexXml);
        console.log(` ✅ Generated Sitemap Index at ${filename}`);
    };

    generateIndex('sitemap.xml', ukSitemaps, BASE_URL_GB);
    generateIndex('sitemap-us.xml', usSitemaps, BASE_URL_US);
}

generateSitemap();
