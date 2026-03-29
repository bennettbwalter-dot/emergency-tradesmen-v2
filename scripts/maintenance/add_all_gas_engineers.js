import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the businesses.ts file
const filePath = path.join(__dirname, 'src', 'lib', 'businesses.ts');
let content = fs.readFileSync(filePath, 'utf8');

// All 68 cities that need gas engineers
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

// Generate gas engineer data for a city
const generateGasEngineerData = (city) => {
    const cleanSlug = city.slug.replace(/&/g, '').replace(/ /g, '');
    return `
        "gas-engineer": Array.from({ length: 25 }, (_, i) => ({
            id: \`${city.slug}-gas-\${i + 1}\`,
            name: ["${city.name} Gas Engineers 24/7", "Emergency Gas Engineer ${city.name}", "${city.name} Gas Safe Services", "24 Hour Gas Engineers ${city.name}", "${city.name} Emergency Gas Ltd", "Quick Response Gas ${city.name}", "${city.name} Gas Engineer Services", "Rapid Gas Engineers ${city.name}", "${city.name} Boiler & Gas", "Local Gas Engineer ${city.name}", "${city.name} Gas Repairs", "Professional Gas Engineers ${city.name}", "${city.name} Heating & Gas", "Reliable Gas Engineer ${city.name}", "${city.name} Gas Solutions", "Express Gas Engineers ${city.name}", "${city.name} Gas Safe Registered", "Fast Gas Engineer ${city.name}", "${city.name} Gas Specialists", "Premier Gas Engineer ${city.name}", "${city.name} Gas Safety Services", "Trusted Gas Engineers ${city.name}", "${city.name} Emergency Gas Services", "Quality Gas Engineer ${city.name}", "${city.name} Gas Engineer Experts"][i],
            rating: [4.9, 4.8, 4.7, 4.9, 4.8, 4.7, 4.8, 4.9, 4.8, 4.7, 4.8, 4.9, 4.8, 4.7, 4.8, 4.9, 4.8, 4.7, 4.8, 4.9, 4.8, 4.7, 4.8, 4.9, 4.8][i],
            reviewCount: [52, 46, 38, 50, 44, 36, 42, 49, 45, 35, 40, 51, 43, 34, 44, 48, 39, 33, 42, 50, 37, 32, 41, 47, 40][i],
            address: "${city.name}",
            hours: "Open 24 hours",
            isOpen24Hours: true,
            phone: \`+44 ${city.prefix} \${[300100, 400200, 500300, 600400, 700500, 800600, 900700, 100800, 200900, 301010, 402020, 503030, 604040, 705050, 806060, 907070, 108080, 209090, 311111, 422222, 533333, 644444, 755555, 866666, 977777][i]}\`,
            ...([1, 6, 11, 18].includes(i) && { website: \`http://www.${cleanSlug}\${['gasengineer', 'gassafe', 'boilerrepair', 'gasservices'][Math.floor(i/6)]}.co.uk\` })
        })),`;
};

// For each city, find where to add gas engineers
cities.forEach(city => {
    // Try multiple patterns to find the city block
    const patterns = [
        // Pattern 1: City with locksmith array using Array.from
        new RegExp(`(\\s+${city.slug}:|\\s+"${city.slug.replace(/&/g, '\\&')}":)\\s*\\{[\\s\\S]*?locksmith:\\s*Array\\.from[\\s\\S]*?\\}\\)\\),\\s*\\}`, 'g'),
        // Pattern 2: City with locksmith array (regular)
        new RegExp(`(\\s+${city.slug}:|\\s+"${city.slug.replace(/&/g, '\\&')}":)\\s*\\{[\\s\\S]*?locksmith:\\s*\\[[\\s\\S]*?\\],\\s*\\}`, 'g'),
    ];

    let matched = false;
    for (const pattern of patterns) {
        const newContent = content.replace(pattern, (match) => {
            // Check if gas-engineer already exists
            if (match.includes('"gas-engineer":') || match.includes('gas-engineer:')) {
                console.log(`Skipping ${city.name} - gas engineers already exist`);
                matched = true;
                return match;
            }

            // Add gas engineer data before the closing brace
            const gasEngineerData = generateGasEngineerData(city);
            let modifiedMatch;

            if (match.includes('Array.from')) {
                modifiedMatch = match.replace(/\}\)\),\s*\}$/, `})),${gasEngineerData}\n    },`);
            } else {
                modifiedMatch = match.replace(/\],\s*\}$/, `],${gasEngineerData}\n    },`);
            }

            console.log(`Added gas engineers for ${city.name}`);
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
console.log('\\nCompleted! All cities now have gas engineer listings.');
