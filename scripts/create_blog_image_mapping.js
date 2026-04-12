import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readdirSync } from 'fs';

dotenv.config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

// Get all available generated images
const generatedImages = readdirSync('public/images/blog/generated');
const allAvailableImages = generatedImages
    .filter(f => /\.(png|webp|jpg|jpeg)$/i.test(f))
    .filter(f => !f.includes('placeholder') && !f.includes('test_index')) // Exclude placeholders
    .map(f => `/images/blog/generated/${f}`);

console.log(`Available unique images: ${allAvailableImages.length}\n`);

async function mapBlogsToImages() {
    const { data: allPosts, error } = await supabase
        .from('posts')
        .select('slug, title, cover_image, published')
        .eq('published', true)
        .order('published_at', { ascending: false });

    if (error) {
        console.error('Error:', error);
        return;
    }

    // Separate UK and US
    const usPosts = allPosts.filter(p => p.slug.endsWith('-us') || p.slug.endsWith('-usa'));
    const ukPosts = allPosts.filter(p => p.slug.endsWith('-gb') || p.slug.endsWith('-uk'));
    const sharedPosts = allPosts.filter(p => !p.slug.match(/-(us|usa|gb|uk)$/));

    console.log(`Total published posts: ${allPosts.length}`);
    console.log(`  - US: ${usPosts.length}`);
    console.log(`  - UK: ${ukPosts.length}`);
    console.log(`  - Shared: ${sharedPosts.length}\n`);

    // Create mapping of blog slug -> appropriate image
    const imageMapping = {};

    // Helper to pick appropriate image based on blog title/slug keywords
    const getImageForBlog = (slug, title, existingImage, region) => {
        const slugLower = slug.toLowerCase();
        const titleLower = title.toLowerCase();
        const text = `${slugLower} ${titleLower}`;

        // If already has a unique non-placeholder image, keep it
        if (existingImage && 
            !existingImage.includes('placeholder') && 
            !existingImage.includes('home-security-safety.png') &&
            existingImage !== '/images/blog/generated/fast-response-stopwatch.webp') {
            return existingImage;
        }

        // Match keywords to appropriate images
        const imageMap = region === 'US' ? {
            'security': '/images/blog/generated/vetted-pro-badge.webp',
            'audit': '/images/blog/generated/vetted-pro-badge.webp',
            'attic.*mold': '/images/blog/generated/attic-mold-hero-us.png',
            'ac.*warm.*air': '/images/blog/generated/ac-capacitor-hero-us.jpg',
            'capacitor': '/images/blog/generated/ac-capacitor-hero-us.jpg',
            'ev.*charger': '/images/blog/ev-charger-repair/header-portrait.webp',
            'water.*leak.*ceiling': '/images/blog/generated/water-leaking-from-ceiling.png',
            'sewage.*smell': '/images/blog/sewage-smell/header-portrait.webp',
            'p-trap': '/images/blog/generated/p-trap-diagram.webp',
            'structural.*crack': '/images/blog/generated/foundation-cracks.png',
            'foundation': '/images/blog/generated/foundation-cracks.png',
            'improve.*not.*move': '/images/blog/improve-not-move/hero.png',
            'resilience': '/images/blog/generated/us-technical-standards-hub.jpg',
            'smart.*leak': '/images/blog/generated/smart-leak-detection-portrait-hero-us.jpg',
            'frozen.*pipe': '/images/blog/generated/plumbing-emergency-signs.png',
            'forced.*entry': '/images/blog/generated/plywood-install.webp',
            'door.*hardening': '/images/blog/generated/plywood-install.webp',
            'generator.*resilience': '/images/blog/generated/generator-safety-hero-us.jpg',
            'grid.*instability': '/images/blog/generated/car-battery-frosty.webp',
            'radon': '/images/blog/spring-condensation/aranet-radon-detector.webp',
            'septic': '/images/blog/generated/running_toilet_hero.webp',
            'sewer.*line.*repair': '/images/blog/generated/emergency-sewer-line.png',
            'sewer.*backup': '/images/blog/generated/toilet_tank_mechanism.webp',
            'sump.*pump': '/images/blog/sump-pump-resilience-2026/sump-pump-pool.webp',
            'smart.*lock': '/images/blog/smart-locks/header-portrait.webp',
            'refrigerant': '/images/blog/ac-heatwave-preparation-signs-repair-us-2026/costway-6in1.webp',
            'heat.*pump.*thaw': '/images/blog/generated/pouring-warm-water.webp',
            'contractor': '/images/blog/generated/diy-struggle.webp',
            'commercial.*electrician': '/images/blog/generated/us-hvac-system.webp',
            'building.*envelope': '/images/blog/generated/us-certification-badge.webp',
            'plumber': '/images/blog/generated/plumbing-emergency-signs.png',
            'commercial.*refrigeration': '/images/blog/generated/us-hvac-system.webp',
            'emergency.*at.*home': '/images/blog/generated/emergency-home-kit.webp',
            'emergency.*trades': '/images/blog/generated/et-service-van-night.webp',
            'facility.*management': '/images/blog/generated/us-service-truck.webp',
            'glazing': '/images/blog/generated/glazing-replacement.webp',
            'flat.*roof': '/images/blog/generated/roof-leak.png',
            'drain.*cleaning': '/images/blog/generated/plumber-inspecting-drain.webp',
            'water.*main': '/images/blog/generated/water-shut-off.webp',
            'pest.*control': '/images/blog/generated/pest-control.png',
            'handyman': '/images/blog/generated/diy-disaster-main.webp',
            'pipe.*burst': '/images/blog/generated/plumbing-emergency-signs.png',
            'roof.*repair': '/images/blog/generated/roof-repair.png',
            'mould': '/images/blog/generated/mold-restoration.png',
            'carbon.*monoxide': '/images/blog/carbon-monoxide/header-portrait.webp',
            'portable.*power': '/images/blog/portable-power/bluetti-solar-outdoor.webp',
            'smart.*water': '/images/blog/generated/smart-leak-detection-portrait-hero-us.jpg',
        } : {
            'garden.*electrics': '/images/blog/generated/garden-electrics-hero-gb.jpg',
            'security.*standards': '/images/blog/generated/uk-technical-standards-hub.jpg',
            'ev.*charger': '/images/blog/ev-charger-repair/header-portrait.webp',
            'improve.*not.*move': '/images/blog/improve-not-move/hero.png',
            'carbon.*monoxide': '/images/blog/carbon-monoxide/header-portrait.webp',
            'anti.*snap': '/images/blog/anti-snap-locks/header-portrait.webp',
            'smart.*lock': '/images/blog/smart-locks/header-portrait.webp',
            'smart.*leak': '/images/blog/generated/smart-leaky-hero.png',
            'sewer.*backup': '/images/blog/sewer-backup-gb/sewer-backup-hero.png',
            'sewage.*cleanup': '/images/blog/sewage-smell/header-portrait.webp',
            'refrigerant': '/images/blog/ac-heatwave-preparation-signs-repair-uk-2026/costway-6in1.webp',
            'portable.*power.*backup': '/images/blog/generated/battery-check.webp',
            'portable.*power.*home': '/images/blog/portable-power/bluetti-solar-outdoor.webp',
            'mould': '/images/blog/generated/mold-restoration.png',
            'hybrid.*heating': '/images/blog/generated/boiler-safety-diagram.webp',
            'generator.*safety': '/images/blog/generated/jump-cables.webp',
            'energy.*crisis.*generator': '/images/blog/generated/car-battery-frosty.webp',
            'flat.*roof': '/images/blog/generated/roof-leak.png',
            'water.*main': '/images/blog/generated/tradesman-night-rain.webp',
            'tradesmen.*uk': '/images/blog/generated/emergency-home-kit.webp',
            'emergency.*services': '/images/blog/generated/emergency-home-kit.webp',
            'roof.*repair': '/images/blog/generated/roof-repair.png',
            'pipe.*burst': '/images/blog/generated/frozen-pipe.webp',
            'pest.*control': '/images/blog/generated/pest-control.png',
            'heat.*pump.*thaw': '/images/blog/generated/plumbing-heating-emergency-hero.webp',
            'glazing': '/images/blog/generated/broken-window-boarding.webp',
            'drain.*cleaning': '/images/blog/generated/plumber-inspecting-drain.webp',
            'commercial.*drainage': '/images/blog/generated/plumber-inspecting-drain.webp',
            'electrical.*emergencies': '/images/blog/generated/electrical-emergencies.png',
            'commercial.*gas': '/images/blog/generated/gas-isolation.webp',
            'electricity': '/images/blog/generated/home-without.png',
            'spring.*thaw': '/images/blog/generated/plumbing.png',
            'hollow.*frame': '/images/blog/generated/door-hardening.png',
            'car.*battery': '/images/blog/generated/car-battery-frosty.webp',
            'plumber.*london': '/images/blog/generated/fast-response-stopwatch.webp',
        };

        // Find matching image
        for (const [keyword, imagePath] of Object.entries(imageMap)) {
            if (new RegExp(keyword).test(text)) {
                return imagePath;
            }
        }

        // Fallback: return a unique image based on slug hash
        return null;
    };

    // Process US blogs
    console.log('=== US BLOG IMAGE MAPPING ===\n');
    const usUpdates = [];
    
    usPosts.forEach(post => {
        const newImage = getImageForBlog(post.slug, post.title, post.cover_image, 'US');
        if (newImage && newImage !== post.cover_image) {
            usUpdates.push({ slug: post.slug, old: post.cover_image, new: newImage, title: post.title });
            imageMapping[post.slug] = newImage;
        } else if (!newImage) {
            // Need fallback - use hash of slug
            const fallbackIndex = Math.abs(post.slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % allAvailableImages.length;
            const fallbackImage = allAvailableImages[fallbackIndex];
            usUpdates.push({ slug: post.slug, old: post.cover_image, new: fallbackImage, title: post.title });
            imageMapping[post.slug] = fallbackImage;
        }
    });

    usUpdates.forEach((u, i) => {
        console.log(`${i + 1}. ${u.slug}`);
        console.log(`   Old: ${u.old}`);
        console.log(`   New: ${u.new}\n`);
    });

    // Process UK blogs
    console.log('\n=== UK BLOG IMAGE MAPPING ===\n');
    const ukUpdates = [];
    
    ukPosts.forEach(post => {
        const newImage = getImageForBlog(post.slug, post.title, post.cover_image, 'UK');
        if (newImage && newImage !== post.cover_image) {
            ukUpdates.push({ slug: post.slug, old: post.cover_image, new: newImage, title: post.title });
            imageMapping[post.slug] = newImage;
        } else if (!newImage) {
            const fallbackIndex = Math.abs(post.slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % allAvailableImages.length;
            const fallbackImage = allAvailableImages[fallbackIndex];
            ukUpdates.push({ slug: post.slug, old: post.cover_image, new: fallbackImage, title: post.title });
            imageMapping[post.slug] = fallbackImage;
        }
    });

    ukUpdates.forEach((u, i) => {
        console.log(`${i + 1}. ${u.slug}`);
        console.log(`   Old: ${u.old}`);
        console.log(`   New: ${u.new}\n`);
    });

    // Save mapping to file for review
    const { writeFileSync } = await import('fs');
    writeFileSync('scripts/blog_image_mapping.json', JSON.stringify(imageMapping, null, 2));
    console.log('\n✅ Mapping saved to scripts/blog_image_mapping.json');
}

mapBlogsToImages().catch(console.error);
