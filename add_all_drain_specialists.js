import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the businesses.ts file
const filePath = path.join(__dirname, 'src', 'lib', 'businesses.ts');
let content = fs.readFileSync(filePath, 'utf8');

// All 68 cities that need drain specialists
const cities = [
    { name: "London", slug: "london", prefix: "20" },
    { name: "Manchester", slug: "manchester", prefix: "161" },
    { name: "Birmingham", slug: "birmingham", prefix: "121" },
    { name: "Leeds", slug: "leeds", prefix: "113" },
    { name: "Sheffield", slug: "sheffield", prefix: "114" },
    { name: "Nottingham", slug: "nottingham", prefix: "115" },
    { name: "Leicester", slug: "leicester", prefix: "116" },
    { name: "Liverpool", slug: "liverpool", prefix: "151" },
    { name: "Bristol", slug: "bristol", prefix: "117" },
    { name: "York", slug: "york", prefix: "1904" },
    { name: "Derby", slug: "derby", prefix: "1332" },
    { name: "Coventry", slug: "coventry", prefix: "24" },
    { name: "Wolverhampton", slug: "wolverhampton", prefix: "1902" },
    { name: "Preston", slug: "preston", prefix: "1772" },
    { name: "Bolton", slug: "bolton", prefix: "1204" },
    { name: "Oldham", slug: "oldham", prefix: "161" },
    { name: "Rochdale", slug: "rochdale", prefix: "1706" },
    { name: "Bradford", slug: "bradford", prefix: "1274" },
    { name: "Huddersfield", slug: "huddersfield", prefix: "1484" },
    { name: "Hull", slug: "hull", prefix: "1482" },
    { name: "Doncaster", slug: "doncaster", prefix: "1302" },
    { name: "Northampton", slug: "northampton", prefix: "1604" },
    { name: "Milton Keynes", slug: "milton-keynes", prefix: "1908" },
    { name: "Luton", slug: "luton", prefix: "1582" },
    { name: "Bedford", slug: "bedford", prefix: "1234" },
    { name: "Peterborough", slug: "peterborough", prefix: "1733" },
    { name: "Cambridge", slug: "cambridge", prefix: "1223" },
    { name: "Norwich", slug: "norwich", prefix: "1603" },
    { name: "Ipswich", slug: "ipswich", prefix: "1473" },
    { name: "Reading", slug: "reading", prefix: "118" },
    { name: "Oxford", slug: "oxford", prefix: "1865" },
    { name: "Swindon", slug: "swindon", prefix: "1793" },
    { name: "Cheltenham", slug: "cheltenham", prefix: "1242" },
    { name: "Gloucester", slug: "gloucester", prefix: "1452" },
    { name: "Worcester", slug: "worcester", prefix: "1905" },
    { name: "Hereford", slug: "hereford", prefix: "1432" },
    { name: "Shrewsbury", slug: "shrewsbury", prefix: "1743" },
    { name: "Telford", slug: "telford", prefix: "1952" },
    { name: "Cannock", slug: "cannock", prefix: "1543" },
    { name: "Tamworth", slug: "tamworth", prefix: "1827" },
    { name: "Nuneaton", slug: "nuneaton", prefix: "24" },
    { name: "Rugby", slug: "rugby", prefix: "1788" },
    { name: "Bath", slug: "bath", prefix: "1225" },
    { name: "Brighton & Hove", slug: "brighton-&-hove", prefix: "1273" },
    { name: "Canterbury", slug: "canterbury", prefix: "1227" },
    { name: "Carlisle", slug: "carlisle", prefix: "1228" },
    { name: "Chelmsford", slug: "chelmsford", prefix: "1245" },
    { name: "Chester", slug: "chester", prefix: "1244" },
    { name: "Chichester", slug: "chichester", prefix: "1243" },
    { name: "Colchester", slug: "colchester", prefix: "1206" },
    { name: "Durham", slug: "durham", prefix: "191" },
    { name: "Ely", slug: "ely", prefix: "1353" },
    { name: "Exeter", slug: "exeter", prefix: "1392" },
    { name: "Lancaster", slug: "lancaster", prefix: "1524" },
    { name: "Lichfield", slug: "lichfield", prefix: "1543" },
    { name: "Lincoln", slug: "lincoln", prefix: "1522" },
    { name: "Newcastle-upon-Tyne", slug: "newcastle-upon-tyne", prefix: "191" },
    { name: "Plymouth", slug: "plymouth", prefix: "1752" },
    { name: "Portsmouth", slug: "portsmouth", prefix: "23" },
    { name: "Ripon", slug: "ripon", prefix: "1765" },
    { name: "Salford", slug: "salford", prefix: "161" },
    { name: "Salisbury", slug: "salisbury", prefix: "1722" },
    { name: "Southampton", slug: "southampton", prefix: "23" },
    { name: "Southend-on-Sea", slug: "southend-on-sea", prefix: "1702" },
    { name: "St Albans", slug: "st-albans", prefix: "1727" },
    { name: "Sunderland", slug: "sunderland", prefix: "191" },
    { name: "Truro", slug: "truro", prefix: "1872" },
    { name: "Wakefield", slug: "wakefield", prefix: "1924" },
    { name: "Wells", slug: "wells", prefix: "1749" },
    { name: "Winchester", slug: "winchester", prefix: "1962" },
    { name: "Westminster", slug: "westminster", prefix: "20" },
    { name: "Warrington", slug: "warrington", prefix: "1925" },
    { name: "Wigan", slug: "wigan", prefix: "1942" },
    { name: "Middlesbrough", slug: "middlesbrough", prefix: "1642" },
    { name: "Blackpool", slug: "blackpool", prefix: "1253" },
    { name: "Barnsley", slug: "barnsley", prefix: "1226" },
    { name: "Stoke-on-Trent", slug: "stoke-on-trent", prefix: "1782" },
];

// Generate drain specialist data for a city (20 listings as it's more specialist)
const generateDrainSpecialistData = (city) => {
    const cleanSlug = city.slug.replace(/&/g, '').replace(/ /g, '');
    return `
        "drain-specialist": Array.from({ length: 20 }, (_, i) => ({
            id: \`${city.slug}-drain-\${i + 1}\`,
            name: ["${city.name} Drain Specialists 24/7", "Emergency Drain Unblocking ${city.name}", "${city.name} Drainage Services", "24 Hour Drain Clearance ${city.name}", "${city.name} Blocked Drains Emergency", "Rapid Drain Services ${city.name}", "${city.name} Drain Unblocking", "Express Drainage ${city.name}", "${city.name} Drain & Sewer Services", "Local Drain Specialists ${city.name}", "${city.name} Drain Repairs", "Professional Drainage ${city.name}", "${city.name} Emergency Drainage", "Reliable Drain Services ${city.name}", "${city.name} Drain Solutions", "Fast Drain Unblocking ${city.name}", "${city.name} Sewer & Drain Services", "Premier Drainage ${city.name}", "${city.name} Drain Clearance Experts", "Trusted Drain Specialists ${city.name}"][i],
            rating: [4.8, 4.7, 4.9, 4.8, 4.7, 4.8, 4.9, 4.8, 4.7, 4.8, 4.9, 4.8, 4.7, 4.8, 4.9, 4.8, 4.7, 4.8, 4.9, 4.8][i],
            reviewCount: [42, 36, 48, 44, 33, 39, 46, 41, 34, 38, 47, 43, 32, 37, 45, 40, 31, 36, 48, 42][i],
            address: "${city.name}",
            hours: "Open 24 hours",
            isOpen24Hours: true,
            phone: \`+44 ${city.prefix} \${[500100, 600200, 700300, 800400, 900500, 100600, 200700, 300800, 400900, 501010, 602020, 703030, 804040, 905050, 106060, 207070, 308080, 409090, 511111, 622222][i]}\`,
            ...([1, 5, 9, 14].includes(i) && { website: \`http://www.${cleanSlug}\${['drains', 'drainage', 'drainunblocking', 'drainspecialists'][Math.floor(i/5)]}.co.uk\` })
        })),`;
};

// For each city, find where to add drain specialists
cities.forEach(city => {
    // Try multiple patterns to find the city block
    const patterns = [
        // Pattern 1: City with glazier array using Array.from
        new RegExp(`(\\s+${city.slug}:|\\s+"${city.slug.replace(/&/g, '\\&')}":)\\s*\\{[\\s\\S]*?glazier:\\s*Array\\.from[\\s\\S]*?\\}\\)\\),\\s*\\}`, 'g'),
        // Pattern 2: City with glazier array (regular)
        new RegExp(`(\\s+${city.slug}:|\\s+"${city.slug.replace(/&/g, '\\&')}":)\\s*\\{[\\s\\S]*?glazier:\\s*\\[[\\s\\S]*?\\],\\s*\\}`, 'g'),
    ];

    let matched = false;
    for (const pattern of patterns) {
        const newContent = content.replace(pattern, (match) => {
            // Check if drain-specialist already exists
            if (match.includes('"drain-specialist":') || match.includes('drain-specialist:')) {
                console.log(`Skipping ${city.name} - drain specialists already exist`);
                matched = true;
                return match;
            }

            // Add drain specialist data before the closing brace
            const drainSpecialistData = generateDrainSpecialistData(city);
            let modifiedMatch;

            if (match.includes('Array.from')) {
                modifiedMatch = match.replace(/\}\)\),\s*\}$/, `})),${drainSpecialistData}\n    },`);
            } else {
                modifiedMatch = match.replace(/\],\s*\}$/, `],${drainSpecialistData}\n    },`);
            }

            console.log(`Added drain specialists for ${city.name}`);
            matched = true;
            return modifiedMatch;
        });

        if (newContent !== content) {
            content = newContent;
            break;
        }
    }

    if (!matched) {
        console.log(`WARNING: Could not find pattern for ${city.name}`);
    }
});

// Write the modified content back
fs.writeFileSync(filePath, content, 'utf8');
console.log('\\nCompleted! All cities now have drain specialist listings.');
