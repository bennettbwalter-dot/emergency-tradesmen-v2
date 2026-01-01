import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the businesses.ts file
const filePath = path.join(__dirname, 'src', 'lib', 'businesses.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Cities that still need locksmiths (those with 0 from the count)
const cities = [
    { name: "Bedford", slug: "bedford", prefix: "1234" },
    { name: "Birmingham", slug: "birmingham", prefix: "121" },
    { name: "Bolton", slug: "bolton", prefix: "1204" },
    { name: "Bradford", slug: "bradford", prefix: "1274" },
    { name: "Bristol", slug: "bristol", prefix: "117" },
    { name: "Cambridge", slug: "cambridge", prefix: "1223" },
    { name: "Cheltenham", slug: "cheltenham", prefix: "1242" },
    { name: "Coventry", slug: "coventry", prefix: "24" },
    { name: "Derby", slug: "derby", prefix: "1332" },
    { name: "Doncaster", slug: "doncaster", prefix: "1302" },
    { name: "Gloucester", slug: "gloucester", prefix: "1452" },
    { name: "Hereford", slug: "hereford", prefix: "1432" },
    { name: "Huddersfield", slug: "huddersfield", prefix: "1484" },
    { name: "Hull", slug: "hull", prefix: "1482" },
    { name: "Ipswich", slug: "ipswich", prefix: "1473" },
    { name: "Leeds", slug: "leeds", prefix: "113" },
    { name: "Leicester", slug: "leicester", prefix: "116" },
    { name: "Liverpool", slug: "liverpool", prefix: "151" },
    { name: "London", slug: "london", prefix: "20" },
    { name: "Luton", slug: "luton", prefix: "1582" },
    { name: "Manchester", slug: "manchester", prefix: "161" },
    { name: "Milton Keynes", slug: "milton-keynes", prefix: "1908" },
    { name: "Newcastle", slug: "newcastle", prefix: "191" },
    { name: "Northampton", slug: "northampton", prefix: "1604" },
    { name: "Norwich", slug: "norwich", prefix: "1603" },
    { name: "Nottingham", slug: "nottingham", prefix: "115" },
    { name: "Oldham", slug: "oldham", prefix: "161" },
    { name: "Oxford", slug: "oxford", prefix: "1865" },
    { name: "Peterborough", slug: "peterborough", prefix: "1733" },
    { name: "Preston", slug: "preston", prefix: "1772" },
    { name: "Reading", slug: "reading", prefix: "118" },
    { name: "Rochdale", slug: "rochdale", prefix: "1706" },
    { name: "Sheffield", slug: "sheffield", prefix: "114" },
    { name: "Shrewsbury", slug: "shrewsbury", prefix: "1743" },
    { name: "Stoke-on-Trent", slug: "stoke-on-trent", prefix: "1782" },
    { name: "Swindon", slug: "swindon", prefix: "1793" },
    { name: "Telford", slug: "telford", prefix: "1952" },
    { name: "Wolverhampton", slug: "wolverhampton", prefix: "1902" },
    { name: "Worcester", slug: "worcester", prefix: "1905" },
    { name: "York", slug: "york", prefix: "1904" },
];

// Generate locksmith data for a city
const generateLocksmithData = (city) => {
    const cleanSlug = city.slug.replace(/&/g, '').replace(/ /g, '');
    return `
        locksmith: Array.from({ length: 25 }, (_, i) => ({
            id: \`${city.slug}-lock-\${i + 1}\`,
            name: ["${city.name} Locksmiths 24/7", "Emergency Locksmith ${city.name}", "${city.name} Lock & Key Services", "24 Hour Locksmiths ${city.name}", "${city.name} Emergency Locksmiths Ltd", "Quick Response Locksmith ${city.name}", "${city.name} Locksmith Services", "Rapid Locksmiths ${city.name}", "${city.name} Security & Locks", "Local Locksmith ${city.name}", "${city.name} Lock Repairs", "Professional Locksmiths ${city.name}", "${city.name} Key Cutting & Locks", "Reliable Locksmith ${city.name}", "${city.name} Locksmith Solutions", "Express Locksmiths ${city.name}", "${city.name} Auto Locksmith", "Fast Locksmith ${city.name}", "${city.name} Master Locksmiths", "Premier Locksmith ${city.name}", "${city.name} Lock Specialists", "Trusted Locksmiths ${city.name}", "${city.name} Emergency Lock Services", "Quality Locksmith ${city.name}", "${city.name} Locksmith Experts"][i],
            rating: [4.9, 4.8, 4.7, 4.9, 4.8, 4.7, 4.8, 4.9, 4.8, 4.7, 4.8, 4.9, 4.8, 4.7, 4.8, 4.9, 4.8, 4.7, 4.8, 4.9, 4.8, 4.7, 4.8, 4.9, 4.8][i],
            reviewCount: [45, 38, 32, 42, 36, 29, 35, 41, 37, 28, 33, 44, 34, 27, 36, 40, 31, 26, 35, 43, 30, 25, 34, 39, 33][i],
            address: "${city.name}",
            hours: "Open 24 hours",
            isOpen24Hours: true,
            phone: \`+44 ${city.prefix} \${[200100, 300200, 400300, 500400, 600500, 700600, 800700, 900800, 100900, 201010, 302020, 403030, 504040, 605050, 706060, 807070, 908080, 109090, 211111, 322222, 433333, 544444, 655555, 766666, 877777][i]}\`,
            ...([1, 6, 11, 18].includes(i) && { website: \`http://www.${cleanSlug}\${['locksmiths', 'locks', 'locksmith247', 'keycutting'][Math.floor(i/6)]}.co.uk\` })
        })),`;
};

// For each city, find where to add locksmiths
cities.forEach(city => {
    // Try multiple patterns to find the city block
    const patterns = [
        // Pattern 1: City with plumber array using Array.from
        new RegExp(`(\\s+${city.slug}:|\\s+"${city.slug.replace(/&/g, '\\&')}":)\\s*\\{[\\s\\S]*?plumber:\\s*Array\\.from[\\s\\S]*?\\}\\)\\),\\s*\\}`, 'g'),
        // Pattern 2: City with plumber array (regular)
        new RegExp(`(\\s+${city.slug}:|\\s+"${city.slug.replace(/&/g, '\\&')}":)\\s*\\{[\\s\\S]*?plumber:\\s*\\[[\\s\\S]*?\\],\\s*\\}`, 'g'),
    ];

    let matched = false;
    for (const pattern of patterns) {
        const newContent = content.replace(pattern, (match) => {
            // Check if locksmith already exists
            if (match.includes('locksmith:')) {
                console.log(`Skipping ${city.name} - locksmiths already exist`);
                matched = true;
                return match;
            }

            // Add locksmith data before the closing brace
            const locksmithData = generateLocksmithData(city);
            let modifiedMatch;

            if (match.includes('Array.from')) {
                modifiedMatch = match.replace(/\}\)\),\s*\}$/, `})),${locksmithData}\n    },`);
            } else {
                modifiedMatch = match.replace(/\],\s*\}$/, `],${locksmithData}\n    },`);
            }

            console.log(`Added locksmiths for ${city.name}`);
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
console.log('\\nCompleted! Added locksmiths to remaining cities.');
