import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data from src/lib/trades.ts (Duplicated here to avoid TS compilation complexity in build script)
const trades = [
    "plumber",
    "electrician",
    "locksmith",
    "gas-engineer",
    "drain-specialist",
    "glazier",
    "breakdown"
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
    "Lichfield", "Lincoln", "London", "Newcastle-upon-Tyne", "Plymouth", "Portsmouth",
    "Ripon", "Salford", "Salisbury", "Southampton", "Southend-on-Sea", "St Albans",
    "Sunderland", "Truro", "Wakefield", "Wells", "Winchester", "Westminster",
    "Warrington", "Wigan", "Middlesbrough", "Blackpool", "Barnsley"
];

const BASE_URL = 'https://emergencytradesmen.net';

function generateSitemap() {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Static Pages
    const staticPages = [
        '',
        '/about',
        '/pricing',
        '/terms',
        '/privacy',
        '/compare'
    ];

    staticPages.forEach(p => {
        xml += `
  <url>
    <loc>${BASE_URL}${p}</loc>
    <changefreq>weekly</changefreq>
    <priority>${p === '' ? '1.0' : '0.8'}</priority>
  </url>`;
    });

    // Dynamic City Pages
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

    xml += `
</urlset>`;

    const outputPath = path.join(__dirname, '../public/sitemap.xml');
    fs.writeFileSync(outputPath, xml);
    console.log(`✅ Sitemap generated at ${outputPath} with ${trades.length * cities.length + staticPages.length} URLs`);
}

generateSitemap();
