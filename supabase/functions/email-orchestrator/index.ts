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
        const resendApiKey = Deno.env.get('RESEND_API_KEY');

        if (!supabaseUrl || !supabaseKey) {
            throw new Error("Missing environment variables");
        }

        if (!resendApiKey) {
            console.warn("RESEND_API_KEY not set - running in dry-run mode");
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

            // 2. Fetch contacts matching criteria that haven't been emailed and are verified active
            let query = supabase
                .from('businesses')
                .select('id, name, email, city, trade, phone, country_code')
                .eq('country_code', campaign.target_country)
                .eq('verified', true) // Double check: only email businesses verified as active/operational!
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

            // 3. Send emails via Resend
            let sent = 0;
            let failed = 0;

            for (const contact of contacts) {
                try {
                    const brandName = contact.country_code === 'US' ? 'Emergency Contractors' : 'Emergency Tradesmen';
                    const siteUrl = contact.country_code === 'US'
                        ? 'https://emergencycontractors.net'
                        : 'https://emergencytradesmen.net';

                    const emailHtml = `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                            <h2 style="color: #1e293b;">Is your business listed on ${brandName}?</h2>
                            <p>Hi ${contact.name || 'there'},</p>
                            <p>Your business appears as a public listing for <strong>${contact.trade || 'your business'}</strong> in ${contact.city || 'your area'} on ${brandName}.</p>
                            <p><strong>Claim your free listing</strong> to check, correct, update, or request removal of your business details.</p>
                            <p><strong>New bonus:</strong> Sign up to Pro Yearly or Agency / Multi-Location and we'll build your emergency-ready website completely free.</p>
                            <ul>
                                <li>✅ Direct phone calls from homeowners in emergencies</li>
                                <li>✅ WhatsApp integration for instant leads</li>
                                <li>✅ Pro tier features: priority placement, analytics, and enhanced profile controls</li>
                                <li>✅ Professional emergency-ready website included at no extra cost with no upfront build fee</li>
                            </ul>
                            <div style="margin: 30px 0; text-align: center;">
                                <a href="${siteUrl}/business/claim" style="background-color: #FACC15; padding: 14px 28px; text-decoration: none; color: #000; border-radius: 8px; font-weight: bold; font-size: 16px;">Claim Your Free Listing →</a>
                            </div>
                            <p style="color: #64748b; font-size: 12px;">If you'd prefer not to receive these emails, reply with "unsubscribe" and we'll remove you.</p>
                        </div>
                    `;

                    if (resendApiKey) {
                        const res = await fetch('https://api.resend.com/emails', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${resendApiKey}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                from: `${brandName} <onboarding@resend.dev>`,
                                to: [contact.email],
                                subject: `Claim your free ${brandName} listing for ${contact.trade || 'your business'}`,
                                html: emailHtml
                            })
                        });

                        if (!res.ok) {
                            const err = await res.json();
                            console.error(`Failed to send to ${contact.email}:`, err);
                            failed++;
                            continue;
                        }
                    } else {
                        console.log(`[DRY RUN] Would email ${contact.email}: ${contact.name || contact.trade} in ${contact.city}`);
                    }

                    sent++;

                    // Mark as emailed
                    await supabase.from('businesses').update({ last_emailed_at: new Date().toISOString() }).eq('id', contact.id);

                    // Rate limit
                    await new Promise(r => setTimeout(r, 200));
                } catch (err) {
                    console.error(`Error emailing ${contact.email}:`, err);
                    failed++;
                }
            }

            // Update Campaign metrics
            await supabase.from('email_campaigns')
                .update({
                    total_sent: (campaign.total_sent || 0) + sent,
                    last_run_at: new Date().toISOString()
                })
                .eq('id', campaign.id);

            // Log the batch
            await supabase.from('email_campaign_logs')
                .insert({
                    campaign_id: campaign.id,
                    status: sent > 0 ? 'success' : 'failed',
                    contacts_imported: sent,
                    contacts_skipped: failed
                });

            results.push({ campaign: campaign.name, sent, failed });
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
