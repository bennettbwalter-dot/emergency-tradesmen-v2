
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as crypto from 'crypto';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

function generateDeterministicUUID(input: string): string {
    const hash = crypto.createHash('sha256').update(input).digest('hex');
    return [
        hash.substring(0, 8),
        hash.substring(8, 12),
        '4' + hash.substring(13, 16),
        '8' + hash.substring(17, 20),
        hash.substring(20, 32),
    ].join('-');
}

async function importTrades() {
    const filePath = path.join(__dirname, 'verified_phase11_trades.json');

    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        process.exit(1);
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const allTrades = JSON.parse(fileContent);

    // Filter for Aberdeen Water Restoration
    const trades = allTrades.filter((t: any) =>
        (t.city === 'Aberdeen' && t.trade_slug === 'water-restoration')
    );

    console.log(`Found ${trades.length} matching trades to import (Aberdeen Water Restoration).`);

    const targetUserId = "bef3b95e-b361-478a-9899-7016d9edc21b";
    console.log(`✅ Assigning businesses to System User ID: ${targetUserId}`);

    let successCount = 0;
    let failureCount = 0;

    for (const trade of trades) {
        const uniqueString = `${trade.name}-${trade.phone}-${trade.city}`;
        const id = generateDeterministicUUID(uniqueString);

        const slug = `${trade.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${trade.city.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

        const record = {
            id: id,
            owner_user_id: targetUserId,
            name: trade.name,
            slug: slug,
            trade: trade.trade_slug,
            city: trade.city,
            country_code: 'GB',
            phone: trade.phone,
            verified: true,
            updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
            .from('businesses')
            .upsert(record, { onConflict: 'id' });

        if (error) {
            console.error(`Error importing ${trade.name}:`, error.message);
            failureCount++;
        } else {
            console.log(`Successfully imported: ${trade.name} (${trade.city}) - ${trade.trade_slug}`);
            successCount++;
        }
    }

    console.log(`\nImport complete.`);
    console.log(`Success: ${successCount}`);
    console.log(`Failed: ${failureCount}`);
}

importTrades().catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
});
