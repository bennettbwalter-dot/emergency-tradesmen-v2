import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function crossReference() {
    console.log("Analyzing local JSON data files...");

    const files = fs.readdirSync(__dirname);
    const jsonFiles = files.filter(f => f.endsWith('_real.json') || f.endsWith('.json') && !f.includes('package'));

    let jsonCounts = {
        UK: 0,
        US: 0
    };

    // Helper to identify country based on common city names or state codes in filenames
    const identifyCountry = (filename) => {
        // Common UK cities from audit_report.txt
        const ukCities = ['london', 'manchester', 'birmingham', 'leeds', 'glasgow', 'derby', 'luton', 'nottingham', 'sheffield', 'leicester', 'coventry', 'hull', 'chester', 'huddersfield', 'wolverhampton', 'milton-keynes', 'bradford', 'cambridge', 'york', 'norwich', 'belfast'];
        const lowerFile = filename.toLowerCase();

        if (ukCities.some(city => lowerFile.includes(city))) return 'UK';
        // US files often have state codes like _tx.json, _ca.json, or US city names
        if (lowerFile.match(/_[a-z]{2}_real\.json/) || lowerFile.match(/_[a-z]{2}\.json/)) return 'US';
        // Defaulting to US if it's not a known UK city (based on current project focus)
        return 'US';
    };

    for (const file of jsonFiles) {
        try {
            const content = JSON.parse(fs.readFileSync(path.join(__dirname, file), 'utf-8'));
            const count = Array.isArray(content) ? content.length : (Object.keys(content).length || 0);
            const country = identifyCountry(file);
            jsonCounts[country] += count;
        } catch (e) {
            // Skip invalid JSON
        }
    }

    console.log("\nFetching Supabase counts...");
    const { data: dbData, error } = await supabase
        .from('businesses')
        .select('country_code, verified');

    if (error) {
        console.error("Error fetching Supabase data:", error);
        return;
    }

    const dbCounts = {
        UK: 0,
        US: 0
    };

    dbData.forEach(item => {
        const code = (item.country_code || 'GB').toUpperCase();
        if (item.verified === true) {
            if (code === 'GB') dbCounts.UK++;
            else if (code === 'US') dbCounts.US++;
        }
    });

    console.log("\n================ CROSS-REFERENCE REPORT ================");
    console.log(`Region | JSON Files (Source) | Supabase (Imported) | Gap`);
    console.log(`-------|--------------------|---------------------|-----`);
    console.log(`UK     | ${jsonCounts.UK.toString().padEnd(18)} | ${dbCounts.UK.toString().padEnd(19)} | ${jsonCounts.UK - dbCounts.UK}`);
    console.log(`US     | ${jsonCounts.US.toString().padEnd(18)} | ${dbCounts.US.toString().padEnd(19)} | ${jsonCounts.US - dbCounts.US}`);
    console.log("========================================================");
    console.log("\nNote: JSON detection uses simple heuristic for region.");
}

crossReference();
