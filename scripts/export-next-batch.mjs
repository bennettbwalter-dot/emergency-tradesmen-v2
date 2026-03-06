/**
 * export-next-batch.mjs
 * 
 * Universal batch exporter — always reads sent_master.txt to prevent duplicates.
 * Automatically detects the next batch number.
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const base = path.join(__dirname, '..');

dotenv.config({ path: path.join(base, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const BATCH_SIZE = 100;

async function exportBatch() {
    // 1. Auto-detect next batch number
    const existingBatches = fs.readdirSync(base)
        .filter(f => f.match(/^outreach_batch_\d+\.csv$/))
        .map(f => parseInt(f.match(/\d+/)[0]))
        .sort((a, b) => a - b);
    const nextBatch = existingBatches.length ? existingBatches[existingBatches.length - 1] + 1 : 1;
    console.log(`Preparing Batch #${nextBatch}...`);

    // 2. Load master exclusion list
    const masterPath = path.join(base, 'sent_master.txt');
    const excludeSet = new Set();
    if (fs.existsSync(masterPath)) {
        fs.readFileSync(masterPath, 'utf8').split('\n')
            .filter(l => l.trim())
            .forEach(e => excludeSet.add(e.toLowerCase().trim()));
        console.log(`Loaded ${excludeSet.size} emails to exclude from sent_master.txt`);
    } else {
        console.log('No sent_master.txt found — run build-master-list.mjs first if you have prior batches.');
    }

    // 3. Fetch leads and filter client-side
    let exported = 0;
    let offset = 0;
    const rows = [];

    while (exported < BATCH_SIZE) {
        const { data, error } = await supabase
            .from('businesses')
            .select('id, name, email, city, trade')
            .eq('country_code', 'GB')
            .not('email', 'is', null)
            .not('email', 'eq', '')
            .range(offset, offset + 499);

        if (error) { console.error('DB Error:', error.message); break; }
        if (!data || data.length === 0) { console.log('No more data in DB.'); break; }

        for (const b of data) {
            if (exported >= BATCH_SIZE) break;
            if (!b.email || excludeSet.has(b.email.toLowerCase().trim())) continue;

            const firstName = b.name ? b.name.split(' ')[0] : 'there';
            const utmCampaign = `batch_${nextBatch}_manual`;
            const pricingLink = `https://emergencytradesmen.net/pricing?utm_source=gmail_mailmerge&utm_campaign=${utmCampaign}&utm_medium=email&trade=${encodeURIComponent(b.trade || '')}&city=${encodeURIComponent(b.city || '')}&ref=${b.id}`;
            const escape = (str) => `"${(str || '').replace(/"/g, '""')}"`;

            rows.push([escape(b.email), escape(firstName), escape(b.name), escape(b.city), escape(b.trade), escape(pricingLink)].join(','));
            exported++;
        }

        offset += 500;
    }

    // 4. Write CSV
    const header = 'Email,FirstName,BusinessName,City,Trade,PricingLink\n';
    const outputFile = `outreach_batch_${nextBatch}.csv`;
    const outputPath = path.join(base, outputFile);
    fs.writeFileSync(outputPath, header + rows.join('\n'));

    console.log(`\n✅ ${outputFile} created with ${exported} fresh leads.`);
    console.log(`UTM campaign tag: batch_${nextBatch}_manual`);

    // 5. Auto-update sent_master.txt
    const newEmails = rows.map(r => {
        const m = r.match(/^"([^"]+)"/);
        return m ? m[1].toLowerCase().trim() : null;
    }).filter(Boolean);

    newEmails.forEach(e => excludeSet.add(e));
    fs.writeFileSync(masterPath, Array.from(excludeSet).join('\n'));
    console.log(`sent_master.txt updated: now ${excludeSet.size} total emails excluded.`);
    console.log('\n🎯 Next step: paste into a new Google Sheet and send via Mailmeteor or Apps Script!');
}

exportBatch();
