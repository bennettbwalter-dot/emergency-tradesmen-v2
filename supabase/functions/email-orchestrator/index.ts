import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        // ESP API Key (TBD)
        const espApiKey = Deno.env.get('EMAIL_SERVICE_PROVIDER_API_KEY');

        if (!supabaseUrl || !supabaseKey) {
            throw new Error("Missing environment variables");
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // 1. Fetch campaigns that are 'active' and need processing
        const { data: campaigns, error: cmpError } = await supabase
            .from('email_campaigns')
            .select('*')
            .eq('status', 'active');

        if (cmpError) throw cmpError;
        if (!campaigns || campaigns.length === 0) {
            return new Response(JSON.stringify({ message: "No active campaigns to process." }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const results = [];

        for (const campaign of campaigns) {
            console.log(`Processing campaign: ${campaign.name}`);

            // Calculate how many contacts to fetch
            const limit = campaign.batch_size || 50;

            // 2. Fetch contacts matching criteria that haven't been emailed
            let query = supabase
                .from('businesses')
                .select('id, name, email, city, trade, phone')
                .eq('country_code', campaign.target_country)
                .not('email', 'is', null)
                .not('email', 'eq', '')
                .is('last_emailed_at', null)
                .limit(limit);

            if (campaign.target_trade) {
                query = query.eq('trade', campaign.target_trade);
            }

            const { data: contacts, error: contactError } = await query;

            if (contactError) {
                console.error(`Error fetching contacts for ${campaign.id}:`, contactError);
                continue;
            }

            if (!contacts || contacts.length === 0) {
                console.log(`No remaining un-emailed contacts for campaign ${campaign.name}`);
                await supabase.from('email_campaigns').update({ status: 'completed' }).eq('id', campaign.id);
                continue;
            }

            // 3. Add contacts to New Email Service Provider (TBD)
            let imported = 0;
            let skipped = 0;
            const listId = campaign.esp_list_id;

            for (const contact of contacts) {
                // TODO: Implement New ESP API logic here
                imported++; // Placeholder for simulation

                // Mark as emailed to prevent re-sending
                await supabase.from('businesses').update({ last_emailed_at: new Date().toISOString() }).eq('id', contact.id);

                // rate limit self 
                await new Promise(r => setTimeout(r, 100));
            }

            // Update Campaign metrics
            await supabase.from('email_campaigns')
                .update({
                    total_sent: (campaign.total_sent || 0) + imported,
                    last_run_at: new Date().toISOString()
                })
                .eq('id', campaign.id);

            // Log the batch
            await supabase.from('email_campaign_logs')
                .insert({
                    campaign_id: campaign.id,
                    status: 'success',
                    contacts_imported: imported,
                    contacts_skipped: skipped
                });

            results.push({ campaign: campaign.name, imported, skipped });
        }

        return new Response(JSON.stringify({ success: true, processed: results }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (error) {
        console.error("Orchestrator error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
