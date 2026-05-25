const fs = require('fs');
const path = require('path');
const dns = require('dns').promises;
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from the .env file in the root
dotenv.config({ path: path.join(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const COMPANIES_HOUSE_API_KEY = process.env.COMPANIES_HOUSE_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Error: Missing Supabase configuration in .env.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const API_BASE = "https://api.company-information.service.gov.uk";

// Keyset pagination progress file to allow resuming audits
const PROGRESS_FILE = path.join(__dirname, 'audit_progress.json');

// Parse CLI Arguments
const args = process.argv.slice(2);
const regionArg = args.find(arg => arg.startsWith('--region='));
const targetRegion = regionArg ? regionArg.split('=')[1].toUpperCase() : 'GB'; // Default to GB (UK)

const limitArg = args.find(arg => arg.startsWith('--limit='));
const maxListings = limitArg ? parseInt(limitArg.split('=')[1], 10) : 500; // Batch limit per run

const resumeArg = args.includes('--resume');

// Normalizes name for matching
function normalize(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Matches businesses by name and postcode
function scoreCompanyMatch(item, businessName, postcode) {
    const title = normalize(item.title);
    const target = normalize(businessName);
    
    let nameScore = 0.25;
    if (title === target) {
        nameScore = 0.75;
    } else if (title.includes(target) || target.includes(title)) {
        nameScore = 0.55;
    }

    const addressSnippet = normalize(item.address_snippet || "");
    const postcodeScore = postcode && addressSnippet.includes(normalize(postcode)) ? 0.2 : 0;
    const activeScore = item.company_status === "active" ? 0.05 : 0;

    return Math.min(1, Number((nameScore + postcodeScore + activeScore).toFixed(2)));
}

// Companies House Fetch using Basic Auth
async function companiesHouseFetch(endpoint) {
    const authString = Buffer.from(`${COMPANIES_HOUSE_API_KEY}:`).toString('base64');
    const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
            'Authorization': `Basic ${authString}`,
            'Accept': 'application/json'
        }
    });

    if (response.status === 429) {
        console.log('   ⏳ Companies House Rate limit hit. Sleeping for 5 seconds...');
        await new Promise(r => setTimeout(r, 5000));
        return companiesHouseFetch(endpoint);
    }

    return response;
}

// Companies House lookup logic
async function checkCompaniesHouse(businessName, postcode) {
    if (!COMPANIES_HOUSE_API_KEY) {
        return { status: 'skipped', confidence: 0, registryId: null, raw: {} };
    }

    try {
        const url = `/search/companies?q=${encodeURIComponent(businessName)}&items_per_page=3`;
        const res = await companiesHouseFetch(url);
        
        if (!res.ok) {
            return { status: 'error', confidence: 0, registryId: null, raw: { httpStatus: res.status } };
        }

        const data = await res.json();
        const items = data.items || [];
        
        const matches = items.map(item => ({
            item,
            confidence: scoreCompanyMatch(item, businessName, postcode)
        })).sort((a, b) => b.confidence - a.confidence);

        const best = matches[0];
        if (!best || best.confidence < 0.7) {
            return { status: 'not_found', confidence: best ? best.confidence : 0, registryId: null, raw: data };
        }

        const status = best.item.company_status === 'active' ? 'active' : best.item.company_status === 'dissolved' ? 'dissolved' : 'inactive';
        return {
            status,
            confidence: best.confidence,
            registryId: best.item.company_number,
            raw: best.item
        };
    } catch (e) {
        return { status: 'error', confidence: 0, registryId: null, raw: { error: e.message } };
    }
}

// DNS & Web verification (requires no API keys)
async function verifyOnlinePresence(email, website) {
    let emailActive = false;
    let websiteActive = false;

    if (email && email.includes('@')) {
        const domain = email.split('@')[1].trim();
        try {
            // Check domain mail exchange (MX) servers
            const mx = await dns.resolveMx(domain);
            emailActive = mx && mx.length > 0;
        } catch (e) {
            emailActive = false;
        }
    }

    if (website && website.trim().length > 0) {
        let cleanUrl = website.trim();
        if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
            cleanUrl = 'https://' + cleanUrl;
        }
        try {
            const urlObj = new URL(cleanUrl);
            await dns.lookup(urlObj.hostname);
            websiteActive = true;
        } catch (e) {
            websiteActive = false;
        }
    }

    return {
        emailActive,
        websiteActive,
        active: emailActive || websiteActive
    };
}

// Keyset pagination helper: loads/saves progress
function loadProgress() {
    if (resumeArg && fs.existsSync(PROGRESS_FILE)) {
        try {
            return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
        } catch (e) {
            console.error('Failed to parse progress file, starting fresh.');
        }
    }
    return { lastId: null, processedCount: 0 };
}

function saveProgress(progress) {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf8');
}

async function runAudit() {
    const isUS = targetRegion === 'US';
    const progress = loadProgress();

    console.log('========================================================');
    console.log('🚀 Starting Enterprise Listing Operation Audit');
    console.log(`🌐 Target Region:       ${targetRegion} (${isUS ? 'USA Side' : 'UK Side'})`);
    console.log(`📈 Max Batch Size:     ${maxListings} listings`);
    console.log(`🔄 Mode:                ${resumeArg ? 'Resuming Previous Run' : 'New Run'}`);
    console.log('========================================================\n');

    if (!isUS && !COMPANIES_HOUSE_API_KEY) {
        console.log('ℹ️ Info: COMPANIES_HOUSE_API_KEY is not set.');
        console.log('👉 System will run a high-performance DNS & Web Presence audit instead!\n');
    }

    console.log(`Querying database (Keyset pagination starting from ID: ${progress.lastId || 'First Listing'})...`);
    
    // Keyset pagination: highly optimized query that scales to millions of rows without statement timeouts
    let query = supabase
        .from('businesses')
        .select('id, name, city, postcode, trade, verified, email, website, country_code')
        .order('id', { ascending: true })
        .limit(maxListings);

    // Filter by region / country code
    if (isUS) {
        query = query.eq('country_code', 'US');
    } else {
        query = query.or('country_code.eq.GB,country_code.eq.UK,postcode.not.is.null');
    }

    // Apply keyset pagination offset
    if (progress.lastId) {
        query = query.gt('id', progress.lastId);
    }

    const { data: businesses, error } = await query;

    if (error) {
        console.error('❌ Error fetching listings:', error.message);
        return;
    }

    if (!businesses || businesses.length === 0) {
        console.log('🎉 No remaining listings to audit for this region!');
        if (fs.existsSync(PROGRESS_FILE)) fs.unlinkSync(PROGRESS_FILE);
        return;
    }

    console.log(`Loaded ${businesses.length} businesses for this batch.\n`);

    const stats = { active: 0, inactive: 0, skipped: 0, totalAudited: 0 };

    for (const biz of businesses) {
        stats.totalAudited++;
        console.log(`[${progress.processedCount + stats.totalAudited}/${progress.processedCount + businesses.length}] Auditing ${biz.name} (${biz.trade} in ${biz.city})...`);

        let isActive = false;
        let auditMethod = 'DNS/Web';
        let detailMsg = '';

        if (!isUS && COMPANIES_HOUSE_API_KEY) {
            // UK Registry Lookup
            const match = await checkCompaniesHouse(biz.name, biz.postcode);
            auditMethod = 'Companies House';
            
            if (match.status === 'active') {
                isActive = true;
                detailMsg = `Active in Registry (Match Confidence: ${match.confidence})`;
                stats.active++;
            } else if (match.status === 'dissolved') {
                detailMsg = 'Company Dissolved';
                stats.inactive++;
            } else if (match.status === 'inactive') {
                detailMsg = 'Company Inactive';
                stats.inactive++;
            } else {
                detailMsg = 'Company Registry Not Found';
                stats.inactive++;
            }
            
            // Log in Supabase
            try {
                await supabase.from('enrichment_runs').insert({
                    region: 'UK',
                    business_id: biz.id,
                    run_type: 'companies_house_lookup',
                    status: match.status === 'not_found' ? 'skipped' : 'succeeded',
                    message: `Companies House returned ${match.status}`,
                    result: { registry_id: match.registryId, status: match.status, confidence: match.confidence }
                });
            } catch (dbErr) {
                // Non-blocking log error
            }

        } else {
            // DNS & Web Presence Audit (Works for both UK & US!)
            const presence = await verifyOnlinePresence(biz.email, biz.website);
            if (presence.active) {
                isActive = true;
                detailMsg = `Operational (Email: ${presence.emailActive ? 'Active' : 'Inactive'}, Web: ${presence.websiteActive ? 'Resolving' : 'Unresponsive'})`;
                stats.active++;
            } else {
                detailMsg = 'Unresponsive (DNS lookup & MX records failed)';
                stats.inactive++;
            }
        }

        console.log(`   [${auditMethod}] Status: ${isActive ? '✅ ACTIVE' : '❌ INACTIVE'} — ${detailMsg}`);

        // Update database verified status live
        try {
            await supabase
                .from('businesses')
                .update({
                    verified: isActive,
                    verified_at: isActive ? new Date().toISOString() : null,
                    claim_status: isActive ? 'unclaimed' : 'inactive'
                })
                .eq('id', biz.id);
            
            console.log(`   💾 Database verified status updated.`);
        } catch (dbErr) {
            console.error(`   ❌ Failed to update verified status in Supabase:`, dbErr.message);
        }

        // Save progress details to allow safe resume
        progress.lastId = biz.id;
        progress.processedCount++;
        saveProgress(progress);

        // Delay between queries to prevent overloading DNS / APIs
        await new Promise(r => setTimeout(r, 150));
    }

    console.log('\n========================================================');
    console.log('📊 BATCH AUDIT REPORT SUMMARY');
    console.log('========================================================');
    console.log(`⭐ Active / Operational:  ${stats.active}`);
    console.log(`❌ Offline / Inactive:   ${stats.inactive}`);
    console.log(`📈 Progress in Region:   ${progress.processedCount} total audited`);
    console.log('========================================================');
    console.log('💡 Tip: To process the next batch, run the command again adding the --resume flag.\n');
}

runAudit();
