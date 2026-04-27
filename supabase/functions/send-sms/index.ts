import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phone, trade, city, country, siteUrl } = await req.json()

    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
    const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      throw new Error('Missing Twilio credentials')
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // Normalise to E.164 — handles (218) 275-5476, +44 format, etc.
    const digits = phone.replace(/\D/g, '')
    const e164Phone = country === 'GB'
      ? (digits.startsWith('44') ? `+${digits}` : `+44${digits.replace(/^0/, '')}`)
      : (digits.startsWith('1') ? `+${digits}` : `+1${digits}`)

    // Persist request
    const { data: request, error: insertErr } = await supabase
      .from('pro_confirmation_requests')
      .insert({ phone: e164Phone, trade, city, country })
      .select()
      .single()

    if (insertErr) throw insertErr

    // Check if matching listings exist for this trade + city
    const { data: matches } = await supabase
      .from('businesses')
      .select('id')
      .eq('trade', trade)
      .ilike('city', city)
      .eq('country_code', country)
      .limit(1)

    if (!matches || matches.length === 0) {
      return new Response(
        JSON.stringify({ sent: false, queued: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Build SMS
    const tradeDisplay = trade.replace(/-/g, ' ')
    const cityDisplay = city.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
    const listingPath = `/emergency-${trade}/${city.toLowerCase().replace(/\s+/g, '-')}`
    const url = siteUrl ? `${siteUrl}${listingPath}` : listingPath
    const body = `Good news! We've confirmed local ${tradeDisplay} experts in ${cityDisplay} ready now. Browse listings: ${url}`

    // Send via Twilio REST API
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`
    const twilioRes = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ From: TWILIO_PHONE_NUMBER, To: e164Phone, Body: body }).toString(),
    })

    if (!twilioRes.ok) {
      const err = await twilioRes.json().catch(() => null)
      throw new Error(`Twilio error: ${JSON.stringify(err)}`)
    }

    await supabase
      .from('pro_confirmation_requests')
      .update({ notified_at: new Date().toISOString() })
      .eq('id', request.id)

    return new Response(
      JSON.stringify({ sent: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
