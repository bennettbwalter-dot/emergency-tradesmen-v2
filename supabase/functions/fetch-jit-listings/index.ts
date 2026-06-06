import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";
import { errorResponse, requireAdminOrServiceRole } from "../_shared/auth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate Limit Tracking Interface
interface ApiStats {
  yelp: { daily_calls: number; last_reset: string };
  here: { monthly_calls: number; last_reset_month: string };
}

// Ensure valid 10-digit US phone numbers
function formatUSPhone(phone: string): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  let core = digits;
  if (core.length === 11 && core.startsWith('1')) core = core.slice(1);
  return core.length === 10 ? core : null;
}

serve(async (req) => {
  // 1. Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    await requireAdminOrServiceRole(req);

    const { city, state, trade, countryCode = 'us' } = await req.json();

    if (!city || !state || !trade) {
      return new Response(JSON.stringify({ error: 'Missing required parameters: city, state, trade' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Only explicitly support US execution right now based on region separation rules
    if (countryCode !== 'us') {
      return new Response(JSON.stringify({ error: 'JIT Fetching currently restricted to US region only' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    console.log(`[JIT] Searching for ${trade} in ${city}, ${state}`);

    // 2. Initialize Supabase Admin Client to bypass RLS for insertions
    const supbaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('VITE_SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    if (!supbaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: 'Server is missing Supabase service credentials' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const supabase = createClient(supbaseUrl, supabaseServiceKey);

    // 3. Check existing data to prevent duplicates
    const { data: existingBusinesses } = await supabase
      .from('businesses')
      .select('phone, name')
      .eq('city', city.toLowerCase().replace(/-/g, ' '))
      .eq('trade', trade)
      .eq('country_code', 'us');

    const existingPhones = new Set(existingBusinesses?.map(b => b.phone) || []);
    const existingNames = new Set(existingBusinesses?.map(b => b.name.toLowerCase()) || []);

    const fetchedListings: Record<string, unknown>[] = [];

    // 4. API Configurations
    const yelpApiKey = Deno.env.get('YELP_API_KEY');
    const hereApiKey = Deno.env.get('HERE_API_KEY');

    // YELP FETCH (PRIMARY)
    if (yelpApiKey) {
      console.log(`[JIT] Launching Yelp Search...`);
      const yelpUrl = new URL('https://api.yelp.com/v3/businesses/search');
      yelpUrl.searchParams.append('term', trade.replace('-', ' '));
      yelpUrl.searchParams.append('location', `${city}, ${state}`);
      yelpUrl.searchParams.append('limit', '10');

      try {
        const yelpResp = await fetch(yelpUrl.toString(), {
          headers: { 'Authorization': `Bearer ${yelpApiKey}` }
        });

        if (yelpResp.ok) {
          const yelpData = await yelpResp.json();
          for (const b of (yelpData.businesses || [])) {
            const validPhone = formatUSPhone(b.phone || '');
            if (validPhone && !existingPhones.has(validPhone) && !existingNames.has(b.name.toLowerCase())) {
              fetchedListings.push({
                name: b.name,
                phone: validPhone,
                rating: b.rating || 0,
                reviewCount: b.review_count || 0,
                address: b.location?.address1 || null,
                website: b.url || null, // Fallback to Yelp profile
                source: 'yelp',
                is_jit_fetch: true,
                // Standard fields
                hours: '24 Hours', // Defaulting to emergency assumption if fetched via JIT
                isOpen24Hours: true,
                city: city.toLowerCase().replace(/-/g, ' '),
                trade: trade,
                country_code: 'us',
                state: state.toLowerCase(),
                verified: false,
                claim_status: 'unclaimed',
                isAvailableNow: true
              });
              existingPhones.add(validPhone);
              existingNames.add(b.name.toLowerCase());
            }
          }
        } else {
          console.error('[JIT] Yelp fetch failed:', yelpResp.status);
        }
      } catch (err) {
        console.error('[JIT] Yelp Error:', err);
      }
    }

    // HERE API FETCH (SECONDARY)
    // If Yelp didn't find enough, try HERE (10k free calls left)
    if (hereApiKey && fetchedListings.length < 5) {
      console.log(`[JIT] Launching HERE Search...`);
      const hereUrl = new URL('https://discover.search.hereapi.com/v1/discover');
      hereUrl.searchParams.append('q', `${trade.replace('-', ' ')} in ${city} ${state}`);
      hereUrl.searchParams.append('apiKey', hereApiKey);
      hereUrl.searchParams.append('limit', '10');

      try {
        const hereResp = await fetch(hereUrl.toString());
        if (hereResp.ok) {
          const hereData = await hereResp.json();
          for (const item of (hereData.items || [])) {
            const rawPhone = item.contacts?.[0]?.phone?.[0]?.value || '';
            const validPhone = formatUSPhone(rawPhone);

            if (validPhone && !existingPhones.has(validPhone) && !existingNames.has(item.title.toLowerCase())) {
              fetchedListings.push({
                name: item.title,
                phone: validPhone,
                rating: 0,
                reviewCount: 0,
                address: item.address?.street || null,
                website: item.contacts?.[0]?.www?.[0]?.value || null,
                source: 'here',
                is_jit_fetch: true,
                hours: '24 Hours',
                isOpen24Hours: true,
                city: city.toLowerCase().replace(/-/g, ' '),
                trade: trade,
                country_code: 'us',
                state: state.toLowerCase(),
                verified: false,
                claim_status: 'unclaimed',
                isAvailableNow: true
              });
              existingPhones.add(validPhone);
              existingNames.add(item.title.toLowerCase());
            }
          }
        }
      } catch (err) {
        console.error('[JIT] HERE Error:', err);
      }
    }

    // 5. Insert New Listings
    let insertedCount = 0;
    if (fetchedListings.length > 0) {
      console.log(`[JIT] Inserting ${fetchedListings.length} new listings into Supabase...`);
      const { error: insertError } = await supabase
        .from('businesses')
        .insert(fetchedListings);

      if (insertError) {
        console.error('[JIT] Insert Error:', insertError);
        // Return what we fetched anyway so the UI can display it immediately even if save failed
      } else {
        insertedCount = fetchedListings.length;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      fetched: fetchedListings.length,
      inserted: insertedCount,
      listings: fetchedListings
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('[JIT] Fatal Error:', error);
    if (error instanceof Error && 'status' in error) {
      return errorResponse(error, corsHeaders);
    }
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
