/**
 * test-webhook.js
 * Run: node test-webhook.js <WEBAPP_URL>
 */

const https = require('https');

const WEBAPP_URL = process.argv[2];

if (!WEBAPP_URL) {
    console.error("Please provide the Web App URL as an argument.");
    console.log("Usage: node test-webhook.js https://script.google.com/macros/s/.../exec");
    process.exit(1);
}

function sendPayload(name, payload) {
    console.log(`\n--- Sending ${name} ---`);

    const data = JSON.stringify(payload);
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length,
        },
    };

    const req = https.request(WEBAPP_URL, options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
            console.log(`Status: ${res.statusCode}`);
            console.log(`Response: ${body}`);
        });
    });

    req.on('error', (error) => {
        console.error(`Error: ${error.message}`);
    });

    req.write(data);
    req.end();
}

// 1. SUCCESS CASE: Valid Email
sendPayload("Success Case (Valid Email)", {
    record: {
        name: "John Doe Plumbing",
        address: "123 London St, London",
        phone_number: "+44 20 7946 0000",
        email: "john@example.com"
    }
});

// 2. FILTER CASE: Missing Email
setTimeout(() => {
    sendPayload("Filter Case (Missing Email)", {
        record: {
            name: "Ghost Listing",
            address: "Unknown Location",
            phone_number: "0000000",
            email: "" // Empty email - should be filtered
        }
    });
}, 2000);
