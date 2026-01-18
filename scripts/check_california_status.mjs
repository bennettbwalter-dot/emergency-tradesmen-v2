import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const CALIFORNIA_CITIES = ['Los Angeles', 'San Diego', 'San Francisco', 'Sacramento'];

async function checkStatus() {
    console.log("🌴 CALIFORNIA EXPANSION STATUS CHECK\n");
    console.log("=".repeat(70));

    // Check JSON files
    console.log("\n📁 JSON DATA FILES:");
    console.log("-".repeat(70));

    for (const city of CALIFORNIA_CITIES) {
        const filename = `${city.toLowerCase().replace(' ', '_')}_businesses.json`;
        const filepath = path.join(__dirname, filename);

        try {
            const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
            const withPhone = data.filter(b => b.phone && b.phone.trim().length > 5);
            console.log(`${city.padEnd(20)} | ${data.length} total | ${withPhone.length} with phones`);
        } catch (e) {
            console.log(`${city.padEnd(20)} | ❌ NOT FOUND`);
        }
    }

    // Check database
    console.log("\n\n💾 DATABASE RECORDS:");
    console.log("-".repeat(70));

    for (const city of CALIFORNIA_CITIES) {
        const { count, error } = await supabase
            .from('businesses')
            .select('*', { count: 'exact', head: true })
            .eq('city', city)
            .eq('country_code', 'US');

        if (error) {
            console.log(`${city.padEnd(20)} | ❌ ERROR: ${error.message}`);
        } else {
            console.log(`${city.padEnd(20)} | ${count || 0} imported`);
        }
    }

    // Check recruitment CSVs
    console.log("\n\n📊 RECRUITMENT CSV FILES:");
    console.log("-".repeat(70));

    const recruitmentDir = path.join(__dirname, '../recruitment_lists');

    for (const city of CALIFORNIA_CITIES) {
        const filename = `top_contractors_${city.toLowerCase().replace(' ', '_')}.csv`;
        const filepath = path.join(recruitmentDir, filename);

        if (fs.existsSync(filepath)) {
            const content = fs.readFileSync(filepath, 'utf-8');
            const lines = content.split('\n').length - 1; // Subtract header
            console.log(`${city.padEnd(20)} | ✅ ${lines} leads`);
        } else {
            console.log(`${city.padEnd(20)} | ❌ NOT GENERATED`);
        }
    }

    console.log("\n" + "=".repeat(70));
}

checkStatus().catch(console.error);
