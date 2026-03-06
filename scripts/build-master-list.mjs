/**
 * build-master-list.mjs
 * Combines all batch CSVs into a single sent_master.txt
 * Run this after every batch to keep the master list updated.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const base = path.join(__dirname, '..');

const allEmails = new Set();

// Read all existing batch CSVs automatically
const files = fs.readdirSync(base).filter(f => f.match(/^outreach_batch_\d+\.csv$/));
files.forEach(fname => {
    const fpath = path.join(base, fname);
    const lines = fs.readFileSync(fpath, 'utf8').split('\n').filter(l => l.trim());
    lines.shift(); // skip header
    let count = 0;
    lines.forEach(line => {
        const m = line.match(/^"([^"]+)"/);
        if (m) { allEmails.add(m[1].toLowerCase().trim()); count++; }
    });
    console.log(`Loaded ${count} emails from ${fname}`);
});

// Write master sent list
const masterPath = path.join(base, 'sent_master.txt');
fs.writeFileSync(masterPath, Array.from(allEmails).join('\n'));
console.log(`\n✅ sent_master.txt updated: ${allEmails.size} unique emails on the do-not-email list.`);
