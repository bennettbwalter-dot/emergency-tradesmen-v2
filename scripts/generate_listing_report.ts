import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase configuration");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateReport() {
    console.log("Generating Active Real Listings Report...");

    const { data, error } = await supabase
        .from('businesses')
        .select('country_code, verified');

    if (error) {
        console.error("Error fetching data:", error);
        return;
    }

    const report = {
        UK: { total: 0, verified: 0 },
        US: { total: 0, verified: 0 },
        Other: { total: 0, verified: 0 }
    };

    data.forEach(item => {
        const code = (item.country_code || 'GB').toUpperCase();
        const isVerified = item.verified === true;

        let region: 'UK' | 'US' | 'Other' = 'Other';
        if (code === 'GB') region = 'UK';
        else if (code === 'US') region = 'US';

        report[region].total++;
        if (isVerified) {
            report[region].verified++;
        }
    });

    console.log("\n================ Listing Report ================");
    console.log(`UK Listings: ${report.UK.verified} real / ${report.UK.total} total`);
    console.log(`US Listings: ${report.US.verified} real / ${report.US.total} total`);
    console.log("================================================");
}

generateReport();
