
import axios from 'axios';
import fs from 'fs';

async function probe() {
    const url = 'https://www.thomsonlocal.com/search/plumbers/edinburgh';
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        fs.writeFileSync('thomson_probe.html', response.data);
        console.log('Saved thomson_probe.html');
    } catch (error) {
        console.error('Error:', error.message);
    }
}

probe();
