
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; // This is a service role key in this environment

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

const LOG_FILE = 'scripts/link_audit_log.json';
const BATCH_SIZE = 100;
const DRY_RUN = process.env.DRY_RUN === 'true' || false;
const MAX_SCAN = process.env.MAX_SCAN ? parseInt(process.env.MAX_SCAN) : Infinity;

const PLATFORM_DOMAINS = [
  'emergency-tradesmen.com',
  'emergencycontractors.net',
  'emergencytradesmen.net',
  'localhost'
];

async function validateLink(url) {
  if (!url) return { valid: false, reason: 'Empty URL' };
  
  // Basic format check
  if (!url.startsWith('http')) {
    return { valid: false, reason: 'Invalid format (missing http/https)' };
  }

  try {
    const response = await axios.head(url, {
      timeout: 10000,
      maxRedirects: 5,
      validateStatus: (status) => status >= 200 && status < 400,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    // Check for redirect loop or redirect back to platform
    const finalUrl = response.request.res.responseUrl || url;
    const isPlatformRedirect = PLATFORM_DOMAINS.some(domain => finalUrl.includes(domain));
    
    // If the input URL is already a platform URL, it's invalid as an "external" link
    const isInputPlatform = PLATFORM_DOMAINS.some(domain => url.includes(domain));

    if (isPlatformRedirect && !isInputPlatform) {
      return { valid: false, reason: 'Redirected back to platform domain', finalUrl };
    }
    
    if (isInputPlatform) {
      return { valid: false, reason: 'Points to platform domain', finalUrl };
    }

    return { valid: true, finalUrl };
  } catch (error) {
    const status = error.response ? error.response.status : null;
    const isUncertain = status === 403 || status === 429 || error.code === 'ECONNABORTED';

    // If HEAD fails, try GET as some servers block HEAD
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        maxRedirects: 5,
        validateStatus: (status) => status >= 200 && status < 400,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      const finalUrl = response.request.res.responseUrl || url;
      const isPlatformRedirect = PLATFORM_DOMAINS.some(domain => finalUrl.includes(domain));
      
      if (isPlatformRedirect && !url.includes(PLATFORM_DOMAINS[0])) {
        return { valid: false, reason: 'Redirected back to platform domain (GET)', finalUrl };
      }
      
      return { valid: true, finalUrl };
    } catch (getInnerError) {
      const getStatus = getInnerError.response ? getInnerError.response.status : null;
      const isStillUncertain = getStatus === 403 || getStatus === 429 || getInnerError.code === 'ECONNABORTED';

      return { 
        valid: false, 
        uncertain: isStillUncertain,
        reason: getInnerError.response ? `HTTP ${getInnerError.response.status}` : getInnerError.message 
      };
    }
  }
}

async function runAudit() {
  console.log('--- Starting Link Audit Orchestrator ---');
  let offset = 0;
  let totalProcessed = 0;
  let totalBroken = 0;
  let totalUpdated = 0;
  const startTime = Date.now();

  const auditResults = {
    timestamp: new Date().toISOString(),
    scanned: 0,
    broken: [],
    updated: [],
    manualReview: []
  };

  while (true) {
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('id, name, website, social_links')
      .range(offset, offset + BATCH_SIZE - 1);

    if (error) {
      console.error('Error fetching businesses:', error);
      break;
    }

    if (!businesses || businesses.length === 0) break;

    // Process batch in parallel with a concurrency limit
    const CONCURRENCY = 10;
    const processBusiness = async (biz) => {
      totalProcessed++;
      const updates = {};
      let needsUpdate = false;

      // 1. Check Website
      if (biz.website) {
        console.log(`[Checking Website] ${biz.name}: ${biz.website}`);
        const result = await validateLink(biz.website);
        if (!result.valid) {
          if (result.uncertain) {
            console.log(`[Uncertain Website] ${biz.name}: ${biz.website} (${result.reason}) - Flagging for review`);
            auditResults.manualReview.push({ id: biz.id, name: biz.name, type: 'website', url: biz.website, reason: result.reason });
          } else {
            console.log(`[Broken Website] ${biz.name}: ${biz.website} (${result.reason})`);
            updates.website = null; // Remove broken website
            needsUpdate = true;
            auditResults.broken.push({ id: biz.id, name: biz.name, type: 'website', url: biz.website, reason: result.reason });
          }
        } else {
          console.log(`[Valid Website] ${biz.name}: ${biz.website}`);
        }
      }

      // 2. Check Social Links
      if (biz.social_links && typeof biz.social_links === 'object' && Object.keys(biz.social_links).length > 0) {
        const newSocials = { ...biz.social_links };
        let socialNeedsUpdate = false;

        for (const [platform, url] of Object.entries(biz.social_links)) {
          if (!url) continue;
          console.log(`[Checking Social] ${biz.name} - ${platform}: ${url}`);
          const result = await validateLink(url);
          if (!result.valid) {
            if (result.uncertain) {
              console.log(`[Uncertain Social] ${biz.name} - ${platform}: ${url} (${result.reason}) - Flagging for review`);
              auditResults.manualReview.push({ id: biz.id, name: biz.name, type: platform, url: url, reason: result.reason });
            } else {
              console.log(`[Broken Social] ${biz.name} - ${platform}: ${url} (${result.reason})`);
              delete newSocials[platform];
              socialNeedsUpdate = true;
              auditResults.broken.push({ id: biz.id, name: biz.name, type: platform, url: url, reason: result.reason });
            }
          } else {
            console.log(`[Valid Social] ${biz.name} - ${platform}: ${url}`);
          }
        }

        if (socialNeedsUpdate) {
          updates.social_links = newSocials;
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        if (DRY_RUN) {
          console.log(`[DRY RUN] Would update ${biz.name} with:`, JSON.stringify(updates));
          totalUpdated++;
          auditResults.updated.push({ id: biz.id, name: biz.name, changes: updates, dryRun: true });
        } else {
          const { error: updateError } = await supabase
            .from('businesses')
            .update(updates)
            .eq('id', biz.id);

          if (updateError) {
            console.error(`Failed to update ${biz.name}:`, updateError);
          } else {
            totalUpdated++;
            auditResults.updated.push({ id: biz.id, name: biz.name, changes: updates });
          }
        }
      }
    };

    // Parallelize within the batch
    for (let i = 0; i < businesses.length; i += CONCURRENCY) {
      const chunk = businesses.slice(i, i + CONCURRENCY);
      await Promise.all(chunk.map(biz => processBusiness(biz)));
      if (totalProcessed >= MAX_SCAN) break;
    }

    if (totalProcessed >= MAX_SCAN) break;

    offset += BATCH_SIZE;
    console.log(`Processed ${totalProcessed} listings...`);
  }

  auditResults.scanned = totalProcessed;
  fs.writeFileSync(LOG_FILE, JSON.stringify(auditResults, null, 2));

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('\n--- Audit Results ---');
  console.log(`Total Scanned: ${totalProcessed}`);
  console.log(`Total Updated (Broken Removed): ${totalUpdated}`);
  console.log(`Duration: ${duration}s`);
  console.log(`Results saved to ${LOG_FILE}`);
}

runAudit().catch(err => {
  console.error('Critical audit error:', err);
  process.exit(1);
});
