import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@14.16.0?target=deno"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!
        const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

        const stripe = new Stripe(STRIPE_SECRET_KEY, {
            apiVersion: '2023-10-16',
        })

        const signature = req.headers.get('stripe-signature')
        if (!signature) {
            return new Response('No signature', { status: 400 })
        }

        const body = await req.text()
        let event

        try {
            event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)
        } catch (err) {
            console.error(`Webhook signature verification failed: ${err.message}`)
            return new Response(`Webhook Error: ${err.message}`, { status: 400 })
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        console.log(`Processing event: ${event.type}`)

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object
            const email = session.customer_details?.email || session.customer_email

            if (!email) {
                throw new Error('No email found in session')
            }

            console.log(`Payment confirmed for ${email}`)

            // Find user by email
            const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
            if (userError) throw userError

            const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

            if (!user) {
                console.log(`User with email ${email} not found.`)
                return new Response(JSON.stringify({ message: 'User not found' }), {
                    status: 200,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                })
            }

            // Determine days to add based on amount (session.amount_total is in cents)
            const amountTotal = session.amount_total || 0
            let daysToAdd = 30 // Default Pro Monthly

            if (amountTotal >= 9000) { // £90+ usually means Yearly (£99)
                daysToAdd = 366
            }

            // Extend subscription
            const { error: rpcError } = await supabase.rpc('extend_subscription', {
                p_user_id: user.id,
                p_days: daysToAdd
            })

            if (rpcError) throw rpcError

            console.log(`Successfully extended subscription for ${email} by ${daysToAdd} days.`)

            // Send Welcome Email
            try {
                const functionsUrl = `${SUPABASE_URL}/functions/v1/send-email`
                await fetch(functionsUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        to: email,
                        subject: 'Welcome to Emergency Tradesmen Pro!',
                        html: `
                            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                                <h1 style="color: #1e293b;">Welcome to Pro!</h1>
                                <p style="color: #475569;">Thank you for your payment. Your account has been upgraded.</p>
                                <p style="color: #475569;">Your subscription is now active for <strong>${daysToAdd} days</strong>.</p>
                                <div style="margin-top: 30px;">
                                    <a href="https://emergency-tradesmen.netlify.app/user/dashboard" style="background-color: #FACC15; padding: 12px 24px; text-decoration: none; color: black; border-radius: 6px; font-weight: bold;">Go to Dashboard</a>
                                </div>
                            </div>
                        `,
                        from_name: 'Emergency Tradesmen Team'
                    })
                })
            } catch (emailErr) {
                console.error('Failed to send welcome email:', emailErr)
            }
        }

        return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

    } catch (error) {
        console.error('Webhook Error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})
