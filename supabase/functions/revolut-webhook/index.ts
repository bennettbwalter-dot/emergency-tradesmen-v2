import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, Revolut-Signature, Revolut-Request-Timestamp',
}

async function verifySignature(secret: string, signature: string, timestamp: string, body: string): Promise<boolean> {
    const encoder = new TextEncoder()
    const toSign = `v1.${timestamp}.${body}`
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"]
    )

    // Revolut sends hex signature
    // We compute the HMAC and compare hex strings.

    const signed = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(toSign)
    )

    const computedSignature = Array.from(new Uint8Array(signed))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

    return computedSignature === signature
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

        // Initialize Supabase Admin Client
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        // 1. Get Raw Body (Critical for signature verification)
        const bodyText = await req.text()

        // 2. Validate Signature
        if (REVOLUT_SIGNING_SECRET) {
            const signature = req.headers.get('Revolut-Signature')
            const timestamp = req.headers.get('Revolut-Request-Timestamp')

            if (!signature || !timestamp) {
                console.error('Missing Revolut signature headers')
                return new Response(JSON.stringify({ error: 'Missing signature headers' }), {
                    status: 401,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                })
            }

            // Replay attack protection (5 mins)
            const now = Date.now()
            const reqTime = parseInt(timestamp)
            if (isNaN(reqTime) || Math.abs(now - reqTime) > 5 * 60 * 1000) {
                console.error('Request timestamp too old or invalid')
                return new Response(JSON.stringify({ error: 'Timestamp invalid' }), {
                    status: 401,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                })
            }

            const isValid = await verifySignature(REVOLUT_SIGNING_SECRET, signature, timestamp, bodyText)

            if (!isValid) {
                console.error('Invalid Revolut Signature')
                return new Response(JSON.stringify({ error: 'Invalid signature' }), {
                    status: 401,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                })
            }
        }

        // 3. Parse Payload
        let payload
        try {
            payload = JSON.parse(bodyText)
        } catch (e) {
            throw new Error('Invalid JSON body')
        }

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

        // 4. Extract User Email
        const order = payload.data?.order || payload.data
        const email = order?.customer?.email || order?.email
        const orderAmount = order?.order_amount?.value || order?.amount?.value

        if (!email) {
            throw new Error('No email found in webhook payload')
        }

        console.log(`Processing payment for: ${email}, Amount: ${orderAmount}`)

        // 5. Find User by Email
        const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
        if (userError) throw userError

        const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

        if (!user) {
            console.log(`User with email ${email} not found in database.`)
            return new Response(JSON.stringify({ message: 'User not found' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        // 6. Determine Subscription Length
        let daysToAdd = 30 // Default
        const amount = Number(orderAmount)

        if (amount >= 90) { // e.g. 99.00
            daysToAdd = 366 // Leap year safe
        } else {
            daysToAdd = 30
        }

        // 7. Extend Subscription
        const { error: rpcError } = await supabase.rpc('extend_subscription', {
            p_user_id: user.id,
            p_days: daysToAdd
        })

        if (rpcError) {
            throw rpcError
        }

        console.log(`Successfully extended subscription for ${email} by ${daysToAdd} days.`)

        // 8. Send Welcome Email
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
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error('Webhook Error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
