
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function debugLutonQuery() {
    const trade = 'electrician';
    const city = 'luton'; // lowercase as per URL
    const cityProper = 'Luton';

    console.log(`[debug] Querying Supabase for trade: ${trade}, city: ${city}`);

    const { data, error } = await supabase
        .from('businesses')
        .select('id, name, city, trade, verified, tier, priority_score, is_premium')
        .ilike('trade', trade)
        .or(`city.ilike.${city},selected_locations.cs.{${cityProper}}`)
        .eq('verified', true);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Found ${data?.length || 0} records.`);

    if (data) {
        // Sort in memory like the app does
        const sorted = data.sort((a, b) => {
            if (a.tier === 'paid' && b.tier !== 'paid') return -1;
            if (a.tier !== 'paid' && b.tier === 'paid') return 1;
            return (b.priority_score || 0) - (a.priority_score || 0);
        });

        sorted.forEach((b: any, i) => {
            console.log(`${i + 1}. ${b.name} | Tier: ${b.tier} | Premium: ${b.is_premium} | Priority: ${b.priority_score}`);
        });
    }
}

debugLutonQuery();
