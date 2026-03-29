
import axios from 'axios';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// --- Configuration ---
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ Missing Supabase credentials.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- Priority Regions (Scotland, Wales, NI) ---
const PRIORITY_CITIES = new Set([
    // Scotland
    "Glasgow", "Edinburgh", "Aberdeen", "Dundee", "Inverness", "Perth", "Stirling", "Paisley",
    "East Kilbride", "Livingston", "Hamilton", "Cumbernauld", "Dunfermline", "Kirkcaldy", "Ayr",
    "Dumfries", "Falkirk", "Kilmarnock", "Motherwell", "Coatbridge", "Clydebank", "Greenock", "Glenrothes",
    // Wales
    "Cardiff", "Swansea", "Newport", "Wrexham", "Bangor", "St Asaph", "St Davids",
    "Llandudno", "Rhyl", "Caerphilly", "Bridgend", "Merthyr Tydfil", "Cwmbran", "Barry",
    "Llanelli", "Neath", "Port Talbot",
    // Northern Ireland
    "Belfast", "Derry", "Lisburn", "Bangor", "Newry", "Armagh", "Coleraine", "Londonderry", "Omagh", "Enniskillen"
]);

// --- Trade Mapping (Singular Slug -> Thomson Pulral/URL) ---
const TRADE_MAPPING: Record<string, string> = {
    "plumber": "plumbers",
    "electrician": "electricians",
    "locksmith": "locksmiths",
    "gas-engineer": "gas-engineers",
    "drain-specialist": "drain-clearance", // or drain-companies
    "glazier": "glaziers",
    "roofer": "roofers",
    "builder": "builders",
    "water-restoration": "water-damage", // approximate
    "breakdown": "breakdown-recovery",
    "hvac": "air-conditioning", // check if reliable
};

// --- Helper Functions ---

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function cleanPhone(phone: string): string {
    return phone.replace(/\s+/g, '').replace(/^(\+44)/, '0');
}

function isRealUKPhone(phone: string): boolean {
    const p = cleanPhone(phone);
    // UK Landline (01, 02) or Mobile (07)
    // Avoid 0800 freephone if possible, but they are real businesses.
    // Length is usually 11 digits (0xxxx xxxxxx)
    return /^0\d{10}$/.test(p);
}

function toUUID(str: string): string {
    // Deterministic UUID-like string generation
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    const hex = Math.abs(hash).toString(16).padStart(32, '0');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

// --- Scraper Logic ---

async function scrapeThomson(city: string, trade: string, slugTrade: string): Promise<any[]> {
    const url = `https://www.thomsonlocal.com/search/${slugTrade}/${city}`;
    console.log(`\n🔍 Scraping: ${url}`);

    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-GB,en;q=0.9',
            }
        });

        const $ = cheerio.load(data);
        const results: any[] = [];

        $('.listing').each((_, el) => {
            const name = $(el).find('.businessName').text().trim();
            const phoneText = $(el).find('.phoneCont').first().text().trim();
            const phone = cleanPhone(phoneText);

            // Address parts
            const street = $(el).find('[itemprop="streetAddress"]').text().trim();
            const locality = $(el).find('[itemprop="addressLocality"]').text().trim();
            const postcode = $(el).find('[itemprop="postalCode"]').text().trim();
            const address = [street, locality, postcode].filter(Boolean).join(', ');

            const website = $(el).find('a[data-yext="url"]').attr('href');

            if (name && isRealUKPhone(phone)) {
                results.push({ name, phone, address, website, city: locality || city, postcode });
            }
        });

        console.log(`   ✅ Found ${results.length} valid listings.`);
        return results;

    } catch (error: any) {
        if (error.response?.status === 403) {
            console.error("   ⛔ BLOCKED (403). Waiting 60s...");
            await sleep(60000);
        } else if (error.response?.status === 404) {
            console.log("   ❌ Page not found (404).");
        } else {
            console.error(`   ⚠️ Error: ${error.message}`);
        }
        return [];
    }
}

async function main() {
    console.log("🚀 STARTING AUTOMATED UK GAP FILLER (THOMSON MODE)");
    console.log("   Target: Fill pages to 5 listings. Priority: Scotland, Wales, NI.");

    // 1. Load Audit Report
    const reportPath = path.resolve(__dirname, '../uk_audit_report.json'); // Corrected path to root
    // Or simpler: just use hardcoded Gap check logic if report missing?
    // Let's assume report is usually fresh or generate on fly. 
    // For "Continuous Completion", better to rely on what we just ran.
    let gaps: any[] = [];

    if (fs.existsSync(reportPath)) {
        const audit = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        gaps = audit.gaps || [];
    } else {
        console.error("❌ Audit report not found. Run audit script first.");
        process.exit(1);
    }

    console.log(`   Total Gaps Found: ${gaps.length}`);

    // 2. Sort Gaps
    gaps.sort((a, b) => {
        const aPrio = PRIORITY_CITIES.has(a.city) ? 2 : (a.city === 'London' ? 0 : 1);
        const bPrio = PRIORITY_CITIES.has(b.city) ? 2 : (b.city === 'London' ? 0 : 1);
        return bPrio - aPrio; // Descending priority (2 > 1 > 0)
    });

    // 3. Process Gaps
    let totalFilled = 0;

    for (const gap of gaps) {
        const { city, trade, current, needed } = gap;
        if (needed <= 0) continue;

        const thomsonSlug = TRADE_MAPPING[trade];
        if (!thomsonSlug) {
            console.log(`   ⚠️ No Thomson mapping for trade: ${trade}. Skipping.`);
            continue;
        }

        console.log(`\n🎯 Processing: ${city} > ${trade} (Needs ${needed})`);

        // Scrape
        const listings = await scrapeThomson(city, trade, thomsonSlug);

        // Insert
        let addedForThisGap = 0;
        for (const biz of listings) {
            if (addedForThisGap >= needed) break;

            // Check Dupes
            const { data: existing } = await supabase
                .from('businesses')
                .select('id')
                .eq('phone', biz.phone)
                .single();

            if (!existing) {
                // Insert
                const uniqueId = `manual-scrape-${biz.name}-${biz.city}-${biz.phone}`.toLowerCase().replace(/[^a-z0-9]/g, '');
                const uuid = toUUID(uniqueId);
                const slug = `${biz.name}-${biz.city}-${uuid.substring(0, 8)}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');

                const payload = {
                    id: uuid,
                    name: biz.name,
                    slug: slug,
                    trade: trade,
                    city: gap.city, // Use expected city name to ensure it fills the gap correctly
                    phone: biz.phone,
                    address: biz.address,
                    postcode: biz.postcode,
                    website: biz.website,
                    country_code: 'GB',
                    verified: true,
                    tier: 'basic',
                    created_at: new Date().toISOString()
                };

                const { error } = await supabase.from('businesses').insert(payload);
                if (!error) {
                    console.log(`      + Added: ${biz.name}`);
                    addedForThisGap++;
                    totalFilled++;
                } else {
                    console.error(`      ❌ Insert Error: ${error.message}`);
                }
            } else {
                console.log(`      • Exists: ${biz.name}`);
            }
        }

        // Delay to be polite
        const delay = Math.floor(Math.random() * 3000) + 2000;
        await sleep(delay);
    }

    console.log("\n🏁 SCRAPING COMPLETE");
    console.log(`   Total New Listings Added: ${totalFilled}`);
}

main();
