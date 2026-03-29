
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function auditProgress() {
    console.log('--- UK Data Audit (Deep Debug Mode) ---\n');

    // 1. Count ALL Database Listings (verified + unverified)
    console.log('Querying all businesses to check status...');
    const { data: dbListings, error } = await supabase
        .from('businesses')
        .select('id, city, trade, country_code, verified');

    if (error) {
        console.error('Error querying businesses:', error.message);
        return;
    }

    processListings(dbListings || []);
}

function processListings(listings: any[]) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    let report = '--- UK Data Audit (Deep Debug Mode) ---\n\n';

    report += `Total Listings (All Countries): ${listings.length}\n`;
    const verifiedCount = listings.filter(l => l.verified).length;
    const unverifiedCount = listings.length - verifiedCount;
    report += `Verified: ${verifiedCount}\n`;
    report += `Unverified: ${unverifiedCount}\n`;

    // Filter for UK-like codes
    const ukListings = listings.filter(l => ['UK', 'GB', 'United Kingdom', 'Great Britain'].includes(l.country_code));
    report += `\n--- Detailed Analysis for UK/GB (${ukListings.length}) ---\n`;

    const ukVerified = ukListings.filter(l => l.verified).length;
    const ukUnverified = ukListings.length - ukVerified;
    report += `UK Verified: ${ukVerified}\n`;
    report += `UK Unverified: ${ukUnverified}\n`;

    // Group by City (Verified vs Unverified)
    const cityCounts: Record<string, { v: number, u: number }> = {};
    ukListings.forEach(l => {
        const city = l.city || 'Unknown';
        if (!cityCounts[city]) cityCounts[city] = { v: 0, u: 0 };
        if (l.verified) cityCounts[city].v++;
        else cityCounts[city].u++;
    });

    report += '\n--- Breakdown by City (Verified | Unverified) ---\n';
    const sortedCities = Object.entries(cityCounts).sort((a, b) => (b[1].v + b[1].u) - (a[1].v + a[1].u));
    sortedCities.forEach(([city, counts]) => {
        report += `${city}: ${counts.v} | ${counts.u}\n`;
    });

    // 2. Pending Phase 12 Group C
    const pendingFile = path.join(__dirname, 'data', 'uk_phase12_group_c_data.json');
    if (fs.existsSync(pendingFile)) {
        try {
            const raw = fs.readFileSync(pendingFile, 'utf8');
            const data = JSON.parse(raw);
            report += `\n--- Pending Import (Phase 12 Group C) ---\n`;
            report += `Count: ${data.length}\n`;
        } catch (e) {
            report += `Error reading pending file: ${e}\n`;
        }
    } else {
        report += '\nNo pending Phase 12 Group C file found.\n';
    }

    const reportFile = path.join(__dirname, 'audit_report.txt');
    fs.writeFileSync(reportFile, report);
    console.log(`Report saved to ${reportFile}`);
}

auditProgress();
