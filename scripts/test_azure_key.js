
import axios from 'axios';

const key = '71261a86851249b6b66aa16d8a7051a8';
const regions = ['uksouth', 'ukwest', 'westeurope', 'northeurope', 'westus', 'eastus2', 'global'];

async function testAzure() {
    console.log(`Testing Key: ${key.substring(0, 4)}...`);

    for (const region of regions) {
        try {
            const url = `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`;
            // console.log(`Trying ${region}...`);
            const response = await axios.post(url, null, {
                headers: {
                    'Ocp-Apim-Subscription-Key': key,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            if (response.status === 200) {
                console.log(`✅ SUCCESS! Valid Region found: ${region}`);
                return;
            }
        } catch (error) {
            // Ignore 401s
            if (error.response && error.response.status !== 401) {
                console.log(`${region}: ${error.response.status}`);
            }
        }
    }
    console.log('❌ FAILED all regions tested.');
}

testAzure();
