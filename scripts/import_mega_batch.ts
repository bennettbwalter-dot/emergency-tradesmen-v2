import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const files = [
    'mega_batch_real.json'
];

async function importData() {
    for (const file of files) {
        if (!fs.existsSync(join(__dirname, file))) continue;
        console.log(`Reading ${file}...`);
        const data = JSON.parse(fs.readFileSync(join(__dirname, file), 'utf-8'));

        const businesses = data.map((item: any) => {
            const slugBase = `${item.name}-${item.city}`.toLowerCase().replace(/[^a-z0-0]+/g, '-');
            const randomSuffix = Math.floor(Math.random() * 10000);
            return {
                id: crypto.randomUUID(),
                ...item,
                slug: `${slugBase}-${randomSuffix}`,
                country_code: 'US',
                rating: 4.5 + Math.random() * 0.5,
                review_count: Math.floor(Math.random() * 100) + 20,
                is_open_24_hours: true,
                verified: true,
                created_at: new Date().toISOString()
            };
        });

        const { error } = await supabase
            .from('businesses')
            .insert(businesses);

        if (error) {
            console.error(`Error importing ${file}:`, error.message);
        } else {
            console.log(`Successfully imported ${businesses.length} records from ${file}`);
        }
    }
}

importData();
