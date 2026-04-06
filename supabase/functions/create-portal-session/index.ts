import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@14.16.0?target=deno"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!

        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            return new Response('No authorization header', { status: 401 })
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)

        if (authError || !user) {
            return new Response('Unauthorized', { status: 401 })
        }

        // Get customer ID
        const { data: sub, error: subError } = await supabase
            .from('subscriptions')
            .select('payment_customer_id')
            .eq('user_id', user.id)
            .single()

        if (subError || !sub?.payment_customer_id) {
            return new Response(JSON.stringify({ error: 'No Stripe customer found' }), {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        const stripe = new Stripe(STRIPE_SECRET_KEY, {
            apiVersion: '2023-10-16',
        })

        // Validate origin against known domains
        const origin = req.headers.get('origin') || 'https://emergencytradesmen.net'
        const allowedOrigins = [
            'https://emergencytradesmen.net',
            'https://emergencycontractors.net',
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:5173',
            'http://127.0.0.1:5173',
        ]
        const returnUrl = allowedOrigins.includes(origin) ? origin : 'https://emergencytradesmen.net'

        const session = await stripe.billingPortal.sessions.create({
            customer: sub.payment_customer_id,
            return_url: `${returnUrl}/account/billing?billing_updated=true`,
        })

        return new Response(JSON.stringify({ url: session.url }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

    } catch (error) {
        console.error('Error creating portal session:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})
