/**
 * export-outreach-list.mjs
 * 
 * Fetches businesses from Supabase that have not been emailed.
 * Outputs a CSV file with merge tags and UTM-tracked links for GMass/Mailmeteor.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load env from root or current dir
dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(process.cwd(), '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY) must be set in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function exportList() {
    console.log('Fetching un-emailed businesses from Supabase...');

    // 1. Fetch businesses (target UK for now as per previous context)
    const { data: businesses, error } = await supabase
        .from('businesses')
        .select('id, name, email, city, trade')
        .eq('country_code', 'GB')
        .not('email', 'is', null)
        .not('email', 'eq', '')
        .is('last_emailed_at', null)
        .limit(100);

    if (error) {
        console.error('Error fetching data:', error);
        return;
    }

    if (!businesses || businesses.length === 0) {
        console.log('No new businesses found to email.');
        return;
    }

    console.log(`Found ${businesses.length} businesses. Formatting CSV...`);

    // 2. Prepare CSV rows
    // Header: Email, FirstName, BusinessName, City, Trade, PricingLink
    const header = 'Email,FirstName,BusinessName,City,Trade,PricingLink\n';

    const rows = businesses.map(b => {
        const firstName = b.name ? b.name.split(' ')[0] : 'there';

        // Generate UTM-tracked link
        const utmCampaign = 'batch_2_manual';
        const utmSource = 'gmail_mailmerge';
        const pricingLink = `https://emergencytradesmen.net/pricing?utm_source=${utmSource}&utm_campaign=${utmCampaign}&utm_medium=email&trade=${encodeURIComponent(b.trade || '')}&city=${encodeURIComponent(b.city || '')}&ref=${b.id}`;

        // Escape quotes for CSV
        const escape = (str) => `"${(str || '').replace(/"/g, '""')}"`;

        return [
            escape(b.email),
            escape(firstName),
            escape(b.name),
            escape(b.city),
            escape(b.trade),
            escape(pricingLink)
        ].join(',');
    });

    const csvContent = header + rows.join('\n');
    const outputPath = path.join(process.cwd(), 'outreach_batch_2.csv');

    fs.writeFileSync(outputPath, csvContent);

    console.log(`\n✅ Success! Exported ${businesses.length} leads to:`);
    console.log(outputPath);
    console.log('\nNext Steps:');
    console.log('1. Open this CSV in Google Sheets.');
    console.log('2. Connect GMass or Mailmeteor.');
    console.log('3. Use {{FirstName}}, {{Trade}}, etc. and the {{PricingLink}} in your template.');
}

exportList();
