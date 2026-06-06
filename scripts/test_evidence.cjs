const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log("Supabase URL:", supabaseUrl);

async function testEvidenceFetch() {
    const url = `${supabaseUrl}/rest/v1/public_business_field_evidence?select=*&region=eq.UK&limit=5`;
    console.log("Fetching evidence URL:", url);

    try {
        const response = await axios.get(url, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
            }
        });
        console.log(`Success! Found ${response.data.length} evidence entries.`);
    } catch (err) {
        console.error("Error fetching evidence:", err.message);
        if (err.response) {
            console.error("Error status:", err.response.status);
            console.error("Error data:", err.response.data);
        }
    }
}

testEvidenceFetch();
