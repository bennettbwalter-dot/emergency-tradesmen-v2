import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env for access token
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const configPath = path.join(__dirname, '..', 'STRIPE_CONFIG.json');
const pricingPagePath = path.join(__dirname, '..', 'src', 'pages', 'PricingPage.tsx');

const SUPABASE_ACCESS_TOKEN = process.env.VITE_SUPABASE_ACCESS_TOKEN;

try {
    if (!fs.existsSync(configPath)) {
        console.error('❌ STRIPE_CONFIG.json not found.');
        process.exit(1);
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    // 1. Update PricingPage.tsx
    console.log('📝 Updating PricingPage.tsx with real links...');
    let pricingContent = fs.readFileSync(pricingPagePath, 'utf8');

    // Use a more robust replace that won't break if already updated
    const monthlyPattern = /onClick=\{\(\) => window\.open\('https:\/\/.*?', '_blank'\)\}/;
    const yearlyPattern = /onClick=\{\(\) => window\.open\('https:\/\/.*?', '_blank'\)\}/;

    // Actually, let's just do direct link replacement for common patterns
    pricingContent = pricingContent.replace(/buy\.stripe\.com\/[a-zA-Z0-0]+/g, (match) => {
        if (match.includes('placeholder')) return match;
        return match; // Keep as is if already updated? No, let's just use the config.
    });

    // Let's use the explicit links from config
    pricingContent = pricingContent.replace(/https:\/\/buy\.stripe\.com\/[a-zA-Z0-9]+/g, (match) => {
        if (match.includes('monthly') || match.includes('fZu5kD')) return config.STRIPE_MONTHLY_LINK;
        if (match.includes('yearly') || match.includes('00w8wP')) return config.STRIPE_YEARLY_LINK;
        return match;
    });

    fs.writeFileSync(pricingPagePath, pricingContent);
    console.log('✅ PricingPage.tsx updated.');

    // 2. Set Supabase secrets
    console.log('🔑 Setting secrets in Supabase...');
    const secrets = [
        `STRIPE_SECRET_KEY=${config.STRIPE_SECRET_KEY}`,
        `STRIPE_WEBHOOK_SECRET=${config.STRIPE_WEBHOOK_SECRET}`
    ];

    if (!SUPABASE_ACCESS_TOKEN) {
        console.error('❌ VITE_SUPABASE_ACCESS_TOKEN not found in .env');
    } else {
        try {
            const cmd = `npx --yes supabase secrets set ${secrets.join(' ')} --project-ref xwqvhymkwuasotsgmarn --access-token ${SUPABASE_ACCESS_TOKEN}`;
            execSync(cmd, { stdio: 'inherit' });
            console.log('✅ Secrets set successfully!');
        } catch (e) {
            console.error('❌ Error setting secrets.');
            console.error(e.message);
        }
    }

    console.log('\n🚀 Stripe integration finalized!');

} catch (error) {
    console.error('❌ Error applying configuration:', error.message);
}
