import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const createSlug = (name, trade, city) => {
    return `${name}-${trade}-${city}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

const batches = [
    {
        county: 'Clay',
        cities: ['Ashland', 'Lineville', 'Millerville', 'Hollins', 'Delta', 'Cragford', 'Pyriton', 'Clairmont Springs', 'Brownsville', 'Hatchet Creek'],
        breakdown: { name: "McCain Towing & Recovery", phone: "256-354-2001" },
        water: { name: "Horizon Restoration Pros", phone: "256-396-8000" }
    },
    {
        county: 'Cleburne',
        cities: ['Heflin', 'Edwardsville', 'Fruithurst', 'Ranburne', 'Muscadine', 'Hollis Crossroads', 'Chulafinnee', 'Micaville', 'Abel', 'Belltown'],
        breakdown: { name: "Twin Creeks Towing", phone: "256-396-9111" },
        water: { name: "Defender Cleaning & Restoration", phone: "770-362-7994" }
    },
    {
        county: 'Coffee',
        cities: ['Enterprise', 'Elba', 'New Brockton', 'Kinston', 'Victoria', 'Jack', 'Clintonville', 'Roeton', 'Goodman', 'Alberton'],
        breakdown: { name: "Kevin GoodYear Towing", phone: "334-347-1234" },
        water: { name: "SERVPRO of Coffee County", phone: "334-347-1933" }
    },
    {
        county: 'Colbert',
        cities: ['Tuscumbia', 'Muscle Shoals', 'Sheffield', 'Littleville', 'Leighton', 'Cherokee', 'Barton', 'Allsboro', 'Pride', 'Nitrate City'],
        breakdown: { name: "Towing Tuscumbia", phone: "256-383-0000" },
        water: { name: "HH Restoration", phone: "256-320-7260" }
    },
    {
        county: 'Conecuh',
        cities: ['Evergreen', 'Castleberry', 'Repton', 'McKenzie', 'Belleville', 'Lenox', 'Owassa', 'Bermuda', 'Johnstonville', 'Paul'],
        breakdown: { name: "Shannon Bryant Wrecker", phone: "251-578-1234" },
        water: { name: "Alabama Emergency Restoration Pros", phone: "251-578-8440" }
    },
    {
        county: 'Coosa',
        cities: ['Rockford', 'Goodwater', 'Kellyton', 'Hissop', 'Equality', 'Weogufka', 'Stewartville', 'Nizams', 'Mount Olive', 'Hanover'],
        breakdown: { name: "B&C Towing and Recovery", phone: "205-281-7132" },
        water: { name: "Flood Damage Restoration LLC", phone: "334-510-9520" }
    }
];

async function checkDuplicates() {
    let slugs = [];
    for (const batch of batches) {
        for (const city of batch.cities) {
            slugs.push(createSlug(batch.breakdown.name, 'breakdown', city));
            slugs.push(createSlug(batch.water.name, 'water-restoration', city));
        }
    }

    const { data, error } = await supabase
        .from('businesses')
        .select('slug, id')
        .in('slug', slugs);

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('Duplicates found in DB:', data);
    }
}

checkDuplicates().catch(console.error);
