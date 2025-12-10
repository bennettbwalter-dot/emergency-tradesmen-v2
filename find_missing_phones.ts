
import { businessListings } from "./src/lib/businesses";

const missingPhones: { city: string; name: string; id: string }[] = [];

for (const city in businessListings) {
    const cityListings = businessListings[city];
    for (const trade in cityListings) {
        const businesses = cityListings[trade];
        businesses.forEach(business => {
            if (!business.phone) {
                missingPhones.push({
                    city,
                    name: business.name,
                    id: business.id
                });
            }
        });
    }
}

import * as fs from 'fs';

if (missingPhones.length > 0) {
    fs.writeFileSync('missing_phones.json', JSON.stringify(missingPhones, null, 2), 'utf-8');
    console.log("Written to missing_phones.json");
} else {
    console.log("No missing phone numbers found.");
}
