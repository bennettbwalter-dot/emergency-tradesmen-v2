import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('🧹 Standardizing US trade slugs in database...');

    const mappings = [
        { from: 'hvac', to: 'gas-engineer' },
        { from: 'glass-repair', to: 'glazier' },
        { from: 'water-damage', to: 'water-restoration' },
        { from: 'breakdown-recovery', to: 'breakdown' }
    ];

    for (const mapping of mappings) {
        const { count, error } = await supabase
            .from('businesses')
            .update({ trade: mapping.to })
            .eq('trade', mapping.from)
            .eq('country_code', 'US');

        if (error) {
            console.error(`   ❌ Error mapping ${mapping.from}:`, error.message);
        } else {
            console.log(`   ✅ Mapped "${mapping.from}" to "${mapping.to}" for US records.`);
        }
    }

    console.log('✅ Trade standardization complete.');
}

main();
