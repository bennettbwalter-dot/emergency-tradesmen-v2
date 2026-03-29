import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

const businesses = [
    {
        name: "Flash Electrical",
        phone: "0191 666 6606",
        address: "Newcastle upon Tyne",
        website: "https://flash-electrical.co.uk"
    },
    {
        name: "Able Group",
        phone: "0191 357 4623",
        address: "Newcastle upon Tyne",
        website: "https://able-group.co.uk"
    },
    {
        name: "GSD Electrician Newcastle",
        phone: "0191 500 3352",
        address: "Newcastle upon Tyne",
        website: "https://gsd-electrician-newcastle.co.uk"
    },
    {
        name: "P Burke & Sons",
        phone: "01661 820935",
        address: "Newcastle upon Tyne",
        website: "https://pburke.org"
    },
    {
        name: "SMT Electrical",
        phone: "0191 268 5999",
        address: "Newcastle upon Tyne",
        website: "https://smtelectrical.co.uk"
    }
];

async function insertBusinesses() {
    console.log("🚀 Inserting manual verified UK listings...");
    
    for (const biz of businesses) {
        const slug = biz.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + crypto.randomBytes(4).toString('hex');
        
        const { data, error } = await supabase.from('businesses').insert({
            id: crypto.randomUUID(),
            name: biz.name,
            slug: slug,
            trade: "electrician",
            city: "Newcastle upon Tyne",
            country_code: "GB",
            phone: biz.phone,
            address: biz.address,
            verified: true,
            tier: "standard",
            website: biz.website,
            created_at: new Date().toISOString()
        });

        if (error) {
            console.error(`❌ Error inserting ${biz.name}:`, error.message);
        } else {
            console.log(`✅ Success: ${biz.name}`);
        }
    }
}

insertBusinesses();
