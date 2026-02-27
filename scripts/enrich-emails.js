/**
 * scripts/enrich-emails.js
 * 
 * Objective: Continuously scan Supabase for UK listings missing emails,
 * search the web (DuckDuckGo/Directories) to find their website or contact info,
 * scrape for their email address, and sync to BOTH Supabase and Google Sheets.
 * 
 * NOTE: This version uses a local file (processed_ids.txt) for tracking.
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

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing Supabase credentials.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Config
const BATCH_SIZE = 5;
const DELAY_BETWEEN_RECORDS = 5000;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// Ensure tracking file exists
if (!fs.existsSync(TRACKING_FILE)) {
    fs.writeFileSync(TRACKING_FILE, '');
}

function isProcessed(id) {
    const content = fs.readFileSync(TRACKING_FILE, 'utf8');
    return content.includes(id);
}

function markAsProcessed(id) {
    fs.appendFileSync(TRACKING_FILE, `${id}\n`);
}

/**
 * Strategy 1: Find Website/Profile URL via DuckDuckGo (Free)
 */
async function searchBusiness(biz) {
    try {
        // We search for the business name + contact to find emails or their site
        const query = encodeURIComponent(`${biz.name} ${biz.city} ${biz.trade} contact email`);
        const ddgUrl = `https://html.duckduckgo.com/html/?q=${query}`;

        const response = await fetch(ddgUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });

        if (!response.ok) return null;
        const html = await response.text();

        if (html.includes("Too Many Requests")) {
            console.log(`   (Search Rate Limited)`);
            return null;
        }

        // 1. Look for emails DIRECTLY in search results (sometimes they are in descriptions)
        const directEmails = html.match(EMAIL_REGEX);
        if (directEmails) {
            const filtered = directEmails.filter(e => !e.includes('duckduckgo') && !e.includes('example.com'));
            if (filtered.length > 0) return { email: filtered[0].toLowerCase() };
        }

        // 2. Extract organic links
        const linkMatches = [...html.matchAll(/class="result__a" href="([^"]+)"/g)];
        const validLinks = linkMatches.map(m => m[1]).filter(url => {
            const ignored = ['yell.com', 'facebook.com', 'yelp.co.uk', 'checkatrade.com', 'trustatrader.com', 'thomsonlocal.com', 'instagram.com', 'linkedin.com', 'twitter.com', 'youtube.com'];
            return !ignored.some(domain => url.includes(domain));
        });

        return validLinks.length > 0 ? { website: validLinks[0] } : null;
    } catch (err) {
        console.log(`   (Search Error: ${err.message})`);
    }
    return null;
}

async function findEmailsOnPage(url) {
    if (!url) return null;
    try {
        const targetUrl = url.startsWith('http') ? url : `https://${url}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(targetUrl, {
            signal: controller.signal,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        clearTimeout(timeout);

        if (!response.ok) return null;
        const html = await response.text();

        const matches = html.match(EMAIL_REGEX);
        if (matches) {
            const validEmails = matches.filter(e => {
                const lower = e.toLowerCase();
                return !lower.endsWith('.png') &&
                    !lower.endsWith('.jpg') &&
                    !lower.includes('example.com') &&
                    !lower.includes('domain.com') &&
                    !lower.includes('yourname') &&
                    !lower.includes('name@') &&
                    !lower.includes('email@') &&
                    !lower.includes('sentry.io');
            });
            return validEmails.length > 0 ? validEmails[0].toLowerCase() : null;
        }
    } catch (err) {
        // Fail silently
    }
    return null;
}

async function scrapeWebsite(url) {
    if (!url) return null;
    const baseUrl = url.startsWith('http') ? url : `https://${url}`;

    let email = await findEmailsOnPage(baseUrl);
    if (email) return email;

    const paths = ['/contact', '/contact-us', '/about', '/about-us', '/legal'];
    for (const p of paths) {
        const fullPath = baseUrl.replace(/\/$/, '') + p;
        process.stdout.write(`.`);
        email = await findEmailsOnPage(fullPath);
        if (email) return email;
    }
    return null;
}

async function syncToGoogleSheets(record) {
    try {
        const response = await fetch(GOOGLE_WEBAPP_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ record })
        });
        const result = await response.text();
        return result === "Success";
    } catch (err) {
        return false;
    }
}

// Test Google Sheets Connection
async function testSync() {
    console.log("📡 Testing Google Sheets connection...");
    const ok = await syncToGoogleSheets({ name: "Connection Test", city: "Worker", email: "test@example.com" });
    if (ok) console.log("✅ Sync connection active.");
    else console.warn("⚠️ Warning: Google Sheets sync failed. Check your Webapp URL.");
}

async function runEnrichment() {
    console.log("\n--- 🔍 Advanced Enrichment & Sheets Sync Started ---");
    console.log(`Targeting: Businesses with NO email\n`);

    await testSync();

    while (true) {
        try {
            // Get total count of potential targets to pick a random offset
            const { count: totalNulls } = await supabase
                .from('businesses')
                .select('*', { count: 'exact', head: true })
                .eq('country_code', 'GB')
                .is('email', null);

            const randomOffset = totalNulls > BATCH_SIZE * 10
                ? Math.floor(Math.random() * (totalNulls - BATCH_SIZE * 10))
                : 0;

            const { data: listings, error } = await supabase
                .from('businesses')
                .select('id, name, city, trade, website, address, phone')
                .eq('country_code', 'GB')
                .is('email', null)
                .range(randomOffset, randomOffset + (BATCH_SIZE * 5));

            if (error) {
                console.error("❌ DB Query Error:", error.message);
                await new Promise(r => setTimeout(r, 60000));
                continue;
            }

            const unprocessed = listings.filter(l => !isProcessed(l.id)).slice(0, BATCH_SIZE);

            if (unprocessed.length === 0) {
                console.log("📭 Queue clean. Waiting for new listings...");
                await new Promise(r => setTimeout(r, 60000));
                continue;
            }

            console.log(`📦 Processing ${unprocessed.length} records...`);

            for (const biz of unprocessed) {
                try {
                    process.stdout.write(`   [${biz.name}] in ${biz.city}... `);

                    let targetWebsite = biz.website;
                    let foundEmail = null;

                    // STEP 1: Search Search Search
                    const searchResult = await searchBusiness(biz);
                    if (searchResult) {
                        if (searchResult.email) foundEmail = searchResult.email;
                        if (searchResult.website && !targetWebsite) targetWebsite = searchResult.website;
                    }

                    // STEP 2: Scrape Website (if found or already existing)
                    if (!foundEmail && targetWebsite) {
                        foundEmail = await scrapeWebsite(targetWebsite);
                    }

                    // STEP 3: Update and Sync
                    if (foundEmail || (targetWebsite && targetWebsite !== biz.website)) {
                        const updateData = {};
                        if (foundEmail) updateData.email = foundEmail;
                        if (targetWebsite && !biz.website) updateData.website = targetWebsite;

                        const { error: updateError } = await supabase
                            .from('businesses')
                            .update(updateData)
                            .eq('id', biz.id);

                        if (!updateError) {
                            if (foundEmail) {
                                // CRITICAL: Sync to Google Sheets NOW
                                const synced = await syncToGoogleSheets({ ...biz, email: foundEmail, website: targetWebsite });
                                process.stdout.write(`✅ EMAIL SAVED ${synced ? "& SYNCED" : "(Sync failed)"}: ${foundEmail}\n`);
                            } else {
                                process.stdout.write(`✅ WEBSITE SAVED (No email yet)\n`);
                            }
                        }
                    } else {
                        process.stdout.write(`📤 No email found.\n`);
                    }

                    markAsProcessed(biz.id);
                    await new Promise(r => setTimeout(r, DELAY_BETWEEN_RECORDS));
                } catch (bizErr) {
                    console.log(`❌ Error processing business ${biz.name}: ${bizErr.message}`);
                }
            }
        } catch (loopErr) {
            console.error("❌ Critical Loop Error:", loopErr.message);
            await new Promise(r => setTimeout(r, 10000));
        }
    }
}

runEnrichment().catch(err => {
    console.error("❌ Fatal enrichment error:", err);
    process.exit(1);
});
