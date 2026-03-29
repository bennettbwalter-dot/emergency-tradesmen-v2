
import axios from 'axios';

// Potential key found in scripts/list_models.js
const key = 'dd742691cc31b1d460788e1084fe3243';
const regions = ['eastus', 'uksouth', 'westus', 'westeurope', 'northeurope', 'global'];

async function testAzure() {
    console.log(`Testing Candidate Key: ${key.substring(0, 4)}...`);

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
                console.log(`Key: ${key}`);
                return;
            }
        } catch (error) {
            // Ignore 401s
            if (error.response && error.response.status !== 401) {
                console.log(`${region}: ${error.response.status}`);
            }
        }
    }
    console.log('❌ FAILED all regions tested with candidate key.');
}

testAzure();
