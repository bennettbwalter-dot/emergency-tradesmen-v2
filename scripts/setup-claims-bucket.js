import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://xwqvhymkwuasotsgmarn.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
    console.error("Error: SUPABASE_SERVICE_ROLE_KEY is missing from .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupClaimsBucket() {
    console.log("Checking claims storage bucket...");

    // 1. Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
        console.error("Error listing buckets:", listError.message);
        return;
    }

    const bucketName = 'business-claims';
    const existingBucket = buckets.find(b => b.name === bucketName);

    if (existingBucket) {
        console.log(`✅ '${bucketName}' bucket already exists.`);
        if (existingBucket.public) {
            console.warn(`⚠️ WARNING: '${bucketName}' is PUBLIC. It should be private for security.`);
            // Note: Changing public/private status usually requires recreating or updating via API
            const { error: updateError } = await supabase.storage.updateBucket(bucketName, {
                public: false
            });
            if (updateError) console.error("Failed to make bucket private:", updateError.message);
            else console.log("   Fixed: Bucket is now private.");
        }
    } else {
        console.log(`Creating '${bucketName}' bucket...`);
        const { data, error } = await supabase.storage.createBucket(bucketName, {
            public: false, // PRIVATE
            fileSizeLimit: 5242880, // 5MB
            allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf']
        });

        if (error) {
            console.error("Error creating bucket:", error.message);
        } else {
            console.log(`✅ '${bucketName}' bucket created successfully.`);
        }
    }
}

setupClaimsBucket();
