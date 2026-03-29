/**
 * scripts/bulk-sync.js
 * 
 * Objective: Fetch all existing UK listings from Supabase and send them 
 * to the Google Sheets Web App URL in batches to handle large datasets (20,000+).
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const GOOGLE_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbytvhi0V66NuS4mszxVLZbefV-H-WEnyNYSMBj4-hI5GJBsnnF4WfRoI5F1rxtuCjwP/exec";

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing Supabase credentials in .env file.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function backfill() {
    console.log("🚀 Starting Bulk Sync for ALL UK Listings...");

    const BATCH_SIZE = 1000;
    let from = 0;
    let to = BATCH_SIZE - 1;
    let hasMore = true;
    let totalSynced = 0;
    let totalFailed = 0;

    while (hasMore) {
        console.log(`\n📦 Fetching batch: ${from} to ${to}...`);

        const { data: listings, error } = await supabase
            .from('businesses')
            .select('*')
            .eq('country_code', 'GB')
            .not('email', 'is', null)
            .neq('email', '')
            .range(from, to)
            .order('created_at', { ascending: true });

        if (error) {
            console.error("❌ Error fetching listings:", error.message);
            break;
        }

        if (listings.length === 0) {
            hasMore = false;
            break;
        }

        console.log(`🟢 Processing ${listings.length} listings in this batch...`);

        for (const listing of listings) {
            try {
                const response = await fetch(GOOGLE_WEBAPP_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ record: listing })
                });

                if (response.ok) {
                    const result = await response.text();
                    if (result === "Success") {
                        totalSynced++;
                        if (totalSynced % 10 === 0) process.stdout.write(`.`); // Simple progress dots
                    } else {
                        totalFailed++;
                    }
                } else {
                    totalFailed++;
                }
            } catch (err) {
                totalFailed++;
            }

            // Small delay to prevent hitting Google's rate limits too fast
            await new Promise(resolve => setTimeout(resolve, 150));
        }

        console.log(`\n✅ Batch complete. Current Total Sync: ${totalSynced}`);

        if (listings.length < BATCH_SIZE) {
            hasMore = false;
        } else {
            from += BATCH_SIZE;
            to += BATCH_SIZE;
        }
    }

    console.log(`\n--- 🎉 ALL SYNC COMPLETE ---`);
    console.log(`✅ Successfully synced: ${totalSynced}`);
    console.log(`❌ Failed or Filtered: ${totalFailed}`);
}

backfill().catch(err => {
    console.error("❌ Fatal Script Error:", err);
    process.exit(1);
});
