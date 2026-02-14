/**
 * Meta AI Blog Image Generator — Semi-Automated
 * 
 * Opens meta.ai in a visible browser window and sends image generation prompts
 * one at a time. After each prompt, it pauses so you can:
 *   1. Wait for the image to generate
 *   2. Right-click → "Save image as" → save to the path shown in the console
 *   3. Press ENTER in this terminal to move to the next prompt
 *
 * The script handles login persistence, prompt entry, and submission automatically.
 * You only need to save each image manually.
 *
 * Usage:
 *   node scripts/meta-ai-image-gen.cjs
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

// ─── Image prompts and save paths ────────────────────────────────────────────

const IMAGES = [
    {
        prompt: 'Imagine a realistic photograph of water dripping from a white painted ceiling in a modern home living room. A visible water stain spreading across the ceiling with a single water droplet falling. A blue bucket placed on the wooden floor below catching the drip. Warm interior lighting, slightly dramatic mood, photojournalistic style.',
        saveTo: 'public/images/blog/water-ceiling/ceiling-leak.jpg',
        label: '🔧 PLUMBER: Ceiling Leak'
    },
    {
        prompt: 'Imagine a realistic photograph of a modern UK consumer unit electrical fuse box mounted on a white wall in a home hallway. The cover is open showing a row of MCB switches with one switch clearly in the tripped OFF position. Dim lighting suggesting a power cut with only natural light from a nearby window. Clean photographic style.',
        saveTo: 'public/images/blog/no-power/consumer-unit.jpg',
        label: '⚡ ELECTRICIAN: Consumer Unit'
    },
    {
        prompt: 'Imagine a realistic photograph taken from behind of a person standing outside a closed front door at night. The person is looking at a locked dark wooden door with a brass handle. A street lamp casts warm yellow light. Suburban neighborhood setting. Moody nighttime atmosphere with a slightly cinematic photography style.',
        saveTo: 'public/images/blog/locked-out/door-night.jpg',
        label: '🔐 LOCKSMITH: Locked Out at Night'
    },
    {
        prompt: 'Imagine a realistic close-up photograph of a boiler pressure gauge showing low pressure with the needle pointing below the green zone into the red area. The gauge is mounted on a white combi boiler in a modern kitchen. Sharp focus on the gauge dial with shallow depth of field. Clean product photography style.',
        saveTo: 'public/images/blog/boiler-pressure/pressure-gauge.jpg',
        label: '🔥 GAS/HVAC: Boiler Pressure Gauge'
    },
    {
        prompt: 'Imagine a realistic photograph of a metal drain cover grate on a tiled bathroom floor slightly lifted to one side. Clean white tiles and modern bathroom setting. Subtle steam or mist effect suggesting odor. Bright bathroom lighting with editorial photography style.',
        saveTo: 'public/images/blog/sewage-smell/drain-cover.jpg',
        label: '🚿 DRAIN: Drain Cover'
    }
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function waitForEnter(prompt) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => {
        rl.question(prompt, () => {
            rl.close();
            resolve();
        });
    });
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
    const userDataDir = path.join(__dirname, '.meta-ai-profile');
    const projectRoot = path.resolve(__dirname, '..');

    console.log('═══════════════════════════════════════════════════════════');
    console.log('   🎨 Meta AI Blog Image Generator');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('How it works:');
    console.log('  1. A browser window will open to meta.ai');
    console.log('  2. Each image prompt is auto-typed and submitted');
    console.log('  3. Wait for the image to generate');
    console.log('  4. Right-click the image → "Save image as..."');
    console.log('  5. Save it to the path shown in the console');
    console.log('  6. Press ENTER here to continue to the next prompt');
    console.log('');
    console.log(`${IMAGES.length} images to generate.`);
    console.log('═══════════════════════════════════════════════════════════\n');

    // Ensure all output directories exist
    for (const img of IMAGES) {
        const fullDir = path.join(projectRoot, path.dirname(img.saveTo));
        fs.mkdirSync(fullDir, { recursive: true });
    }

    const browser = await puppeteer.launch({
        headless: false,
        userDataDir: userDataDir,
        defaultViewport: { width: 1400, height: 900 },
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
    });

    const page = await browser.newPage();

    // Navigate to meta.ai
    console.log('🌐 Opening meta.ai...');
    await page.goto('https://www.meta.ai/', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(3000);

    // Check if login is needed
    const hasInput = await page.$('textarea, [contenteditable="true"], [role="textbox"]');
    if (!hasInput) {
        console.log('\n⚠️  It looks like you may need to log in first.');
        await waitForEnter('   Log in to meta.ai in the browser window, then press ENTER here... ');
        await sleep(2000);
    }

    for (let i = 0; i < IMAGES.length; i++) {
        const img = IMAGES[i];
        const fullPath = path.join(projectRoot, img.saveTo);

        console.log(`\n${'─'.repeat(60)}`);
        console.log(`📸 [${i + 1}/${IMAGES.length}] ${img.label}`);
        console.log(`${'─'.repeat(60)}`);
        console.log(`💾 Save to: ${fullPath}`);
        console.log(`📝 Prompt:  ${img.prompt.substring(0, 70)}...\n`);

        // Navigate fresh for each image to avoid chat history confusion
        if (i > 0) {
            await page.goto('https://www.meta.ai/', { waitUntil: 'networkidle2', timeout: 30000 });
            await sleep(3000);
        }

        try {
            // Find the input area
            const inputSelector = 'textarea, [contenteditable="true"], [role="textbox"]';
            await page.waitForSelector(inputSelector, { timeout: 10000 });
            const inputEl = await page.$(inputSelector);

            if (inputEl) {
                // Clear any existing text and type the prompt
                await inputEl.click({ clickCount: 3 }); // Select all
                await sleep(200);
                await inputEl.type(img.prompt, { delay: 5 });
                await sleep(500);

                // Submit
                await page.keyboard.press('Enter');
                console.log('   ✅ Prompt submitted! Waiting for image to generate...');
                console.log('');
                console.log('   👉 When the image appears in the browser:');
                console.log('      1. Right-click the image');
                console.log('      2. Select "Save image as..."');
                console.log(`      3. Navigate to: ${path.dirname(fullPath)}`);
                console.log(`      4. Save as: ${path.basename(fullPath)}`);
            } else {
                console.log('   ❌ Could not find the input field.');
            }
        } catch (err) {
            console.log(`   ❌ Error: ${err.message}`);
        }

        // Wait for user to save the image
        if (i < IMAGES.length - 1) {
            await waitForEnter('\n   Press ENTER after saving the image to continue to the next one... ');
        } else {
            await waitForEnter('\n   Press ENTER after saving the last image to finish... ');
        }
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('   🎉 All done! Check your images:');
    console.log('═══════════════════════════════════════════════════════════');
    for (const img of IMAGES) {
        const fullPath = path.join(projectRoot, img.saveTo);
        const exists = fs.existsSync(fullPath);
        console.log(`   ${exists ? '✅' : '⚠️ '} ${img.saveTo} ${exists ? '' : '(NOT SAVED - please add manually)'}`);
    }
    console.log('');

    console.log('Closing browser in 5 seconds...');
    await sleep(5000);
    await browser.close();
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
