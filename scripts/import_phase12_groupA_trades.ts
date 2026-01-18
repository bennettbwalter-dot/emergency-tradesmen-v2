
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

// Deterministic UUID generator
function generateDeterministicUUID(input: string): string {
    const hash = crypto.createHash('sha256').update(input).digest('hex');
    return [
        hash.substring(0, 8),
        hash.substring(8, 12),
        '4' + hash.substring(13, 16), // UUID version 4
        '8' + hash.substring(17, 20), // Variant 1
        hash.substring(20, 32),
    ].join('-');
}

async function importTrades() {
    const filePath = path.join(__dirname, 'verified_phase12_groupA_trades.json');

    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        process.exit(1);
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const trades = JSON.parse(fileContent);

    console.log(`Found ${trades.length} trades to import for Phase 12 (Group A).`);

    const targetUserId = "bef3b95e-b361-478a-9899-7016d9edc21b";
    console.log(`✅ Assigning businesses to System User ID: ${targetUserId}`);

    let successCount = 0;
    let failureCount = 0;

    for (const trade of trades) {
        // Generate deterministic UUID
        const uniqueString = `${trade.name}-${trade.phone}-${trade.city}`;
        const id = generateDeterministicUUID(uniqueString);

        // Generate slug (ensure uniqueness logic similar to Group C if possible, but keeping A logic is fine if unique)
        const slug = `${trade.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${trade.city.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

        const record = {
            id: id,
            owner_user_id: targetUserId, // Added field
            name: trade.name,
            slug: slug,
            trade: trade.trade,
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
            console.log(`Successfully imported: ${trade.name} (${trade.city}) - ${trade.trade}`);
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
