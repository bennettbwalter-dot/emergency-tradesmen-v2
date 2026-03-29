
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Try to use Service Role Key for seeding to bypass RLS, fallback to Anon Key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env');
    process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.VITE_SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("⚠️  WARNING: Using Anon Key. Seeding may fail if RLS policies do not allow anonymous inserts.");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

function slugify(text) {
    return text.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

async function seed() {
    console.log("🌱 Starting Location Seeding with Nested Structure...");

    // Load JSON
    const jsonPath = path.join(__dirname, '../src/lib/us_cities.json');
    let data;
    try {
        const raw = fs.readFileSync(jsonPath, 'utf-8');
        data = JSON.parse(raw);
        console.log(`✅ Loaded us_cities.json`);
    } catch (e) {
        console.error(`❌ Error loading JSON: ${e.message}`);
        process.exit(1);
    }

    if (!data.states || !Array.isArray(data.states)) {
        console.error("❌ Invalid JSON format: 'states' array missing.");
        process.exit(1);
    }

    console.log(`Found ${data.states.length} States to process.`);

    for (const state of data.states) {
        // 1. Upsert State
        const stateSlug = slugify(state.name);
        console.log(`\nProcessing State: ${state.name} (${state.code})`);

        const { data: stateRecord, error: stateError } = await supabase.from('locations').upsert({
            name: state.name,
            slug: state.slug || stateSlug,
            type: 'state',
            state_code: state.code,
            hierarchy_path: [state.slug || stateSlug],
            parent_id: null
        }, { onConflict: 'slug,type' }).select().single();

        if (stateError) {
            console.error(`  ❌ Failed to upsert state ${state.name}: ${stateError.message}`);
            continue;
        }

        if (state.metros) {
            for (const metro of state.metros) {
                // 2. Upsert Metro
                const metroSlug = metro.slug || slugify(metro.name);

                const { data: metroRecord, error: metroError } = await supabase.from('locations').upsert({
                    name: metro.name,
                    slug: metroSlug,
                    type: 'metro',
                    state_code: state.code,
                    parent_id: stateRecord.id,
                    hierarchy_path: [stateRecord.slug, metroSlug],
                    anchor_slug: slugify(metro.anchor_city || metro.name)
                }, { onConflict: 'slug,parent_id' }).select().single();

                if (metroError) {
                    console.error(`    ❌ Failed to upsert metro ${metro.name}: ${metroError.message}`);
                    continue;
                }

                if (metro.cities) {
                    for (const city of metro.cities) {
                        // 3. Upsert City
                        const citySlug = city.slug || slugify(city.name);

                        const { data: cityRecord, error: cityError } = await supabase.from('locations').upsert({
                            name: city.name,
                            slug: citySlug,
                            type: 'city',
                            state_code: state.code,
                            parent_id: metroRecord.id,
                            hierarchy_path: [stateRecord.slug, metroRecord.slug, citySlug]
                        }, { onConflict: 'slug,parent_id' }).select().single();

                        if (cityError) {
                            console.error(`      ❌ Failed to upsert city ${city.name}: ${cityError.message}`);
                            continue;
                        }

                        if (city.suburbs) {
                            for (const suburb of city.suburbs) {
                                // 4. Upsert Suburb
                                const suburbSlug = suburb.slug || slugify(suburb.name);

                                const { error: suburbError } = await supabase.from('locations').upsert({
                                    name: suburb.name,
                                    slug: suburbSlug,
                                    type: 'suburb',
                                    state_code: state.code,
                                    parent_id: cityRecord.id,
                                    hierarchy_path: [stateRecord.slug, metroRecord.slug, cityRecord.slug, suburbSlug]
                                }, { onConflict: 'slug,parent_id' });

                                if (suburbError) {
                                    console.error(`        ❌ Failed to upsert suburb ${suburb.name}: ${suburbError.message}`);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    console.log("\n✅ Seeding Complete!");
}

seed().catch(e => {
    console.error("❌ Unexpected error:", e);
    process.exit(1);
});
