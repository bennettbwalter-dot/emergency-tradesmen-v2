import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateFinalReport() {
    console.log("Generating Comprehensive Listing Report (Paginated)...");

    const report = {
        UK: { total: 0, verified: 0 },
        US: { total: 0, verified: 0 },
        Other: { total: 0, verified: 0 }
    };

    let from = 0;
    const step = 1000;
    let hasMore = true;

    while (hasMore) {
        console.log(`Fetching records ${from} to ${from + step}...`);
        const { data, error } = await supabase
            .from('businesses')
            .select('country_code, verified')
            .range(from, from + step - 1);

        if (error) {
            console.error("Error fetching data:", error);
            break;
        }

        if (!data || data.length === 0) {
            hasMore = false;
            break;
        }

        data.forEach(item => {
            const code = (item.country_code || 'GB').toUpperCase();
            const isVerified = item.verified === true;

            let region = 'Other';
            if (code === 'GB') region = 'UK';
            else if (code === 'US') region = 'US';

            report[region].total++;
            if (isVerified) {
                report[region].verified++;
            }
        });

        if (data.length < step) {
            hasMore = false;
        } else {
            from += step;
        }
    }

    console.log("\n================ GLOBAL LISTING REPORT ================");
    console.log(`Region | Real (Verified) | Total Count | Verification %`);
    console.log(`-------|-----------------|-------------|----------------`);

    const formatRow = (name, stats) => {
        const verified = stats.verified.toLocaleString();
        const total = stats.total.toLocaleString();
        const percent = stats.total > 0 ? ((stats.verified / stats.total) * 100).toFixed(1) + '%' : '0%';
        return `${name.padEnd(6)} | ${verified.padEnd(15)} | ${total.padEnd(11)} | ${percent}`;
    };

    console.log(formatRow("UK", report.UK));
    console.log(formatRow("US", report.US));
    console.log(formatRow("Other", report.Other));
    console.log("=======================================================");
    console.log(`GRAND TOTAL: ${(report.UK.total + report.US.total + report.Other.total).toLocaleString()} listings discovered.`);
}

generateFinalReport();
