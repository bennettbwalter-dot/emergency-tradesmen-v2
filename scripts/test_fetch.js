const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log("Supabase URL:", supabaseUrl);

async function testFetch(trade, city, countryCode = 'GB') {
    let searchCity = city;

    const uniqueTrades = [trade.toLowerCase()];
    if (trade.toLowerCase().startsWith('emergency-')) {
        uniqueTrades.push(trade.toLowerCase().replace('emergency-', ''));
    }

    const tradeParams = `trade=in.(${uniqueTrades.map(encodeURIComponent).join(',')})`;
    const directUrl = `${supabaseUrl}/rest/v1/businesses?select=*,business_photos(*)&${tradeParams}&city=eq.${encodeURIComponent(searchCity)}&country_code=eq.${countryCode.toUpperCase()}&limit=5`;

    console.log("Fetching URL:", directUrl);

    try {
        const response = await axios.get(directUrl, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
            }
        });
        console.log(`Success! Found ${response.data.length} listings.`);
        if (response.data.length > 0) {
            console.log("First listing name:", response.data[0].name);
            console.log("First listing trade:", response.data[0].trade);
            console.log("First listing city:", response.data[0].city);
            console.log("First listing country_code:", response.data[0].country_code);
        }
    } catch (err) {
        console.error("Error fetching:", err.message);
        if (err.response) {
            console.error("Error data:", err.response.data);
        }
    }
}

async function main() {
    await testFetch('plumber', 'London', 'GB');
    await testFetch('electrician', 'London', 'GB');
}

main();
