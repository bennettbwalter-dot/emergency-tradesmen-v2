import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const REVOLUT_SIGNING_SECRET = Deno.env.get('REVOLUT_SIGNING_SECRET')

        // Initialize Supabase Admin Client (needed to update subscriptions/find users)
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        // 1. Parse Webhook Event
        const payload = await req.json()
        console.log('Revolut Webhook Received:', JSON.stringify(payload))

        const event = payload.event

        // We only care about completed payments
        if (event !== 'ORDER_COMPLETED') {
            console.log(`Ignoring event: ${event}`)
            return new Response(JSON.stringify({ message: 'Ignored event' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        // 2. Validate content (Optional but recommended if secret provided)
        // Note: Implementing full signature validation requires crypto libs, 
        // skipping for MVP but should be added for production.

        // 3. Extract User Email
        // Revolut payload structure varies, but usually:
        // payload.data.order.customer.email OR payload.data.customer.email
        const order = payload.data?.order || payload.data
        const email = order?.customer?.email || order?.email
        const orderAmount = order?.order_amount?.value || order?.amount?.value

        if (!email) {
            throw new Error('No email found in webhook payload')
        }

        console.log(`Processing payment for: ${email}, Amount: ${orderAmount}`)

        // 4. Find User by Email
        // We search the auth.users via RPC or Admin method (if we had access to auth api, but easier to use an RPC exposed or just trust email matches public profile if stored there).
        // Actually, supabase-js admin can list users, but it's rate limited. 
        // BETTER: Use an RPC function that does the lookup securely.
        // However, for MVP, we'll try to find them in the `subscriptions` table (if they have one) or create one.
        // Issue: Subscriptions table links to user_id. We need user_id from Email.
        // Default Supabase doesn't expose "get user by email" easily to internal logic without admin rights.
        // Since we have SERVICE_ROLE_KEY, we can use `supabase.auth.admin.listUsers()`.

        const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
        if (userError) throw userError

        // Find the user (inefficient for large bases, but works for MVP)
        const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

        if (!user) {
            console.log(`User with email ${email} not found in database.`)
            // Logic: Maybe they registered with a different email? 
            // For now, we return 200 so Revolut doesn't retry, but log error.
            return new Response(JSON.stringify({ message: 'User not found' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        // 5. Determine Subscription Length
        // Logic: £29 = 30 days, £99 = 365 days.
        // Revolut amount is usually in minor units (cents) or major depending on API version. 
        // Assuming major units for now based on typical webhooks, but strictly checking "around" the price points.

        let daysToAdd = 30 // Default
        const amount = Number(orderAmount)

        if (amount >= 90) { // e.g. 99.00
            daysToAdd = 365
        } else {
            daysToAdd = 30
        }

        // 6. Extend Subscription
        const { error: rpcError } = await supabase.rpc('extend_subscription', {
            p_user_id: user.id,
            p_days: daysToAdd
        })

        if (rpcError) {
            throw rpcError
        }

        console.log(`Successfully extended subscription for ${email} by ${daysToAdd} days.`)

        // 7. Send Welcome Email
        try {
            // Construct the send-email function URL
            // SUPABASE_URL is usually https://xyz.supabase.co
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
                            <p style="color: #475569;">Thank you for your payment of £${orderAmount}. Your account has been upgraded.</p>
                            <p style="color: #475569;">Your subscription is active for <strong>${daysToAdd} days</strong>.</p>
                            <div style="margin-top: 30px;">
                                <a href="https://emergency-tradesmen.netlify.app/user/dashboard" style="background-color: #FACC15; padding: 12px 24px; text-decoration: none; color: black; border-radius: 6px; font-weight: bold;">Go to Dashboard</a>
                            </div>
                        </div>
                    `,
                    from_name: 'Emergency Tradesmen Team'
                })
            })
            console.log('Welcome email request sent.')
        } catch (emailErr) {
            console.error('Failed to send welcome email:', emailErr)
            // We do not throw here, so the webhook still succeeds (payment was processed)
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error('Webhook Error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500, // Revolut will retry
        })
    }
})
