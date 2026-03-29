import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const deletedSlugs = [
    'emergency-ev-charger-repair-gb',
    'toilet-wont-stop-running-2026-fix-us',
    'carbon-monoxide-gb',
    '2026-anti-snap-lock-lockdown-gb',
    'emergency-repair-contractor-improve-not-move-gb',
    'hollow-frame-trap-structural-door-security-gb',
    'boiler-pressure-dropping-filling-loop-gb',
    'emergency-boarding-up-glazing-gb',
    'finding-reliable-local-tradesmen-gb',
    'hollow-frame-trap-structural-door-security-us',
    'emergency-drain-unblocking-guide-us',
    'emergency-plumbing-heating-repairs-immediate-relief-us',
    'ac-heat-pump-not-cooling-troubleshooting-gb',
    'find-reliable-contractors-fast-us',
    'emergency-plumber-nyc-guide-us',
    'smell-gas-what-to-do-safety-protocol-gb',
    'spring-thaw-pipe-burst-prevention-us',
    'structural-cracks-subsidence-survey-us',
    'domestic-electrical-interruption-protocol-gb',
    'water-leaking-through-ceiling-first-steps-gb',
    'electrical-fire-warning-signs-gb',
    'emergency-roof-leak-tarping-gb',
    'blocked-drain-pest-ingress-gb',
    'energy-shock-2026-emergency-generator-safety-home-power-resilience-gb',
    'shattered-windows-high-winds-board-up-glazing-guide-us',
    'emergency-storm-damage-repair-gb',
    'women-emergency-trades-iwd-2026-gb',
    'drain-smell-bathroom-soil-stack-us',
    'emergency-boarding-up-glazing-us',
    'emergency-at-home-guide-gb',
    'spring-thaw-pipe-burst-prevention-gb',
    'shattered-windows-high-winds-board-up-glazing-guide-gb',
    '2026-high-security-deadbolt-upgrade-gb',
    'emergency-drain-unblocking-guide-gb',
    'find-reliable-tradesmen-contractors-fast-us',
    'home-emergency-stopcock-fusebox-us',
    'is-your-fuse-box-up-to-code-consumer-unit-guide-us',
    'emergency-boiler-replacement-2026-eco-bloom-gb',
    'is-your-fuse-box-up-to-code-consumer-unit-guide-gb',
    'ac-heatwave-preparation-signs-repair-uk-2026',
    'ac-heatwave-preparation-signs-repair-us-2026',
    'emergency-plumbing-heating-repairs-immediate-relief-gb'
];

async function surgicalRestore() {
    console.log('--- Surgical Restoration ---');
    
    const { data: currentPosts, error } = await supabase.from('posts').select('slug');
    if (error) return console.error(error);
    const existingSlugs = new Set(currentPosts.map(p => p.slug));

    // Load backup
    let backupText = fs.readFileSync('scripts/all_posts_content.json', 'utf16le');
    if (backupText.charCodeAt(0) === 0xFEFF) {
        backupText = backupText.slice(1);
    }
    const backupData = JSON.parse(backupText);
    
    for (const slug of deletedSlugs) {
        const base = slug.replace(/-gb$|-uk$|-us$|-usa$|-uk-2026$|-us-2026$/, '');
        const hasCounterpart = 
            existingSlugs.has(base + '-gb') || 
            existingSlugs.has(base + '-uk') || 
            existingSlugs.has(base + '-us') || 
            existingSlugs.has(base + '-usa') ||
            existingSlugs.has(base + '-uk-2026') ||
            existingSlugs.has(base + '-us-2026');

        if (!hasCounterpart) {
            console.log(`⚠️ NO COUNTERPART for [${slug}]. Attempting restoration...`);
            const post = backupData.find(p => p.slug === slug);
            if (post) {
                // Restore but should we localize? Yes, but for now just get the content back.
                const { error: insError } = await supabase.from('posts').upsert(post, { onConflict: 'slug' });
                if (insError) console.error(`Error restoring ${slug}:`, insError);
                else console.log(`✅ Restored ${slug}`);
            } else {
                console.log(`❌ Could not find [${slug}] in backup.`);
            }
        } else {
            // console.log(`OK: [${slug}] has a counterpart.`);
        }
    }
}

surgicalRestore();
