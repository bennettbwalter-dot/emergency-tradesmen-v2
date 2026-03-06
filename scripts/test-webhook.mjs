import fetch from 'node-fetch';

async function testWebhook() {
    const webhookUrl = 'https://xwqvhymkwuasotsgmarn.supabase.co/functions/v1/mailmeteor-webhook';

    const payload = {
        id: `evt_test_${Date.now()}`,
        type: 'email.opened',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
        data: {
            object: {
                to: 'test@example.com',
                campaign: 'test_campaign_1',
                variables: {
                    Trade: 'Roofer',
                    City: 'London',
                    FirstName: 'TestUser'
                }
            }
        }
    };

    console.log(`Sending simulated Mailmeteor webhook to: ${webhookUrl}`);

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const responseText = await response.text();

        if (response.ok) {
            console.log('✅ Webhook sent successfully!');
            console.log('Response:', responseText);
            console.log('Check your PostHog Live Events stream to see if "Mailmeteor: Email Opened" arrived.');
        } else {
            console.error(`❌ Webhook failed with status: ${response.status}`);
            console.error('Error Details:', responseText);
        }
    } catch (error) {
        console.error('❌ Network Error:', error);
    }
}

testWebhook();
