import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

// ---------- UK → US TERMINOLOGY MAP ----------
const termSwaps = [
    // Trades / People
    [/\btradesmen\b/gi, 'contractors'],
    [/\btradesman\b/gi, 'contractor'],
    [/\btradespeople\b/gi, 'contractors'],
    [/\btradesperson\b/gi, 'contractor'],
    [/\bgas engineer\b/gi, 'HVAC technician'],
    [/\bGas Engineer\b/g, 'HVAC Technician'],
    [/\bgas safe register\b/gi, 'state HVAC licensing board'],
    [/\bGas Safe Register\b/g, 'State HVAC Licensing Board'],
    [/\bgas safe registered\b/gi, 'licensed HVAC'],
    [/\bconsumer unit\b/gi, 'breaker panel'],
    [/\bConsumer Unit\b/g, 'Breaker Panel'],
    [/\bfuse box\b/gi, 'breaker panel'],
    [/\bFuse Box\b/g, 'Breaker Panel'],
    [/\bfusebox\b/gi, 'breaker panel'],
    [/\bboiler\b/gi, 'furnace'],
    [/\bBoiler\b/g, 'Furnace'],
    [/\bEICR\b/g, 'electrical inspection'],
    [/\bPart P\b/g, 'NEC code'],
    [/\bBS 7671\b/g, 'NEC (National Electrical Code)'],

    // Infrastructure
    [/\bcouncil\b/gi, 'city'],
    [/\bCouncil\b/g, 'City'],
    [/\blocal authority\b/gi, 'local government'],
    [/\bLocal Authority\b/g, 'Local Government'],
    [/\bmains supply\b/gi, 'utility supply'],
    [/\bmains water\b/gi, 'city water'],
    [/\bthe mains\b/gi, 'the utility supply'],
    [/\bstopcock\b/gi, 'main shut-off valve'],
    [/\bStopcock\b/g, 'Main Shut-Off Valve'],

    // Money / Units
    [/£(\d)/g, '$$$1'],
    [/\bpence\b/gi, 'cents'],
    [/\bVAT\b/g, 'sales tax'],
    [/\blitre/gi, 'liter'],
    [/\bmetre/gi, 'meter'],
    [/\bcentimetre/gi, 'centimeter'],
    [/\bkilometre/gi, 'kilometer'],

    // Spelling
    [/\bcolour\b/gi, 'color'],
    [/\bfavourite\b/gi, 'favorite'],
    [/\bhonour\b/gi, 'honor'],
    [/\blocalised\b/gi, 'localized'],
    [/\borganisation\b/gi, 'organization'],
    [/\brecognise\b/gi, 'recognize'],
    [/\bspecialise\b/gi, 'specialize'],
    [/\bminimise\b/gi, 'minimize'],
    [/\bmaximise\b/gi, 'maximize'],
    [/\boptimise\b/gi, 'optimize'],
    [/\banalyse\b/gi, 'analyze'],
    [/\bauthorised\b/gi, 'authorized'],
    [/\bcategorise\b/gi, 'categorize'],
    [/\bcentralised\b/gi, 'centralized'],
    [/\bdraught\b/gi, 'draft'],
    [/\bdraughts\b/gi, 'drafts'],
    [/\benquir/gi, 'inquir'],
    [/\bfibre\b/gi, 'fiber'],
    [/\bfuel\b/gi, 'fuel'],
    [/\bgrey\b/gi, 'gray'],
    [/\bjudgement\b/gi, 'judgment'],
    [/\blabour\b/gi, 'labor'],
    [/\bneighbour\b/gi, 'neighbor'],
    [/\bpractise\b/gi, 'practice'],
    [/\bprogramme\b/g, 'program'],
    [/\bstorey\b/gi, 'story'],
    [/\bstoreys\b/gi, 'stories'],
    [/\btyre\b/gi, 'tire'],
    [/\btyres\b/gi, 'tires'],

    // Housing / home
    [/\bflat\b/gi, 'apartment'],
    [/\bsemi-detached\b/gi, 'duplex'],
    [/\bterraced house\b/gi, 'townhouse'],
    [/\bterraced\b/gi, 'townhouse-style'],
    [/\bdetached house\b/gi, 'single-family home'],
    [/\bpetrol\b/gi, 'gasoline'],
    [/\bpost code\b/gi, 'zip code'],
    [/\bpostcode\b/gi, 'zip code'],
    [/\bPostcode\b/g, 'Zip Code'],
    [/\bloft\b/gi, 'attic'],
    [/\bLoft\b/g, 'Attic'],
    [/\bgarden\b/gi, 'yard'],
    [/\bGarden\b/g, 'Yard'],
    [/\bpavement\b/gi, 'sidewalk'],
    [/\bboot\b/gi, 'trunk'],  // car boot

    // Seasons
    [/\bautumn\b/gi, 'fall'],
    [/\bAutumn\b/g, 'Fall'],

    // Legal / consumer
    [/\bConsumer Rights Act 2015\b/g, 'FTC Act and state consumer protection laws'],
    [/\bTrading Standards\b/g, 'consumer protection agency'],
    [/\bOMBUDSMAN\b/gi, 'consumer protection office'],

    // Emergency services
    [/\b999\b/g, '911'],
    [/\bA&E\b/g, 'ER'],
    [/\b111\b/g, '311'],
    [/\bNHS\b/g, 'your healthcare provider'],

    // Regions in title/SEO
    [/\bUK Blog\b/g, 'US Blog'],
    [/\bGB\b/g, 'US'],
];

function localizeContent(text) {
    let result = text;
    for (const [pattern, replacement] of termSwaps) {
        result = result.replace(pattern, replacement);
    }
    return result;
}

// Slugs of UK posts that need US versions
const missingUsSlugs = [
    'washing-machine-microplastic-filter-drainage-floods-2026',
    'find-reliable-tradesmen-contractors-fast',
    '2026-anti-snap-lock-lockdown-gb',
    'emergency-plumbing-heating-repairs-immediate-relief',
    'fastest-response-emergency-tradesmen-network-gb',
    'emergency-drain-unblocking-guide',
    'spring-thaw-pipe-burst-prevention',
    'can-you-legally-stay-in-home-without-electricity',
    'how-we-verify-tradespeople',
    'electrical-emergencies-every-homeowner-should-know',
    'emergency-at-home-guide',
    'emergency-plumber-london-guide',
    'shattered-windows-high-winds-board-up-glazing-guide',
    'emergency-boiler-replacement-2026-eco-bloom',
];

// Custom slug overrides for US versions
const slugOverrides = {
    '2026-anti-snap-lock-lockdown-gb': '2026-high-security-deadbolt-upgrade-us',
    'fastest-response-emergency-tradesmen-network-gb': 'fastest-response-emergency-contractors-network-us',
    'emergency-plumber-london-guide': 'emergency-plumber-nyc-guide-us',
    'emergency-boiler-replacement-2026-eco-bloom': 'emergency-furnace-replacement-2026-us',
    'shattered-windows-high-winds-board-up-glazing-guide': 'shattered-windows-high-winds-board-up-glazing-guide-us',
    'find-reliable-tradesmen-contractors-fast': 'find-reliable-contractors-fast-us',
};

// Custom title overrides
const titleOverrides = {
    'emergency-plumber-london-guide': (t) => t.replace(/London/gi, 'New York'),
    'emergency-boiler-replacement-2026-eco-bloom': (t) => t.replace(/Boiler/gi, 'Furnace'),
    '2026-anti-snap-lock-lockdown-gb': (t) => t.replace(/Anti-Snap Lock/gi, 'High-Security Deadbolt'),
};

async function createUsVersions() {
    let created = 0;
    let skipped = 0;
    let failed = 0;

    for (const ukSlug of missingUsSlugs) {
        // Determine the US slug
        let usSlug;
        if (slugOverrides[ukSlug]) {
            usSlug = slugOverrides[ukSlug];
        } else if (ukSlug.endsWith('-gb')) {
            usSlug = ukSlug.replace(/-gb$/, '-us');
        } else {
            usSlug = ukSlug + '-us';
        }

        // Check if US version already exists
        const { data: existing } = await supabase
            .from('posts')
            .select('id')
            .eq('slug', usSlug)
            .single();

        if (existing) {
            console.log(`⏭️  Already exists: ${usSlug}`);
            skipped++;
            continue;
        }

        // Fetch UK post
        const { data: ukPost, error } = await supabase
            .from('posts')
            .select('*')
            .eq('slug', ukSlug)
            .single();

        if (error || !ukPost) {
            console.error(`❌ Could not find UK post: ${ukSlug}`);
            failed++;
            continue;
        }

        // Localize
        let usTitle = localizeContent(ukPost.title);
        if (titleOverrides[ukSlug]) {
            usTitle = titleOverrides[ukSlug](usTitle);
        }

        const usContent = localizeContent(ukPost.content || '');
        const usExcerpt = localizeContent(ukPost.excerpt || '');

        // Build the US post
        const usPost = {
            slug: usSlug,
            title: usTitle,
            content: usContent,
            excerpt: usExcerpt,
            cover_image: ukPost.cover_image,
            published: true,
            published_at: ukPost.published_at || new Date().toISOString(),
        };

        const { error: insertError } = await supabase
            .from('posts')
            .insert(usPost);

        if (insertError) {
            console.error(`❌ Failed to insert ${usSlug}:`, insertError.message);
            failed++;
        } else {
            console.log(`✅ Created: ${usSlug}`);
            created++;
        }
    }

    console.log(`\n=== PHASE 2 COMPLETE ===`);
    console.log(`Created: ${created}`);
    console.log(`Skipped (already exist): ${skipped}`);
    console.log(`Failed: ${failed}`);
}

createUsVersions();
