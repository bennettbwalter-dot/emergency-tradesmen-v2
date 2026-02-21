import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TRADE_DESCRIPTIONS = {
    "gas-engineer": "Gas leaks, gas smell, carbon monoxide, boiler issues, pilot light, gas meter, hissing from pipes",
    "plumber": "Burst pipes, water leaks, flooding, no hot water, dripping taps, toilet issues, frozen pipes, radiator leaks",
    "electrician": "Power cuts, no electricity, fuse box tripped, sparks, burning smell from sockets, flickering lights, electric shock",
    "glazier": "Broken windows, smashed glass, cracked glass, shattered windows, glass doors broken, board up needed",
    "locksmith": "Locked out, key snapped, lost keys, broken lock, door won't open, burglary repair, lock jammed",
    "drain-specialist": "Blocked drains, blocked toilets, toilet overflowing, sewage smell, drain backing up, slow draining, manhole overflow",
    "breakdown": "Car won't start, breakdown, flat battery, engine cut out, stuck on roadside, jump start, tow truck, recovery",
    "roofer": "Roof leak, missing tiles, storm damage, chimney damage, flashing loose, roof collapse, water through ceiling",
    "builder": "Cracked walls, structural damage, ceiling collapse, subsidence, door frames broken, carpentry, masonry repair",
    "air-conditioning": "Air conditioning not working, AC broken, no cold air, air con leaking, heating and cooling issues, HVAC",
    "water-restoration": "Water damage, flood damage, water extraction, drying service, mould, dehumidifier, flood cleanup",
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const formData = await req.formData()
        const audioFile = formData.get('audio') as File

        if (!audioFile) {
            throw new Error('No audio file provided')
        }

        const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
        if (!OPENAI_API_KEY) {
            throw new Error('Missing OPENAI_API_KEY environment variable. Make sure to set it in Supabase Secrets.')
        }

        console.log(`[Edge Function] Received audio file: ${audioFile.name}, size: ${audioFile.size} bytes, type: ${audioFile.type}`)

        // =================================================================
        // STEP 1: Transcribe via Whisper
        // =================================================================
        const whisperFormData = new FormData()
        whisperFormData.append('file', audioFile)
        whisperFormData.append('model', 'gpt-4o-mini-transcribe')
        whisperFormData.append('language', 'en')
        whisperFormData.append('response_format', 'text')

        console.log("[Edge Function] STEP 1: Calling OpenAI Whisper API...")
        const whisperReq = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: whisperFormData
        })

        if (!whisperReq.ok) {
            const err = await whisperReq.text()
            console.error('[Edge Function] Whisper API Error:', err)
            throw new Error(`Whisper API error: ${whisperReq.status} ${whisperReq.statusText}`)
        }

        const transcriptText = await whisperReq.text()
        const transcript = (transcriptText || "").trim()

        console.log(`[Edge Function] STEP 1 Complete. Transcript: "${transcript}"`)

        if (!transcript) {
            return new Response(JSON.stringify({
                transcript: "",
                likely_trade_needed: "unknown",
                location: null,
                high_urgency: false,
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            })
        }

        // =================================================================
        // STEP 2: Triage with gpt-4o-mini
        // =================================================================
        const tradeRef = Object.entries(TRADE_DESCRIPTIONS)
            .map(([slug, desc]) => `- "${slug}": ${desc}`)
            .join("\n")

        console.log("[Edge Function] STEP 2: Triaging with gpt-4o-mini...")
        const chatReq = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: "system",
                        content: `You are an emergency dispatcher for "Emergency Tradesmen", a platform operating in the UK and USA.\n\nYour job: Analyse the customer's spoken emergency and extract three fields.\n\nTRADE LIST (pick exactly ONE slug):\n${tradeRef}\n\nRULES:\n1. "likely_trade_needed" — Pick the single best matching trade slug from the list above. If no match, use "unknown".\n2. "location" — Extract any city, town, county, state, postcode, or zip code mentioned. If none, use null.\n3. "high_urgency" — Set to true ONLY if the situation is life-threatening or involves severe property damage: gas leak, fire, flooding, structural collapse, electrocution, carbon monoxide. Otherwise false.\n\nReturn ONLY a valid JSON object: {"likely_trade_needed": "...", "location": "...", "high_urgency": true/false}\nNo markdown. No explanation.`
                    },
                    {
                        role: "user",
                        content: transcript
                    }
                ],
                temperature: 0,
                max_tokens: 150,
                response_format: { type: "json_object" }
            })
        })

        if (!chatReq.ok) {
            const err = await chatReq.text()
            console.error('[Edge Function] Triage API Error:', err)
            throw new Error(`Triage API error: ${chatReq.status} ${chatReq.statusText}`)
        }

        const chatRes = await chatReq.json()
        const triageText = chatRes.choices[0].message.content

        let triage
        try {
            triage = JSON.parse(triageText)
        } catch (e) {
            console.warn('[Edge Function] Failed to parse triage JSON', e)
            triage = {
                likely_trade_needed: "unknown",
                location: null,
                high_urgency: false
            }
        }

        console.log(`[Edge Function] STEP 2 Complete. Triage:`, triage)

        return new Response(JSON.stringify({
            transcript: transcript,
            likely_trade_needed: triage.likely_trade_needed || "unknown",
            location: triage.location || null,
            high_urgency: triage.high_urgency || false
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
        })

    } catch (error) {
        console.error('[Edge Function] Crash caught in error handler:', error.message)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
        })
    }
})
