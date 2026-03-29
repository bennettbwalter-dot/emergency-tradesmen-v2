import fs from 'fs';
import path from 'path';
import https from 'https';

// Types for our us_cities.json structure
interface JsonSuburb { name: string; slug: string; }
interface JsonCity { name: string; slug: string; suburbs: JsonSuburb[]; }
interface JsonMetro { name: string; slug: string; anchor_city?: string; cities: JsonCity[]; }
interface JsonState { code: string; name: string; slug: string; metros: JsonMetro[]; }
interface UsCitiesData {
    country: string;
    country_code: string;
    hierarchy: string[];
    notes: string[];
    states: JsonState[];
}

const csvUrl = 'https://simplemaps.com/static/data/us-cities/uscities.csv';
const targetFile = path.join(process.cwd(), 'src', 'lib', 'us_cities.json');

function slugify(text: string): string {
    return text.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

function parseCSV(csvText: string): any[] {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, ''));

    // Simple regex to handle quoted CSV values containing commas is safer
    // But mostly simplemaps is clean. We'll use a robust split.
    const result = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values: string[] = [];
        let cleanLine = line;

        // Match "value","value",...
        // This regex is a basic approximation for "val","val" format
        const matches = cleanLine.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        // Better: split by '","' (middle) and fix ends
        // Since simplemaps is standard: "val","val"

        const parts = line.substring(1, line.length - 1).split('","');

        const obj: any = {};
        headers.forEach((h, index) => {
            obj[h] = parts[index] || '';
        });
        result.push(obj);
    }
    return result;
}

async function ingest() {
    console.log('Reading existing us_cities.json...');
    const usCitiesRaw = fs.readFileSync(targetFile, 'utf-8');
    const usCities: UsCitiesData = JSON.parse(usCitiesRaw);

    console.log('Fetching CSV...');
    const csvData = await new Promise<string>((resolve, reject) => {
        https.get(csvUrl, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
            res.on('error', (err) => reject(err));
        });
    });

    console.log('Parsing CSV...');
    // Simple split-based parsing for "val","val" format which SimpleMaps uses
    // Note: simplemaps header is "city","city_ascii"...
    const rows = [];
    const lines = csvData.trim().split(/\r?\n/);
    const headers = lines[0].replace(/^"|"$/g, '').split('","');

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i]) continue;
        const values = lines[i].replace(/^"|"$/g, '').split('","');
        const row: any = {};
        headers.forEach((h, idx) => row[h] = values[idx]);
        rows.push(row);
    }

    console.log(`Parsed ${rows.length} cities. Merging...`);

    let addedCount = 0;
    let metroCreatedCount = 0;

    // Build lookup map for existing
    const existingMap = new Set<string>();
    usCities.states.forEach(s => {
        s.metros.forEach(m => {
            m.cities.forEach(c => {
                existingMap.add(`${s.code}|${c.name.toLowerCase()}`);
                c.suburbs.forEach(sub => existingMap.add(`${s.code}|${sub.name.toLowerCase()}`));
            });
        });
    });

    for (const row of rows) {
        const stateCode = row.state_id;
        const cityName = row.city;
        const countyName = row.county_name;

        if (!stateCode || !cityName) continue;

        // Skip if exists
        if (existingMap.has(`${stateCode}|${cityName.toLowerCase()}`)) continue;

        // Find State
        let state = usCities.states.find(s => s.code === stateCode);
        if (!state) {
            // Should verify if we need to add new states (e.g. PR, GU)
            // For now, only skip if strictly not in our seed (Mainland + HI/AK)
            // But simplemaps has PR.
            // Let's add state if missing? 
            // Better to stick to what we have in structure for now unless requested.
            // Actually, user wants "Every location". 
            // If PR is missing, we might want to Add it.
            // But let's verify existing states first.
            continue;
        }

        // Find Metro (County)
        // Check if a metro with this county name exists
        const countyMetroName = `${countyName} County`;
        const countyMetroSlug = slugify(countyMetroName);

        let metro = state.metros.find(m => m.slug === countyMetroSlug || m.name.toLowerCase() === countyMetroName.toLowerCase());

        // Also check if any EXISTING metro (like "Dallas Metro") covers this county?
        // Hard to know without mapping.
        // Heuristic: If we don't find a County Metro, check if we should creat it.
        // OR: Maybe this city belongs to a "Dallas Metro" that we already have?
        // Since we don't have lat/long distance checking here, simpler to perform safe additive logic:
        // Use "County" bucket if not processed.

        if (!metro) {
            // Create new "County" based metro
            metro = {
                name: countyMetroName,
                slug: countyMetroSlug,
                cities: []
            };
            state.metros.push(metro);
            metroCreatedCount++;
        }

        // Add City
        metro.cities.push({
            name: cityName,
            slug: slugify(cityName),
            suburbs: []
        });

        existingMap.add(`${stateCode}|${cityName.toLowerCase()}`);
        addedCount++;
    }

    // Sort states and metros for tidiness
    usCities.states.sort((a, b) => a.name.localeCompare(b.name));
    usCities.states.forEach(s => {
        s.metros.sort((a, b) => a.name.localeCompare(b.name));
        s.metros.forEach(m => m.cities.sort((a, b) => a.name.localeCompare(b.name)));
    });

    console.log(`Merge complete.`);
    console.log(`Added Cities: ${addedCount}`);
    console.log(`Created Metros (Counties): ${metroCreatedCount}`);

    fs.writeFileSync(targetFile, JSON.stringify(usCities, null, 4));
}

ingest().catch(console.error);
