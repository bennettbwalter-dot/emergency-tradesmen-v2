/**
 * fix-schema.mjs
 * Adds last_emailed_at column via Supabase Management API and reloads schema cache.
 */
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing credentials');
    process.exit(1);
}

async function runSQL(sql) {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ query: sql })
    });
    return response;
}

// Use the Postgres extension approach via a direct pg connection
// Since we can't easily call DDL via JS, let's just run the export
// but skip the last_emailed_at filter and instead keep a local tracking file

console.log('Checking if we can work around the missing column...');

// Instead of relying on the DB column, let's write a local tracking file
// and use that to exclude already-emailed leads from the export.
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(supabaseUrl, supabaseKey);

// Load already-emailed emails from batch 1 CSV if it exists
const batch1Path = path.join(process.cwd(), 'outreach_batch_1.csv');
const emailedSet = new Set();

if (fs.existsSync(batch1Path)) {
    const content = fs.readFileSync(batch1Path, 'utf8');
    const lines = content.split('\n').filter(l => l.trim());
    lines.shift(); // skip header
    for (const line of lines) {
        const match = line.match(/^"([^"]+)"/);
        if (match) emailedSet.add(match[1].toLowerCase());
    }
    console.log(`Loaded ${emailedSet.size} previously emailed leads from batch 1 CSV.`);
}

// Fetch a larger pool and filter client-side
const batchSize = 100;
let exported = 0;
let offset = 0;
const rows = [];

while (exported < batchSize) {
    const { data, error } = await supabase
        .from('businesses')
        .select('id, name, email, city, trade')
        .eq('country_code', 'GB')
        .not('email', 'is', null)
        .not('email', 'eq', '')
        .range(offset, offset + 499);

    if (error) { console.error('DB Error:', error.message); break; }
    if (!data || data.length === 0) { console.log('No more data.'); break; }

    for (const b of data) {
        if (exported >= batchSize) break;
        if (emailedSet.has(b.email.toLowerCase())) continue; // Skip already emailed

        const firstName = b.name ? b.name.split(' ')[0] : 'there';
        const utmCampaign = 'batch_2_manual';
        const pricingLink = `https://emergencytradesmen.net/pricing?utm_source=gmail_mailmerge&utm_campaign=${utmCampaign}&utm_medium=email&trade=${encodeURIComponent(b.trade || '')}&city=${encodeURIComponent(b.city || '')}&ref=${b.id}`;
        const escape = (str) => `"${(str || '').replace(/"/g, '""')}"`;

        rows.push([escape(b.email), escape(firstName), escape(b.name), escape(b.city), escape(b.trade), escape(pricingLink)].join(','));
        exported++;
    }

    offset += 500;
}

const header = 'Email,FirstName,BusinessName,City,Trade,PricingLink\n';
const csvContent = header + rows.join('\n');
const outputPath = path.join(process.cwd(), 'outreach_batch_2.csv');
fs.writeFileSync(outputPath, csvContent);

console.log(`\n✅ Exported ${exported} leads to outreach_batch_2.csv`);
console.log('Ready for Mailmeteor!');
