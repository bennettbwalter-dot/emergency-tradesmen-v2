
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function generateSlug(name) {
    if (!name) return crypto.randomUUID();
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') + '-' + Math.floor(Math.random() * 10000);
}

function parseBusinessesTs() {
    const filePath = path.join(__dirname, '../src/lib/businesses.ts');
    const content = fs.readFileSync(filePath, 'utf8');

    const businesses = [];
    const lines = content.split('\n');
    let currentCity = null;
    let currentTrade = null;
    let currentBusiness = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Detect City: "    london: {"
        const cityMatch = line.match(/^\s+([a-z-]+): \{/);
        if (cityMatch) {
            currentCity = cityMatch[1];
            continue;
        }

        // Detect Trade: "        plumber: ["
        const tradeMatch = line.match(/^\s+([a-z-]+): \[/);
        if (tradeMatch) {
            currentTrade = tradeMatch[1];
            continue;
        }

        // Detect Start of Business Object: "            {"
        if (line.trim() === '{') {
            currentBusiness = {};
            continue;
        }

        // Detect End of Business Object
        if (line.trim() === '},' || line.trim() === '}') {
            if (currentBusiness && currentBusiness.name) {
                currentBusiness.trade_slug = currentTrade;
                currentBusiness.city_slug = currentCity;
                businesses.push(currentBusiness);
            }
            currentBusiness = null;
            continue;
        }

        // Parse properties if we are inside a business object
        if (currentBusiness) {
            let match;
            if (match = line.match(/name:\s*"([^"]+)"/)) currentBusiness.name = match[1];
            if (match = line.match(/address:\s*"([^"]+)"/)) currentBusiness.address = match[1];
            if (match = line.match(/phone:\s*"([^"]+)"/)) currentBusiness.phone = match[1];
            if (match = line.match(/email:\s*"([^"]+)"/)) currentBusiness.email = match[1];
            if (match = line.match(/website:\s*"([^"]+)"/)) currentBusiness.website = match[1];
            if (match = line.match(/rating:\s*([0-9.]+)/)) currentBusiness.rating = parseFloat(match[1]);
            if (match = line.match(/reviewCount:\s*(\d+)/)) currentBusiness.review_count = parseInt(match[1]);

            currentBusiness.country_code = 'GB';
            currentBusiness.is_demo = false;
        }
    }

    return businesses;
}

async function migrateData() {
    console.log('Parsing businesses.ts...');
    const businesses = parseBusinessesTs();
    console.log(`Found ${businesses.length} businesses in static file.`);

    let added = 0;
    let skipped = 0;
    let errors = 0;

    for (const bus of businesses) {
        const dbRecord = {
            name: bus.name,
            address: bus.address || `${bus.city_slug}, UK`,
            city: bus.city_slug,
            trade: bus.trade_slug,
            phone: bus.phone,
            email: bus.email,
            website: bus.website,
            rating: bus.rating,
            review_count: bus.review_count,
            country_code: 'GB',
            id: crypto.randomUUID(),
            slug: generateSlug(bus.name)
        };

        let query = supabase.from('businesses').select('id');

        if (bus.phone) {
            query = query.eq('phone', bus.phone);
        } else {
            query = query.eq('name', bus.name).eq('city', bus.city_slug);
        }

        const { data: existing } = await query;

        if (existing && existing.length > 0) {
            skipped++;
        } else {
            const { error } = await supabase.from('businesses').insert(dbRecord);
            if (error) {
                console.error(`Failed to insert ${bus.name}:`, error.message);
                errors++;
            } else {
                added++;
            }
        }

        if (added % 50 === 0 && added > 0) console.log(`Processed ${added + skipped} / ${businesses.length}...`);
    }

    console.log('Migration Complete.');
    console.log(`Brought in (New): ${added}`);
    console.log(`Skipped (Already in DB): ${skipped}`);
    console.log(`Errors: ${errors}`);
}

migrateData();
