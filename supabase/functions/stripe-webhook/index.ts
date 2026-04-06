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
            const customerId = session.customer
            const subscriptionId = session.subscription

            if (!email) {
                throw new Error('No email found in session')
            }

            console.log(`Payment confirmed for ${email} (Customer: ${customerId})`)

            // Find user by email (with pagination support)
            let user = null
            let page = 1
            while (true) {
                const { data: { users }, error: userError } = await supabase.auth.admin.listUsers({ page, perPage: 1000 })
                if (userError) throw userError
                if (!users || users.length === 0) break

                user = users.find(u => u.email?.toLowerCase() === email.toLowerCase())
                if (user) break
                if (users.length < 1000) break
                page++
            }

            if (!user) {
                console.log(`User with email ${email} not found.`)
                return new Response(JSON.stringify({ message: 'User not found' }), {
                    status: 200,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                })
            }

            // Fetch subscription from Stripe to reliably get the price_id
            let planName = "free"
            let daysToAdd = 30 // Default to Monthly duration unless identified
            
            if (subscriptionId) {
                const PRO_PRICE_ID = Deno.env.get('STRIPE_PRO_PRICE_ID')
                const PREMIUM_PRICE_ID = Deno.env.get('STRIPE_PREMIUM_PRICE_ID')
                
                const stripeSub = await stripe.subscriptions.retrieve(subscriptionId as string)
                if (stripeSub.items.data.length > 0) {
                    const priceId = stripeSub.items.data[0].price.id
                    
                    if (priceId === PRO_PRICE_ID) {
                        planName = "pro"
                    } else if (priceId === PREMIUM_PRICE_ID) {
                        planName = "premium"
                    } else {
                        console.warn(`Unknown price_id ${priceId} in checkout session. Assuming 'pro'.`)
                        planName = "pro"
                    }
                    
                    // Simple logic: if period is > 30 days, assume yearly duration for expiration
                    if (stripeSub.items.data[0].plan.interval === 'year') {
                        daysToAdd = 366
                    }
                }
            }

            console.log(`Provisioning tier '${planName}' plan (${daysToAdd} days)`)

            // Fetch tenant_id
            const { data: tenantData, error: tenantError } = await supabase
                .from('tenants')
                .select('tenant_id')
                .eq('owner_user_id', user.id)
                .single()

            if (tenantError || !tenantData) {
                console.error(`Failed to find tenant for user ${user.id}`, tenantError)
                return new Response(JSON.stringify({ message: 'Tenant not found, but payment received' }), {
                    status: 200,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                })
            }

            // Update/Upsert subscription with Stripe IDs
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + daysToAdd);

            const { error: upsertError } = await supabase
                .from('subscriptions')
                .upsert({
                    user_id: user.id,
                    tenant_id: tenantData.tenant_id,
                    payment_customer_id: customerId as string,
                    payment_subscription_id: subscriptionId as string,
                    plan: planName.toLowerCase() as any,
                    status: 'active',
                    subscription_expires_at: expiryDate.toISOString(),
                    failed_payment_attempts: 0,
                    updated_at: new Date().toISOString(),
                    tier_updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });

            if (upsertError) throw upsertError

            console.log(`Successfully extended subscription for ${email} by ${daysToAdd} days.`)

            // Send Welcome Email
            try {
                const isUS = email.includes('.us') || false // Fallback; domain detection isn't available server-side
                const brandName = 'Emergency Tradesmen'
                const dashboardUrl = 'https://emergencytradesmen.net/user/dashboard'

                const functionsUrl = `${SUPABASE_URL}/functions/v1/send-email`
                await fetch(functionsUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        to: email,
                        subject: `Welcome to ${brandName} Pro!`,
                        html: `
                            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                                <h1 style="color: #1e293b;">Welcome to Pro!</h1>
                                <p style="color: #475569;">Thank you for your payment. Your account has been upgraded.</p>
                                <p style="color: #475569;">Your subscription is now active for <strong>${daysToAdd} days</strong>.</p>
                                <div style="margin-top: 30px; text-align: center;">
                                    <a href="${dashboardUrl}" style="background-color: #FACC15; padding: 12px 24px; text-decoration: none; color: black; border-radius: 6px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
                                </div>
                            </div>
                        `,
                        from_name: `${brandName} Team`
                    })
                })
            } catch (emailErr) {
                console.error('Failed to send welcome email:', emailErr)
            }
        }

        if (event.type === 'customer.subscription.updated') {
            const subscription = event.data.object as Stripe.Subscription
            const customerId = subscription.customer as string

            // Fetch existing subscription first (needed for fallback plan name)
            const { data: sub } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('payment_customer_id', customerId)
                .single()

            // Mapping Plan correctly from updated webhooks
            const PRO_PRICE_ID = Deno.env.get('STRIPE_PRO_PRICE_ID')
            const PREMIUM_PRICE_ID = Deno.env.get('STRIPE_PREMIUM_PRICE_ID')
            
            let planName = "free"
            let daysToAdd = 0
            if (subscription.items.data.length > 0) {
                const priceId = subscription.items.data[0].price.id
                if (priceId === PRO_PRICE_ID) {
                    planName = "pro"
                    daysToAdd = subscription.items.data[0].plan.interval === 'year' ? 366 : 30
                } else if (priceId === PREMIUM_PRICE_ID) {
                    planName = "premium"
                    daysToAdd = 366
                }
            } else if (sub) {
                // Retain existing plan if items are empty (e.g., trial transition)
                planName = sub.plan || 'free'
            }

            const isCancelling = subscription.cancel_at_period_end;
            const cancelAt = subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null;

            console.log(`Subscription updated for customer ${customerId}. Plan: ${planName}, cancel_at_period_end: ${isCancelling}`)

            if (sub) {
                const updateData: Record<string, any> = {
                    plan: planName,
                    status: subscription.status,
                    cancel_at_period_end: isCancelling,
                    subscription_ends_at: cancelAt,
                    updated_at: new Date().toISOString(),
                    tier_updated_at: new Date().toISOString()
                }

                // Extend expiry on upgrade (when plan changes and we have a valid interval)
                if (daysToAdd > 0) {
                    const newExpiry = new Date()
                    newExpiry.setDate(newExpiry.getDate() + daysToAdd)
                    updateData.subscription_expires_at = newExpiry.toISOString()
                }

                await supabase
                    .from('subscriptions')
                    .update(updateData)
                    .eq('id', sub.id)
            }
        }

        if (event.type === 'customer.subscription.deleted') {
            const subscription = event.data.object as Stripe.Subscription
            const customerId = subscription.customer as string

            console.log(`Subscription deleted/expired for customer ${customerId}`)

            const { data: sub } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('payment_customer_id', customerId)
                .single()

            if (sub) {
                // Perform Hard Cancellation Downgrade
                await supabase
                    .from('subscriptions')
                    .update({
                        plan: 'free',
                        status: 'canceled',
                        cancel_at_period_end: false,
                        subscription_ends_at: null,
                        failed_payment_attempts: 0,
                        locked_at: null,
                        updated_at: new Date().toISOString(),
                        tier_updated_at: new Date().toISOString()
                    })
                    .eq('id', sub.id)
                console.log(`Downgraded subscription ${sub.id} to Free.`)
            }
        }

        if (event.type === 'invoice.payment_failed') {
            const invoice = event.data.object
            const customerId = invoice.customer as string

            console.log(`Payment failed for customer ${customerId}`)

            // Find subscription by customerId
            const { data: sub, error: subError } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('payment_customer_id', customerId)
                .single()

            if (subError || !sub) {
                console.warn(`No subscription found for customer ${customerId}`)
            } else {
                const newAttempts = (sub.failed_payment_attempts || 0) + 1
                const isLocked = newAttempts >= 2
                const newStatus = isLocked ? 'locked' : 'payment_failed'

                await supabase
                    .from('subscriptions')
                    .update({
                        failed_payment_attempts: newAttempts,
                        status: newStatus,
                        locked_at: isLocked ? new Date().toISOString() : null,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', sub.id)

                console.log(`Updated subscription ${sub.id}: attempts=${newAttempts}, status=${newStatus}`)

                // Notify User
                const { data: userData } = await supabase.auth.admin.getUserById(sub.user_id)
                const email = userData.user?.email
                const brandName = 'Emergency Tradesmen'
                const dashboardUrl = 'https://emergencytradesmen.net/user/dashboard'

                if (email) {
                    const subject = isLocked ? 'ACTION REQUIRED: Account Locked' : `Payment Failed - ${brandName}`
                    const message = isLocked 
                        ? 'Your account has been locked due to consecutive payment failures. Please update your payment method to restore access.'
                        : 'Our attempt to charge your card failed. We will try again soon, but please check your payment details.'

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
                                subject: subject,
                                html: `
                                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid ${isLocked ? '#ef4444' : '#f59e0b'}; padding: 20px; border-radius: 8px;">
                                        <h1 style="color: ${isLocked ? '#ef4444' : '#1e293b'};">${isLocked ? 'Account Locked' : 'Payment Issue'}</h1>
                                        <p style="color: #475569;">${message}</p>
                                        <div style="margin-top: 30px; text-align: center;">
                                            <a href="${dashboardUrl}" style="background-color: #FACC15; padding: 12px 24px; text-decoration: none; color: black; border-radius: 6px; font-weight: bold; display: inline-block;">Update Payment Method</a>
                                        </div>
                                    </div>
                                `,
                                from_name: `${brandName} Billing`
                            })
                        })
                    } catch (err) {
                        console.error('Failed to send failure notification:', err)
                    }
                }
            }
        }

        if (event.type === 'invoice.payment_succeeded') {
            const invoice = event.data.object
            const customerId = invoice.customer as string

            // Only care about recurring payments, not the initial checkout
            if (invoice.billing_reason !== 'subscription_create') {
                console.log(`Payment succeeded for customer ${customerId}`)

                const { data: sub } = await supabase
                    .from('subscriptions')
                    .select('*')
                    .eq('payment_customer_id', customerId)
                    .single()

                // Invoice lines contain the price ID
                const PRO_PRICE_ID = Deno.env.get('STRIPE_PRO_PRICE_ID')
                const PREMIUM_PRICE_ID = Deno.env.get('STRIPE_PREMIUM_PRICE_ID')
                
                let targetPlan = 'free'; // fallback
                let daysToAdd = 30
                if (invoice.lines?.data?.length > 0) {
                    const priceId = invoice.lines.data[0].price?.id
                    if (priceId === PRO_PRICE_ID) {
                        targetPlan = 'pro'
                    } else if (priceId === PREMIUM_PRICE_ID) {
                        targetPlan = 'premium'
                    } else {
                        targetPlan = sub?.plan || 'pro'; // retain if unknown
                    }

                    // Calculate expiry extension from invoice period
                    const periodEnd = invoice.lines.data[0].period?.end
                    if (periodEnd) {
                        const expiryDate = new Date(periodEnd * 1000)
                        daysToAdd = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                    } else {
                        // Fallback: infer from plan
                        daysToAdd = targetPlan === 'premium' ? 366 : 30
                    }
                }

                if (sub) {
                    const newExpiry = new Date()
                    newExpiry.setDate(newExpiry.getDate() + daysToAdd)

                    await supabase
                        .from('subscriptions')
                        .update({
                            failed_payment_attempts: 0,
                            status: 'active',
                            locked_at: null,
                            plan: targetPlan,
                            subscription_expires_at: newExpiry.toISOString(),
                            updated_at: new Date().toISOString(),
                            tier_updated_at: new Date().toISOString()
                        })
                        .eq('id', sub.id)

                    console.log(`Restored/Updated subscription ${sub.id} to active with plan ${targetPlan}, extended by ${daysToAdd} days.`)
                }
            }

        }
                }

                if (sub) {
                    await supabase
                        .from('subscriptions')
                        .update({
                            failed_payment_attempts: 0,
                            status: 'active',
                            locked_at: null,
                            plan: targetPlan, // Always ensure tier is correct upon successful invoice
                            updated_at: new Date().toISOString(),
                            tier_updated_at: new Date().toISOString()
                        })
                        .eq('id', sub.id)

                    console.log(`Restored/Updated subscription ${sub.id} to active with plan ${targetPlan}.`)
                }
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
