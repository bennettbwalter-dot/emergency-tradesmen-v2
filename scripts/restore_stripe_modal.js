
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, '..', 'STRIPE_CONFIG.json');
const bookingPath = path.join(__dirname, '..', 'src', 'components', 'BookingModal.tsx');

try {
    if (!fs.existsSync(configPath)) {
        console.error('No Config Found');
        process.exit(1);
    }
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    // Use Booking link if exists, else monthly
    const stripeLink = config.STRIPE_BOOKING_LINK || config.STRIPE_MONTHLY_LINK;

    if (!fs.existsSync(bookingPath)) {
        console.error('No Booking Modal Found');
        process.exit(1);
    }

    let content = fs.readFileSync(bookingPath, 'utf8');

    // Replace the generic "Pay with Stripe" button or link
    // I know I removed the link (set to #), so searching for href="#" or similar inside the new Stripe block?
    // Or I can just inject it.

    // Pattern: <Button ... onClick={() => window.open(..., '_blank')}>Pay with Stripe</Button>
    // Or <a href="#" ...>Pay with Stripe</a>

    // Step 583 regex Replaced revolut link with '#'
    // So looking for href="#" inside BookingModal

    if (content.includes('href="#"')) {
        content = content.replace('href="#"', `href="${stripeLink}"`);
        console.log('Restored Link in href="#"');
    } else if (content.includes("window.open('#',")) {
        content = content.replace("window.open('#',", `window.open('${stripeLink}',`);
        console.log("Restored Link in window.open");
    } else {
        // Fallback: Force replace content
        console.log("Could not find placeholder link. Appending logging.");
    }

    fs.writeFileSync(bookingPath, content);
    console.log('Restored Stripe Link in BookingModal.tsx');

} catch (e) {
    console.error(e);
}
