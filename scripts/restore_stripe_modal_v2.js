
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, '..', 'STRIPE_CONFIG.json');
const bookingPath = path.join(__dirname, '..', 'src', 'components', 'BookingModal.tsx');

try {
    if (!fs.existsSync(configPath)) { process.exit(1); }
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const stripeLink = config.STRIPE_BOOKING_LINK || config.STRIPE_MONTHLY_LINK;

    let content = fs.readFileSync(bookingPath, 'utf8');

    // Broader search: Find the Button that contains "Pay with Stripe"
    // And attach onClick to window.open(stripeLink)

    // Pattern: <Button ...>Pay with Stripe</Button>
    // I want to ensure it has onClick={() => window.open(stripeLink, '_blank')}

    // First, remove any existing onClick on that button (primitive)
    // Actually, I'll just Replace "Pay with Stripe" button entire block if I can match it.

    // Or I can replace `window.open('#'` if it exists (maybe I used double quotes?)
    if (content.includes('window.open("#"')) {
        content = content.replace('window.open("#"', `window.open("${stripeLink}"`);
        console.log('Restored Link (double quotes match)');
    }
    else {
        // Just Regex replace the whole button area?
        // Let's Replace "Pay with Stripe" with "Pay with Stripe" + Link Logic
        // IF the link logic isn't there.

        // I will rely on the previous script `remove_revolut.py` having done:
        // replaced Revolut link with '#'

        // Maybe it replaced `href`?
        // Step 583 regex: re.sub(r'https?://(www\.)?revolut\.me/[^\s"]+', '#', content)

        // If the original code was `window.open('https://revolut...')`
        // Then it became `window.open('#')`? 
        // Or `window.open('#', ...)`

        // Let's try replacing regex `#` inside window.open or href

        content = content.replace(/window\.open\(['"]#['"]/, `window.open('${stripeLink}'`);
        content = content.replace(/href=['"]#['"]/, `href="${stripeLink}"`);
        console.log('Attempted broad regex replacement');
    }

    fs.writeFileSync(bookingPath, content);

} catch (e) {
    console.error(e);
}
