import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
        const resendApiKey = Deno.env.get("RESEND_API_KEY");

        if (!supabaseUrl || !supabaseKey) {
            throw new Error("Missing Supabase configuration in environment.");
        }

        if (!resendApiKey) {
            throw new Error("RESEND_API_KEY environment variable is not configured.");
        }

        // Fired from Supabase DB Trigger Webhook (containing "record" schema)
        // or a direct JSON post request
        const body = await req.json();
        const record = body.record || body;

        const {
            id,
            business_id,
            customer_name,
            customer_email,
            customer_phone,
            details,
            urgency = "Standard"
        } = record;

        if (!business_id) {
            throw new Error("Missing business_id in payload.");
        }

        // Initialize Supabase Client to fetch business details
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data: business, error: bizError } = await supabase
            .from("businesses")
            .select("name, email, trade, city, country_code")
            .eq("id", business_id)
            .single();

        if (bizError || !business) {
            throw new Error(`Failed to find business with ID ${business_id}: ${bizError?.message}`);
        }

        const countryCode = business.country_code || "GB";
        const brandName = countryCode === "US" ? "Emergency Contractors" : "Emergency Tradesmen";
        const siteUrl = countryCode === "US" ? "https://emergencycontractors.net" : "https://emergencytradesmen.net";

        const results = [];

        // 1. Send Alert Email to the Business (if they have an active email)
        if (business.email && business.email.includes("@")) {
            const businessHtml = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
                    <div style="background-color: #1e293b; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
                        <h1 style="color: #FACC15; margin: 0; font-size: 24px;">🚨 New ${urgency} Lead Alert!</h1>
                        <p style="color: #e2e8f0; margin: 8px 0 0 0; font-size: 14px;">Incoming request from ${brandName}</p>
                    </div>
                    <div style="border: 1px solid #e2e8f0; border-top: none; padding: 30px; border-radius: 0 0 12px 12px; background-color: #fafafa;">
                        <p style="font-size: 16px; margin-top: 0;">Hi <strong>${business.name}</strong>,</p>
                        <p>A customer has just submitted an urgent inquiry on our platform requesting assistance from a <strong>${business.trade || "contractor"}</strong> in <strong>${business.city}</strong>.</p>
                        
                        <div style="background-color: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
                            <h3 style="color: #1e293b; margin-top: 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; font-size: 15px;">📋 Lead Details</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 6px 0; font-weight: bold; width: 35%; color: #64748b; font-size: 14px;">Customer Name:</td>
                                    <td style="padding: 6px 0; font-size: 14px;">${customer_name}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; font-weight: bold; color: #64748b; font-size: 14px;">Phone Number:</td>
                                    <td style="padding: 6px 0; font-size: 14px; font-weight: bold;"><a href="tel:${customer_phone}" style="color: #2563eb; text-decoration: none;">${customer_phone}</a></td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; font-weight: bold; color: #64748b; font-size: 14px;">Email:</td>
                                    <td style="padding: 6px 0; font-size: 14px;"><a href="mailto:${customer_email}" style="color: #2563eb; text-decoration: none;">${customer_email}</a></td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; font-weight: bold; color: #64748b; font-size: 14px;">Urgency Level:</td>
                                    <td style="padding: 6px 0; font-size: 14px;"><span style="background-color: ${urgency === "Emergency" ? "#fee2e2" : "#fef9c3"}; color: ${urgency === "Emergency" ? "#991b1b" : "#854d0e"}; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: bold;">${urgency}</span></td>
                                </tr>
                            </table>
                            <h4 style="color: #1e293b; margin-bottom: 6px; font-size: 14px;">Inquiry Description:</h4>
                            <p style="background-color: #f8fafc; border-left: 4px solid #FACC15; padding: 12px; margin: 0; font-style: italic; font-size: 14px; color: #475569;">"${details}"</p>
                        </div>

                        <p><strong>Action Required:</strong> Please contact the customer immediately on their phone number listed above to arrange assistance.</p>
                        
                        <div style="margin: 30px 0; text-align: center;">
                            <a href="${siteUrl}/user/dashboard" style="background-color: #FACC15; padding: 14px 28px; text-decoration: none; color: #000; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">Go to Dashboard →</a>
                        </div>
                    </div>
                    <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #94a3b8;">
                        <p>© ${new Date().getFullYear()} ${brandName}. All rights reserved.</p>
                    </div>
                </div>
            `;

            const bizRes = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${resendApiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    from: `${brandName} Leads <leads@resend.dev>`,
                    to: [business.email],
                    subject: `🚨 Urgent: New Emergency Lead in ${business.city} - ${customer_name}`,
                    html: businessHtml,
                }),
            });

            if (!bizRes.ok) {
                const bizErr = await bizRes.json();
                console.error(`Failed to send email to business ${business.email}:`, bizErr);
                results.push({ type: "business", status: "failed", error: bizErr });
            } else {
                results.push({ type: "business", status: "success" });
            }
        } else {
            console.log(`Skipped business alert: no valid email found for business ID ${business_id}`);
            results.push({ type: "business", status: "skipped", reason: "no_valid_email" });
        }

        // 2. Send Receipt Confirmation Email to the Customer
        if (customer_email && customer_email.includes("@")) {
            const customerHtml = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
                    <div style="background-color: #1a1614; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
                        <h1 style="color: #FACC15; margin: 0; font-size: 24px;">🔧 Inquiry Received</h1>
                        <p style="color: #e2e8f0; margin: 8px 0 0 0; font-size: 14px;">We are connecting you with local assistance</p>
                    </div>
                    <div style="border: 1px solid #e2e8f0; border-top: none; padding: 30px; border-radius: 0 0 12px 12px; background-color: #fafafa;">
                        <p style="font-size: 16px; margin-top: 0;">Dear <strong>${customer_name}</strong>,</p>
                        <p>Thank you for using <strong>${brandName}</strong>. We have received your inquiry and have dispatched it directly to our verified service provider:</p>
                        
                        <div style="background-color: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
                            <h3 style="color: #1e293b; margin-top: 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; font-size: 15px;">🏢 Dispatched To</h3>
                            <p style="font-size: 16px; font-weight: bold; margin: 6px 0 0 0; color: #1e293b;">${business.name}</p>
                            <p style="font-size: 14px; margin: 4px 0; color: #64748b;">Specialist: ${business.trade} • Location: ${business.city}</p>
                        </div>

                        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
                            <h3 style="color: #1e293b; margin-top: 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; font-size: 14px;">📝 Your Request Details</h3>
                            <p style="font-size: 14px; margin: 6px 0;"><strong>Details:</strong> "${details}"</p>
                            <p style="font-size: 14px; margin: 6px 0;"><strong>Urgency Level:</strong> ${urgency}</p>
                        </div>

                        <p><strong>What happens next?</strong></p>
                        <p>The tradesperson/contractor will review your request and call you directly at <strong>${customer_phone}</strong> to confirm scheduling and arrival time. In high-urgency situations, they typically reach out within minutes.</p>
                        
                        <p style="font-size: 14px; color: #64748b; margin-top: 24px;">If you have any questions or did not receive a response shortly, please visit our support desk at <a href="${siteUrl}/contact" style="color: #2563eb; text-decoration: none;">${brandName} Support</a>.</p>
                    </div>
                    <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #94a3b8;">
                        <p>© ${new Date().getFullYear()} ${brandName}. All rights reserved.</p>
                    </div>
                </div>
            `;

            const custRes = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${resendApiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    from: `${brandName} <inquiries@resend.dev>`,
                    to: [customer_email],
                    subject: `🔧 Inquiry Received - ${business.name} has been notified`,
                    html: customerHtml,
                }),
            });

            if (!custRes.ok) {
                const custErr = await custRes.json();
                console.error(`Failed to send email to customer ${customer_email}:`, custErr);
                results.push({ type: "customer", status: "failed", error: custErr });
            } else {
                results.push({ type: "customer", status: "success" });
            }
        }

        return new Response(
            JSON.stringify({ success: true, processed: results }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            }
        );
    } catch (error) {
        console.error("Notify quote function error:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 500,
            }
        );
    }
});
