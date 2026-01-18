import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing required environment variables");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

function toUUID(str: string): string {
    const hash = createHash('md5').update(str).digest('hex');
    const chars = hash.split('');
    chars[12] = '3';
    chars[16] = ((parseInt(chars[16], 16) & 0x3) | 0x8).toString(16);
    return [
        chars.slice(0, 8).join(''),
        chars.slice(8, 12).join(''),
        chars.slice(12, 16).join(''),
        chars.slice(16, 20).join(''),
        chars.slice(20).join('')
    ].join('-');
}

async function insertBusiness() {
    // Get args
    const args = process.argv.slice(2);
    if (args.length < 5) {
        console.log("Usage: node insert_manual_business.ts <NAME> <CITY> <TRADE> <PHONE> <ADDRESS> [WEBSITE]");
        process.exit(1);
    }

    const [name, city, trade, phone, address, website] = args;

    const uniqueId = `manual-${name}-${city}-${phone}`.toLowerCase().replace(/[^a-z0-9]/g, '');
    const uuid = toUUID(uniqueId);

    // Slug: name-city-uuid8
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const cleanCity = city.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const slug = `${cleanName}-${cleanCity}-${uuid.substring(0, 8)}`;

    const business = {
        id: uuid,
        slug: slug,
        name: name,
        trade: trade,
        city: city,
        address: address,
        phone: phone,
        website: website || null,
        rating: 5.0,
        review_count: 1,
        hours: '24/7 Emergency Service',
        is_open_24_hours: true,
        verified: true,
        tier: 'free',
        country_code: 'GB',
        priority_score: 0,
        contact_name: "Support Team"
    };

    console.log("Inserting:", business);

    const { error } = await supabase
        .from('businesses')
        .upsert(business, { onConflict: 'id' });

    if (error) {
        console.error("❌ Error:", error.message);
    } else {
        console.log("✅ Success!");
    }
}

insertBusiness();
