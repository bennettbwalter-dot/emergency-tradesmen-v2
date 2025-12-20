
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createHash } from 'crypto';
import { businessListings } from '../src/lib/businesses';

// Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY; // Using anon key, hope RLS allows insert or strict RLS is off.
// Ideally use SERVICE_ROLE key if RLS blocks writes. But user might not have it in .env.
// If anon fails, we'll need to ask user for service role key or disable RLS.

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Helper to generate deterministic UUID from string ID
function generateUUID(input: string): string {
    const hash = createHash('md5').update(input).digest('hex');
    // Format as UUID: 8-4-4-4-12
    return [
        hash.substring(0, 8),
        hash.substring(8, 12),
        '3' + hash.substring(13, 16), // Version 3 (MD5) - force 13th char to 3? No, bits.
        // Let's just do simple formatting, usually Postgres accepts just hex if formatted? 
        // Actually proper UUID v3 construction is better but complex.
        // Let's try just formatting the MD5 hex.
        // MD5 is 32 hex chars (128 bits). 
        // We can just format it.
        hash.substring(12, 16),
        hash.substring(16, 20),
        hash.substring(20, 32)
    ].join('-');
}

// Better valid UUID v3 implementation
function toUUID(str: string): string {
    const hash = createHash('md5').update(str).digest('hex');
    const chars = hash.split('');

    // Set version to 3 (0011) at index 12 (13th hex digit, which is char index 12? No 8+4=12. So chars[12])
    // wait, formatting:
    // xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx
    // M is version (3)
    // N is variant (8, 9, a, or b)

    chars[12] = '3';
    chars[16] = ((parseInt(chars[16], 16) & 0x3) | 0x8).toString(16); // variant 10xx

    return [
        chars.slice(0, 8).join(''),
        chars.slice(8, 12).join(''),
        chars.slice(12, 16).join(''),
        chars.slice(16, 20).join(''),
        chars.slice(20).join('')
    ].join('-');
}


async function syncListings() {
    console.log("Starting sync of static listings to Supabase...");

    const businessesToUpsert: any[] = [];
    const photosToUpsert: any[] = [];

    // 1. Flatten the nested structure
    for (const city in businessListings) {
        for (const trade in businessListings[city]) {
            const listings = businessListings[city][trade];

            for (const biz of listings) {
                const businessUuid = toUUID(biz.id);

                // Generate slug from name + short hash to ensure uniqueness
                const baseSlug = biz.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                const slug = `${baseSlug}-${businessUuid.substring(0, 8)}`;

                // Map to DB columns
                businessesToUpsert.push({
                    id: businessUuid,
                    slug: slug, // Add ID-based slug
                    name: biz.name,
                    rating: biz.rating,
                    review_count: biz.reviewCount,
                    address: biz.address || city, // fallback to city
                    hours: biz.hours,
                    is_open_24_hours: biz.isOpen24Hours,
                    phone: biz.phone,
                    website: biz.website,
                    featured_review: biz.featuredReview,
                    trade: trade.toLowerCase(),
                    city: city, // normalize?
                    tier: biz.tier || 'free',
                    priority_score: biz.priority_score || 0,
                    verified: true, // Auto-verify static imports
                    // Premium fields (optional)
                    logo_url: biz.logo_url,
                    premium_description: biz.premium_description,
                    services_offered: biz.services_offered,
                    coverage_areas: biz.coverage_areas,
                    is_premium: biz.is_premium,
                    owner_user_id: biz.owner_user_id,
                    whatsapp_number: biz.whatsapp_number
                });

                // Photos
                if (biz.photos && biz.photos.length > 0) {
                    for (const photo of biz.photos) {
                        photosToUpsert.push({
                            id: toUUID(photo.id),
                            business_id: businessUuid,
                            url: photo.url,
                            is_primary: photo.isPrimary,
                            alt_text: photo.altText
                        });
                    }
                }
            }
        }
    }

    console.log(`Found ${businessesToUpsert.length} businesses and ${photosToUpsert.length} photos.`);

    // 2. Batch Upsert Businesses
    const BATCH_SIZE = 100;
    for (let i = 0; i < businessesToUpsert.length; i += BATCH_SIZE) {
        const batch = businessesToUpsert.slice(i, i + BATCH_SIZE);
        console.log(`Upserting businesses batch ${i / BATCH_SIZE + 1}/${Math.ceil(businessesToUpsert.length / BATCH_SIZE)}...`);

        const { error } = await supabase
            .from('businesses')
            .upsert(batch, { onConflict: 'id' });

        if (error) {
            console.error(`Error upserting businesses batch ${i}:`, error);
            if (error.code === 'PGRST204') {
                console.error("Schema Mismatch:", error.message);
                process.exit(1);
            }
        }
    }

    // 3. Batch Upsert Photos
    for (let i = 0; i < photosToUpsert.length; i += BATCH_SIZE) {
        const batch = photosToUpsert.slice(i, i + BATCH_SIZE);
        console.log(`Upserting photos batch ${i / BATCH_SIZE + 1}/${Math.ceil(photosToUpsert.length / BATCH_SIZE)}...`);

        const { error } = await supabase
            .from('business_photos')
            .upsert(batch, { onConflict: 'id' });

        if (error) {
            console.error(`Error upserting photos batch ${i}:`, error);
        }
    }
}


syncListings();
