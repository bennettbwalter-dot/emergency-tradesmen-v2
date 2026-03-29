/**
 * scripts/enrich-emails.js  —  TURBO v2
 *
 * Speed optimisations vs v1:
 *   • 3 concurrent workers instead of 1 sequential loop
 *   • Batch size 20 (was 5)
 *   • In-memory Set for tracking (was re-reading file every call)
 *   • Multi-source search: DuckDuckGo → Bing HTML → Yell.com
 *   • mailto: link extraction (catches obfuscated emails)
 *   • Smart domain-email guessing (info@, contact@, enquiries@)
 *   • Reduced per-record delay to 1.5s
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const TRACKING_FILE = path.join(process.cwd(), 'scripts', 'processed_ids.txt');
const GOOGLE_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbytvhi0V66NuS4mszxVLZbefV-H-WEnyNYSMBj4-hI5GJBsnnF4WfRoI5F1rxtuCjwP/exec";

if (!SUPABASE_URL || !SUPABASE_KEY) { console.error("Missing creds."); process.exit(1); }

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── CONFIG ──────────────────────────────────────────────
const CONCURRENCY = 3;      // parallel workers
const BATCH_SIZE = 20;     // records per DB fetch
const DELAY_MS = 1500;   // between records per worker
const FETCH_TIMEOUT_MS = 8000;
const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const JUNK = ['example.com', 'domain.com', 'yourname', 'name@', 'email@', 'sentry.io',
    'wixpress.com', 'wordpress.com', 'wpengine.com', '.png', '.jpg', '.svg',
    'test@', 'noreply', 'no-reply', 'changeme', 'placeholder'];

// ── TRACKING (in-memory + file) ────────────────────────
const processed = new Set(
    fs.existsSync(TRACKING_FILE)
        ? fs.readFileSync(TRACKING_FILE, 'utf8').split('\n').filter(Boolean)
        : []
);
function markDone(id) { processed.add(id); fs.appendFileSync(TRACKING_FILE, id + '\n'); }

// ── STATS ──────────────────────────────────────────────
let stats = { scanned: 0, found: 0, synced: 0, errors: 0 };
function logStats() {
    console.log(`\n📊  Scanned: ${stats.scanned} | Emails found: ${stats.found} | Synced to Sheet: ${stats.synced} | Errors: ${stats.errors}\n`);
}

// ── HELPERS ────────────────────────────────────────────
function cleanEmails(raw) {
    if (!raw) return [];
    return raw
        .map(e => e.toLowerCase())
        .filter(e => !JUNK.some(j => e.includes(j)) && e.includes('@') && e.includes('.'));
}

async function safeFetch(url, timeout = FETCH_TIMEOUT_MS) {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), timeout);
    try {
        const r = await fetch(url, {
            signal: c.signal,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        clearTimeout(t);
        if (!r.ok) return null;
        return await r.text();
    } catch { clearTimeout(t); return null; }
}

// ── SEARCH: DuckDuckGo ─────────────────────────────────
async function searchDDG(biz) {
    const q = encodeURIComponent(`${biz.name} ${biz.city} ${biz.trade} contact email`);
    const html = await safeFetch(`https://html.duckduckgo.com/html/?q=${q}`);
    if (!html || html.includes('Too Many Requests')) return null;

    // Direct emails in search snippets
    const emails = cleanEmails(html.match(EMAIL_RE));
    if (emails.length) return { email: emails[0] };

    // Extract first organic link
    const links = [...html.matchAll(/class="result__a" href="([^"]+)"/g)].map(m => m[1]);
    const good = links.filter(u => !IGNORED_DOMAINS.some(d => u.includes(d)));
    return good.length ? { website: good[0] } : null;
}

// ── SEARCH: Bing HTML ──────────────────────────────────
async function searchBing(biz) {
    const q = encodeURIComponent(`${biz.name} ${biz.city} email`);
    const html = await safeFetch(`https://www.bing.com/search?q=${q}&setlang=en`);
    if (!html) return null;

    const emails = cleanEmails(html.match(EMAIL_RE));
    if (emails.length) return { email: emails[0] };

    // Organic links
    const links = [...html.matchAll(/href="(https?:\/\/[^"]+)"/g)].map(m => m[1]);
    const good = links.filter(u => !IGNORED_DOMAINS.some(d => u.includes(d)) && !u.includes('bing.com') && !u.includes('microsoft.com'));
    return good.length ? { website: good[0] } : null;
}

// ── SEARCH: Yell.com ───────────────────────────────────
async function searchYell(biz) {
    const q = encodeURIComponent(`${biz.name}`);
    const loc = encodeURIComponent(biz.city || '');
    const html = await safeFetch(`https://www.yell.com/ucs/UcsSearchAction.do?keywords=${q}&location=${loc}`);
    if (!html) return null;

    const emails = cleanEmails(html.match(EMAIL_RE));
    if (emails.length) return { email: emails[0] };

    // Try to find a website link from the listing
    const siteMatch = html.match(/class="businessCapsule--callToAction"[^>]*href="(https?:\/\/[^"]+)"/);
    return siteMatch ? { website: siteMatch[1] } : null;
}

const IGNORED_DOMAINS = [
    'yell.com', 'facebook.com', 'yelp.co.uk', 'checkatrade.com', 'trustatrader.com',
    'thomsonlocal.com', 'instagram.com', 'linkedin.com', 'twitter.com', 'youtube.com',
    'duckduckgo.com', 'google.com', 'bing.com', 'microsoft.com', 'amazon.com', 'ebay.co.uk'
];

// ── SCRAPE A WEBSITE FOR EMAILS ────────────────────────
async function scrapeWebsite(url) {
    if (!url) return null;
    const base = url.startsWith('http') ? url : `https://${url}`;

    // Check homepage + common contact paths IN PARALLEL
    const paths = ['', '/contact', '/contact-us', '/about', '/about-us', '/legal', '/privacy'];
    const pages = await Promise.allSettled(
        paths.map(p => safeFetch(base.replace(/\/$/, '') + p, 6000))
    );

    for (const result of pages) {
        if (result.status !== 'fulfilled' || !result.value) continue;
        const html = result.value;

        // 1. mailto: links (most reliable)
        const mailtos = [...html.matchAll(/mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/gi)].map(m => m[1]);
        const cleanMailtos = cleanEmails(mailtos);
        if (cleanMailtos.length) return cleanMailtos[0];

        // 2. Regex scan
        const regex = cleanEmails(html.match(EMAIL_RE));
        if (regex.length) return regex[0];
    }

    return null;
}

// Domain guessing REMOVED — only verified emails from real web pages

// ── SYNC TO GOOGLE SHEETS ──────────────────────────────
async function syncToSheet(record) {
    try {
        const r = await fetch(GOOGLE_WEBAPP_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ record })
        });
        return (await r.text()) === 'Success';
    } catch { return false; }
}

// ── PROCESS ONE BUSINESS ───────────────────────────────
async function processBusiness(biz) {
    let website = biz.website;
    let email = null;

    // STRATEGY 1: If website exists, scrape it first (fastest path)
    if (website) {
        email = await scrapeWebsite(website);
        if (email) { return { email, website }; }
    }

    // STRATEGY 2: DuckDuckGo search
    const ddg = await searchDDG(biz);
    if (ddg?.email) return { email: ddg.email, website: ddg.website || website };
    if (ddg?.website && !website) website = ddg.website;

    // STRATEGY 3: Bing search
    if (!email) {
        const bing = await searchBing(biz);
        if (bing?.email) return { email: bing.email, website: bing.website || website };
        if (bing?.website && !website) website = bing.website;
    }

    // STRATEGY 4: Yell.com directory
    if (!email) {
        const yell = await searchYell(biz);
        if (yell?.email) return { email: yell.email, website: yell.website || website };
        if (yell?.website && !website) website = yell.website;
    }

    // STRATEGY 5: Scrape any newly discovered website
    if (!email && website && website !== biz.website) {
        email = await scrapeWebsite(website);
        if (email) return { email, website };
    }

    return { email: null, website };
}

// ── WORKER ─────────────────────────────────────────────
async function worker(id, queue) {
    for (const biz of queue) {
        if (processed.has(biz.id)) continue;
        try {
            process.stdout.write(`  [W${id}] ${biz.name} (${biz.city})... `);
            const result = await processBusiness(biz);

            const updateData = {};
            if (result.email) updateData.email = result.email;
            if (result.website && result.website !== biz.website) updateData.website = result.website;

            if (Object.keys(updateData).length) {
                const { error } = await supabase.from('businesses').update(updateData).eq('id', biz.id);
                if (!error && result.email) {
                    const ok = await syncToSheet({ ...biz, email: result.email, website: result.website });
                    console.log(`✅ ${result.guessed ? '(guessed) ' : ''}${result.email} ${ok ? '& SYNCED' : ''}`);
                    stats.found++; if (ok) stats.synced++;
                } else if (!error) {
                    console.log(`🌐 website saved`);
                } else {
                    console.log(`❌ DB error`); stats.errors++;
                }
            } else {
                console.log(`📤 nothing found`);
            }

            markDone(biz.id);
            stats.scanned++;
            await new Promise(r => setTimeout(r, DELAY_MS));
        } catch (e) {
            console.log(`❌ ${e.message}`); stats.errors++;
            markDone(biz.id);
        }
    }
}

// ── MAIN LOOP ──────────────────────────────────────────
async function run() {
    console.log(`\n⚡ TURBO Email Enrichment v2`);
    console.log(`   ${CONCURRENCY} parallel workers | batch ${BATCH_SIZE} | ${DELAY_MS}ms delay`);
    console.log(`   Sources: DuckDuckGo + Bing + Yell.com + Website Scrape + Domain Guess`);
    console.log(`   Already processed: ${processed.size} records\n`);

    const ok = await syncToSheet({ name: 'Turbo Test', city: 'Worker', email: 'test@test.com' });
    console.log(ok ? '📡 Google Sheets: Connected\n' : '⚠️  Google Sheets: NOT connected\n');

    while (true) {
        try {
            const { count: remaining } = await supabase
                .from('businesses').select('*', { count: 'exact', head: true })
                .eq('country_code', 'GB').is('email', null);

            if (!remaining || remaining === 0) { console.log('🏁 ALL DONE!'); break; }

            const offset = remaining > BATCH_SIZE ? Math.floor(Math.random() * (remaining - BATCH_SIZE)) : 0;

            const { data: listings, error } = await supabase
                .from('businesses')
                .select('id, name, city, trade, website, address, phone')
                .eq('country_code', 'GB').is('email', null)
                .range(offset, offset + BATCH_SIZE - 1);

            if (error) { console.error('❌ DB:', error.message); await new Promise(r => setTimeout(r, 30000)); continue; }

            const batch = listings.filter(l => !processed.has(l.id));
            if (!batch.length) { await new Promise(r => setTimeout(r, 5000)); continue; }

            console.log(`📦 Batch ${batch.length} records (${remaining} remaining without email)`);

            // Split batch across workers
            const chunks = Array.from({ length: CONCURRENCY }, () => []);
            batch.forEach((b, i) => chunks[i % CONCURRENCY].push(b));

            await Promise.allSettled(chunks.map((chunk, i) => worker(i + 1, chunk)));
            logStats();

        } catch (e) {
            console.error('❌ Loop:', e.message);
            await new Promise(r => setTimeout(r, 10000));
        }
    }
}

run().catch(e => { console.error('💀', e); process.exit(1); });
