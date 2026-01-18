
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAlignment() {
    const filePath = path.join(__dirname, 'verified_phase11_trades.json');
    const content = fs.readFileSync(filePath, 'utf-8');
    const trades = JSON.parse(content);

    // Filter for Water Restoration in UK
    const waterTrades = trades.filter((t: any) => t.trade_slug === 'water-restoration');

    console.log(`Checking ${waterTrades.length} Water Restoration entries from JSON...`);

    const missing = [];

    for (const trade of waterTrades) {
        const { data } = await supabase
            .from('businesses')
            .select('id')
            .eq('name', trade.name)
            .eq('city', trade.city)
            .maybeSingle();

        if (!data) {
            missing.push(trade);
            console.log(`MISSING in DB: ${trade.name} in ${trade.city}`);
        }
    }

    console.log(`\nTotal Missing: ${missing.length}`);
    if (missing.length > 0) {
        fs.writeFileSync(path.join(__dirname, 'missing_water_data.json'), JSON.stringify(missing, null, 2));
        console.log("Saved missing entries to scripts/missing_water_data.json");
    }
}

checkAlignment();
