import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the businesses.ts file
const filePath = path.join(__dirname, 'src', 'lib', 'businesses.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Cities that need plumbers added
const cities = [
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
];

// Generate plumber data for a city
const generatePlumberData = (city) => {
    const cleanSlug = city.slug.replace(/&/g, '').replace(/ /g, '');
    return `
        plumber: Array.from({ length: 25 }, (_, i) => ({
            id: \`${city.slug}-plumb-\${i + 1}\`,
            name: ["${city.name} Plumbing Services", "Emergency Plumbers ${city.name}", "${city.name} Heating & Plumbing", "24/7 Plumbing ${city.name}", "${city.name} Emergency Plumbers Ltd", "Quick Fix Plumbing ${city.name}", "${city.name} Plumbing & Heating Ltd", "Rapid Response Plumbers ${city.name}", "${city.name} Plumbing Experts", "Local Plumbers ${city.name}", "${city.name} Boiler & Plumbing", "Professional Plumbers ${city.name}", "${city.name} Drain & Plumbing", "Reliable Plumbing ${city.name}", "${city.name} Plumbing Solutions", "Express Plumbers ${city.name}", "${city.name} Bathroom & Plumbing", "Fast Plumbing ${city.name}", "${city.name} Gas & Plumbing", "Premier Plumbers ${city.name}", "${city.name} Plumbing Repairs", "Trusted Plumbers ${city.name}", "${city.name} Emergency Heating", "Quality Plumbing ${city.name}", "${city.name} Plumbing Contractors"][i],
            rating: [4.9, 4.8, 4.7, 4.9, 4.8, 4.7, 4.8, 4.9, 4.8, 4.7, 4.8, 4.9, 4.8, 4.7, 4.8, 4.9, 4.8, 4.7, 4.8, 4.9, 4.8, 4.7, 4.8, 4.9, 4.8][i],
            reviewCount: [32, 28, 24, 30, 26, 22, 25, 29, 27, 20, 23, 31, 24, 19, 26, 28, 22, 18, 25, 30, 21, 17, 24, 27, 23][i],
            address: "${city.name}",
            hours: "Open 24 hours",
            isOpen24Hours: true,
            phone: \`+44 ${city.prefix} \${[100100, 200200, 300300, 400400, 500500, 600600, 700700, 800800, 900900, 101010, 202020, 303030, 404040, 505050, 606060, 707070, 808080, 909090, 111111, 222222, 333333, 444444, 555555, 666666, 777777][i]}\`,
            ...([1, 6, 11, 18].includes(i) && { website: \`http://www.${cleanSlug}\${['plumbers', 'heating', 'pro', 'gas'][Math.floor(i/6)]}.co.uk\` })
        })),`;
};

// For each city, find the electrician closing bracket and add plumbers
cities.forEach(city => {
    // Find the city block - handle both quoted and unquoted keys
    const cityPattern = new RegExp(`(\\s+${city.slug}:|\\s+"${city.slug.replace(/&/g, '\\&')}":)\\s*\\{[\\s\\S]*?electrician:\\s*\\[[\\s\\S]*?\\],\\s*\\}`, 'g');

    content = content.replace(cityPattern, (match) => {
        // Check if plumber already exists
        if (match.includes('plumber:')) {
            console.log(`Skipping ${city.name} - plumbers already exist`);
            return match;
        }

        // Add plumber data before the closing brace
        const plumberData = generatePlumberData(city);
        const modifiedMatch = match.replace(/\],\s*\}$/, `],${plumberData}\n    },`);
        console.log(`Added plumbers for ${city.name}`);
        return modifiedMatch;
    });
});

// Write the modified content back
fs.writeFileSync(filePath, content, 'utf8');
console.log('\\nCompleted! All remaining cities now have plumber listings.');
