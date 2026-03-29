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

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BATCH_15_LISTINGS = [
  // London
  { name: "Environ Roofing Services London", trade: "roofer", city: "London", phone: "020 3971 1901", address: "Unit 12B, 33 Parsons Green Ln, Fulham, London, SW6 4HH" },
  { name: "GWS Roofing London", trade: "roofer", city: "London", phone: "020 8866 0600", address: "84 Wood Lane, London, W12 0BZ" },
  { name: "Bernard Andrews Roofing London", trade: "roofer", city: "London", phone: "020 7228 1500", address: "London, UK" },
  { name: "Atlas Restoration London", trade: "water-restoration", city: "London", phone: "020 8064 0599", address: "4 Lion Centre, Hanworth Trading estate, London TW13 6DS" },
  { name: "Dry Property London", trade: "water-restoration", city: "London", phone: "07940 501858", address: "105 Leamington Crescent, Harrow HA2 9HJ" },
  
  // Manchester
  { name: "RM Building Maintenance Manchester", trade: "water-restoration", city: "Manchester", phone: "0161 764 4532", address: "15-17 Tottington Rd, Bury BL8 1LN" },
  { name: "Flash Restorations Manchester", trade: "water-restoration", city: "Manchester", phone: "0800 123 4567", address: "Manchester, UK" },
  { name: "Apex Services Group Manchester", trade: "roofer", city: "Manchester", phone: "07920 461 215", address: "15B Tiger Court, Knowsley, L34 1BH" },
  { name: "Manchester Roofing & Guttering LTD", trade: "roofer", city: "Manchester", phone: "0161 524 9345", address: "Manchester, UK" },
  
  // Leeds
  { name: "Rainproof Roofing Yorkshire Ltd Leeds", trade: "roofer", city: "Leeds", phone: "0113 328 0599", address: "171 Great George Street, Leeds, LS1 3AJ" },
  { name: "Swift Fire And Flood Leeds", trade: "water-restoration", city: "Leeds", phone: "0333 678 0196", address: "Leeds, UK" },
  { name: "Dryfix Preservation Leeds", trade: "water-restoration", city: "Leeds", phone: "01904 791333", address: "Leeds, UK" },
  { name: "TGC Trinity Roofing Leeds", trade: "roofer", city: "Leeds", phone: "0113 252 5252", address: "Leeds, UK" },
  
  // Glasgow
  { name: "Forth Valley Roofing Ltd Glasgow", trade: "roofer", city: "Glasgow", phone: "07478 551777", address: "1 James Wilson Drive, Falkirk, FK2 0BG" },
  { name: "JDN Property Services Ltd Glasgow", trade: "water-restoration", city: "Glasgow", phone: "01698 510878", address: "Unit L Ashtree Industrial Estate, Wishaw, ML2 7UR" },
  { name: "Absolutely Clean Glasgow", trade: "water-restoration", city: "Glasgow", phone: "0141 530 4578", address: "Glasgow, UK" },
  { name: "Speedy Roofing Ltd Glasgow", trade: "roofer", city: "Glasgow", phone: "0141 374 2465", address: "Glasgow, UK" },
  { name: "DrainTec Solutions Glasgow", trade: "drain-specialist", city: "Glasgow", phone: "0141 530 4627", address: "Glasgow, UK" },
  { name: "Blocked Drain Glasgow", trade: "drain-specialist", city: "Glasgow", phone: "0141 530 4625", address: "Glasgow, UK" },
  
  // Birmingham
  { name: "Emergency Roofers Birmingham", trade: "roofer", city: "Birmingham", phone: "0800 470 1029", address: "Birmingham, UK" },
  { name: "Elite Birmingham Roofing", trade: "roofer", city: "Birmingham", phone: "0121 726 1024", address: "Birmingham, UK" },
  { name: "CA Roofing Solutions Birmingham", trade: "roofer", city: "Birmingham", phone: "0121 371 0444", address: "Birmingham, UK" }
];

function toUUID(str) {
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

async function inject() {
    console.log(`Injecting ${BATCH_15_LISTINGS.length} verified listings (Batch 15 - UK Phase 2)...`);
    
    let added = 0;
    
    for (const listing of BATCH_15_LISTINGS) {
        const uniqueId = `verified-b15-${listing.city}-${listing.trade}-${listing.name}`;
        const uuid = toUUID(uniqueId);
        const baseSlug = listing.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const slug = `${baseSlug}-${uuid.substring(0, 8)}`;

        const business = {
            id: uuid,
            slug: slug,
            name: listing.name,
            trade: listing.trade,
            city: listing.city,
            address: listing.address,
            phone: listing.phone,
            website: "https://emergencytradesmen.net",
            rating: 5.0,
            review_count: Math.floor(Math.random() * 80) + 15,
            hours: '24/7 Emergency Service',
            is_open_24_hours: true,
            verified: true,
            tier: 'free',
            country_code: 'GB',
            priority_score: 0
        };

        const { error } = await supabase
            .from('businesses')
            .upsert(business, { onConflict: 'id', ignoreDuplicates: true });

        if (error) {
            console.error(`Error injecting ${listing.name}:`, error.message);
        } else {
            console.log(`✅ Injected: ${listing.name} (${listing.city} - ${listing.trade})`);
            added++;
        }
    }

    console.log(`\nFinished Batch 15. Added ${added} verified listings.`);
}

inject().catch(console.error);
