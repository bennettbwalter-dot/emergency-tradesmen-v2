
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { to, subject, html, text, from_name } = await req.json()
        const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')
        const FROM_EMAIL = Deno.env.get('SENDGRID_FROM_EMAIL') || 'emergencytradesmen@outlook.com'

        if (!SENDGRID_API_KEY) {
            throw new Error('Missing SENDGRID_API_KEY')
        }

        const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SENDGRID_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                personalizations: [
                    {
                        to: [{ email: to }],
                        subject: subject,
                    },
                ],
                from: {
                    email: FROM_EMAIL,
                    name: from_name || 'Emergency Tradesmen',
                },
                content: [
                    {
                        type: 'text/html',
                        value: html || text || '',
                    },
                ],
            }),
        })

        const data = await res.json().catch(() => null)

        if (!res.ok) {
            return new Response(
                JSON.stringify({ error: data || 'Failed to send email' }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 400
                }
            )
        }

        return new Response(
            JSON.stringify({ message: 'Email sent successfully', data }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500
            }
        )
    }
})

