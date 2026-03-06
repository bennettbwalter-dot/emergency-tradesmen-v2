// Follows Deno standard library
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const POSTHOG_URL = "https://eu.i.posthog.com/capture/";

interface MailmeteorEvent {
    id: string;
    type: string;
    email: string; // The email ID in Mailmeteor
    created_at: string;
    data?: {
        object?: {
            to?: string;
            variables?: Record<string, string>;
            campaign?: string;
        }
    }
}

serve(async (req) => {
    try {
        // Only accept POST requests
        if (req.method !== 'POST') {
            return new Response('Method Not Allowed', { status: 405 });
        }

        const postHogKey = Deno.env.get('VITE_POSTHOG_KEY') || Deno.env.get('NEXT_PUBLIC_POSTHOG_KEY');
        if (!postHogKey) {
            console.error("Missing PostHog Key in environment variables");
            return new Response('Internal Server Error', { status: 500 });
        }

        // Parse the Mailmeteor webhook payload
        const payload: MailmeteorEvent = await req.json();
        console.log(`Received Mailmeteor Event: ${payload.type}`);

        // Map Mailmeteor event types to PostHog event names
        const eventMapping: Record<string, string> = {
            'email.sent': 'Mailmeteor: Email Sent',
            'email.opened': 'Mailmeteor: Email Opened',
            'email.clicked': 'Mailmeteor: Email Clicked',
            'email.bounced': 'Mailmeteor: Email Bounced',
            'email.unsubscribed': 'Mailmeteor: Email Unsubscribed',
        };

        const postHogEventName = eventMapping[payload.type];

        if (!postHogEventName) {
            console.log(`Ignoring unmapped event type: ${payload.type}`);
            return new Response(JSON.stringify({ success: true, ignored: true }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // Extract core tracking variables
        const recipientEmail = payload.data?.object?.to || 'unknown_recipient';
        const variables = payload.data?.object?.variables || {};
        const campaignId = payload.data?.object?.campaign || 'unknown_campaign';

        // Construct the PostHog payload
        const postHogData = {
            api_key: postHogKey,
            event: postHogEventName,
            distinct_id: recipientEmail, // Tie the event to the unique email address
            properties: {
                $current_url: "Mailmeteor",
                $host: "Mailmeteor",
                source: "Mailmeteor Webhook",
                campaign_id: campaignId,
                recipient_email: recipientEmail,
                // Spread the custom variables (like Trade, City) directly into PostHog properties for easy filtering
                ...variables,
            },
            timestamp: new Date().toISOString()
        };

        // Send the event to PostHog EU Cloud
        const phResponse = await fetch(POSTHOG_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(postHogData),
        });

        if (!phResponse.ok) {
            const errorText = await phResponse.text();
            throw new Error(`PostHog API Error: ${phResponse.status} - ${errorText}`);
        }

        console.log(`Successfully synced ${postHogEventName} to PostHog for ${recipientEmail}`);

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (error: any) {
        console.error("Error processing webhook:", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }
});
