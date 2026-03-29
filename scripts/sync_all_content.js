import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const titleMapping = {
    'ac-blowing-warm-air-capacitor-leak-us': "AC Blowing Warm Air? Capacitor Failure & 2026 EPA Rules"
};

const coverImageMapping = {
    '5-signs-you-need-emergency-plumber': '/images/blog/generated/plumbing-emergency-signs.png',
    'can-you-legally-stay-in-home-without-electricity': '/blog/no-electricity-cover.webp',
    'electrical-emergencies-every-homeowner-should-know': '/blog/day39/fuse_box_damage_hand.webp',
    'emergency-at-home-guide': '/blog/home-emergency/safety.webp',
    'emergency-plumber-london-guide': '/images/blog/generated/fast-response-stopwatch.webp',
    'how-we-verify-tradespeople': '/images/blog/generated/vetted-pro-badge.webp',
    'structural-cracks-foundation-repair-us': '/images/blog/generated/foundation-cracks.png',
    'water-damage-restoration-category-mold-us': '/images/blog/generated/mold-restoration.png',
    'what-to-do-in-home-emergency-before-help-arrives': '/blog/home-emergency/safety.webp',
    '2026-anti-snap-lock-lockdown-gb': '/images/blog/anti-snap-locks/header-portrait.webp',
    'emergency-ev-charger-repair-gb': '/images/blog/ev-charger-repair/header-portrait.webp',
    'water-leaking-through-ceiling-first-steps-us': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1200&h=630',
    'sewage-smell-in-house-p-trap-us': '/images/blog/sewage-smell/header-portrait.webp',
    'emergency-repair-contractor-improve-not-move-us': '/images/blog/improve-not-move/hero.png',
    'emergency-repair-contractor-improve-not-move-gb': '/images/blog/improve-not-move/hero.png',
    'carbon-monoxide-gb': '/images/blog/carbon-monoxide/header-portrait.webp',
    'carbon-monoxide-us': '/images/blog/carbon-monoxide/header-portrait.webp',
    'emergency-ev-charger-repair-us': '/images/blog/ev-charger-repair/header-portrait.webp',
    'portable-power-stations-home-backup-gb': '/images/blog/portable-power/bluetti-solar-outdoor.webp',
    'portable-power-stations-emergency-backup-us': '/images/blog/portable-power/bluetti-solar-outdoor.webp',
    'smart-lock-emergency-gb': '/images/blog/smart-locks/header-portrait.webp',
    'ac-blowing-warm-air-capacitor-leak-us': '/images/blog/generated/ac-capacitor-hero-us.jpg',
    'ultimate-us-emergency-home-resilience-2026': '/images/blog/generated/us-technical-standards-hub.jpg',
    'the-definitive-uk-home-security-safety-standards-2026': '/images/blog/generated/uk-technical-standards-hub.jpg'
};

const excerptMapping = {
};

async function sync() {
    const contentDir = 'scripts/content';
    
    // Step 0: Cleanup legacy files in scripts/content (anything < 15KB)
    const allFiles = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'));
    for (const file of allFiles) {
        const stats = fs.statSync(path.join(contentDir, file));
        if (stats.size < 2000) {
            console.log(`🗑️ Deleting legacy file: ${file} (${stats.size} bytes)`);
            fs.unlinkSync(path.join(contentDir, file));
        }
    }

    const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'));

    console.log(`--- Syncing ${files.length} Optimized Blog Posts ---`);

    const localSlugs = [];

    for (const file of files) {
        const slug = file.replace('.md', '');
        localSlugs.push(slug);
        const filePath = path.join(contentDir, file);
        const content = fs.readFileSync(filePath, 'utf8');

        // Dynamic Title Extraction
        let title = titleMapping[slug];
        if (!title) {
            const h1Match = content.match(/^#\s+(.+)$/m) || content.match(/<h1>(.+?)<\/h1>/i);
            title = h1Match ? h1Match[1].trim() : slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        }

        // Dynamic Excerpt Extraction
        let excerpt = excerptMapping[slug];
        if (!excerpt) {
            const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#') && !l.startsWith('<h1') && !l.includes('capsule-box'));
            if (lines.length > 0) {
                excerpt = lines[0].replace(/<[^>]*>/g, '').substring(0, 160).trim() + '...';
            } else {
                excerpt = content.substring(0, 150).replace(/\r\n|\n/g, ' ') + '...';
            }
        }

        // Dynamic Cover Image Extraction
        let cover_image = coverImageMapping[slug];
        if (!cover_image) {
            const imgMatch = content.match(/<img[^>]+src="([^">]+)"/i);
            cover_image = imgMatch ? imgMatch[1] : '/images/blog/generated/placeholder.webp';
        }

        console.log(`Syncing: ${slug}...`);

        const { data: existingPost } = await supabase
            .from('posts')
            .select('id')
            .eq('slug', slug)
            .single();

        const postData = {
            title,
            slug,
            content: content.trim(),
            excerpt,
            cover_image,
            published: true,
            published_at: existingPost ? undefined : new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        if (existingPost) {
            const { error } = await supabase
                .from('posts')
                .update(postData)
                .eq('id', existingPost.id);
            if (error) console.error(`❌ Error updating ${slug}:`, error.message);
            else console.log(`✅ Updated: ${slug}`);
        } else {
            const { error } = await supabase
                .from('posts')
                .insert(postData);
            if (error) console.error(`❌ Error inserting ${slug}:`, error.message);
            else console.log(`✅ Inserted: ${slug}`);
        }
    }

    // Step 3: Cleanup Database (Delete posts that don't exist locally)
    console.log('🧹 Cleaning up database zombie posts...');
    const { data: dbPosts } = await supabase.from('posts').select('slug');
    if (dbPosts) {
        const slugsToDelete = dbPosts.filter(p => !localSlugs.includes(p.slug)).map(p => p.slug);
        console.log(`Found ${slugsToDelete.length} posts to remove.`);
        for (const slug of slugsToDelete) {
            console.log(`🗑️ Deleting from DB: ${slug}`);
            await supabase.from('posts').delete().eq('slug', slug);
        }
    }

    // Sync all_posts.json
    console.log('Syncing all_posts.json...');
    const { data: updatedPosts } = await supabase.from('posts').select('*');
    fs.writeFileSync('scripts/all_posts.json', JSON.stringify(updatedPosts, null, 2));

    console.log('--- Sync & Cleanup Finished ---');
}

sync();
