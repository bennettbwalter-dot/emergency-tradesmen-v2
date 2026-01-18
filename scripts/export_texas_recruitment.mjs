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

console.log(`🔑 Auth Check: URL=${!!supabaseUrl}, KEY=${!!supabaseKey}`);

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase credentials in .env");
    console.error("DEBUG: ENV keys present:", Object.keys(process.env).filter(k => k.includes('SUPABASE')));
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const TARGET_CITIES = [
    'Houston', 'Austin', 'San Antonio',
    'Plano', 'Frisco', 'Irving', 'Arlington',
    'Miami', 'Tampa', 'Orlando', 'Jacksonville',
    'Phoenix', 'Scottsdale', 'Mesa', 'Tucson',
    'Detroit', 'Cleveland', 'Pittsburgh', 'Buffalo',
    'Seattle', 'Portland', 'Tacoma', 'Spokane',
    'Los Angeles', 'San Diego', 'San Francisco', 'Sacramento'
];

async function exportRecruitmentLists() {
    console.log("📊 Generating Recruitment CSVs for Texas Markets...\n");

    for (const city of TARGET_CITIES) {
        console.log(`Processing ${city}...`);

        const { data: businesses, error } = await supabase
            .from('businesses')
            .select('name, phone, trade, rating, review_count, website, address')
            .eq('city', city)
            .order('review_count', { ascending: false });

        if (error) {
            console.error(`❌ Error fetching ${city}:`, error.message);
            continue;
        }

        if (!businesses || businesses.length === 0) {
            console.warn(`⚠️ No businesses found for ${city}`);
            continue;
        }

        // CSV Header
        const header = "Name,Phone,Trade,Rating,Reviews,Website,Address\n";

        // CSV Rows
        const rows = businesses.map(b => {
            // Escape quotes and handle commas in fields
            const clean = (field) => `"${(field || '').toString().replace(/"/g, '""')}"`;

            return [
                clean(b.name),
                clean(b.phone),
                clean(b.trade),
                clean(b.rating),
                clean(b.review_count),
                clean(b.website),
                clean(b.address)
            ].join(',');
        }).join('\n');

        const csvContent = header + rows;
        const filename = `top_contractors_${city.toLowerCase().replace(' ', '_')}.csv`;
        const outputPath = path.join(__dirname, `../recruitment_lists/${filename}`);

        // Ensure directory exists
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(outputPath, csvContent);
        console.log(`✅ Saved ${businesses.length} leads to recruitment_lists/${filename}`);
    }

    console.log("\n🎉 Export Complete!");
}

exportRecruitmentLists().catch(console.error);
