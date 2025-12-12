import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const EMAIL_OCTOPUS_API_KEY = Deno.env.get("EMAILOCTOPUS_API_KEY");
const EMAIL_OCTOPUS_LIST_ID = Deno.env.get("EMAILOCTOPUS_LIST_ID");

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { email } = await req.json();

        if (!email) {
            return new Response(
                JSON.stringify({ error: "Email is required" }),
                {
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                    status: 400,
                }
            );
        }

        if (!EMAIL_OCTOPUS_API_KEY || !EMAIL_OCTOPUS_LIST_ID) {
            console.error("Missing EmailOctopus configuration");
            throw new Error("Server configuration error");
        }

        const response = await fetch(
            `https://emailoctopus.com/api/1.6/lists/${EMAIL_OCTOPUS_LIST_ID}/contacts`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    api_key: EMAIL_OCTOPUS_API_KEY,
                    email_address: email,
                    status: "SUBSCRIBED", // Or 'PENDING' for double opt-in
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("EmailOctopus API Error:", data);
            if (data.error && data.error.code === "MEMBER_EXISTS_WITH_EMAIL_ADDRESS") {
                return new Response(
                    JSON.stringify({ message: "You are already subscribed!" }),
                    {
                        headers: { ...corsHeaders, "Content-Type": "application/json" },
                        status: 200,
                    }
                );
            }
            throw new Error(data.error?.message || "Failed to subscribe");
        }

        return new Response(
            JSON.stringify({ message: "Successfully subscribed!" }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            }
        );
    } catch (error) {
        console.error("Function error:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 400,
            }
        );
    }
});
