import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { writeFileSync } from 'fs';

dotenv.config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const FOURSQUARE_API_KEY = process.env.FOURSQUARE_API_KEY;

async function getBusinesses() {
    const { data, error } = await supabase
        .from('businesses')
        .select('id, name, city, trade, phone, website, postcode')
        .not('name', 'is', null)
        .not('phone', 'is', null)
        .limit(50);

    if (error) {
        console.error('Error:', error);
        return [];
    }

    return data;
}

async function fetchFoursquareReviews(businessName, city, phone) {
    if (!FOURSQUARE_API_KEY) {
        console.log('⚠️  No Foursquare API key');
        return [];
    }

    // Search for the business
    const searchUrl = `https://api.foursquare.com/v3/places/search?query=${encodeURIComponent(businessName)}&near=${encodeURIComponent(city)}&limit=3`;

    try {
        const searchRes = await fetch(searchUrl, {
            headers: {
                'Authorization': FOURSQUARE_API_KEY,
                'accept': 'application/json'
            }
        });

        if (!searchRes.ok) {
            console.log(`   ❌ Foursquare search error: ${searchRes.status}`);
            return [];
        }

        const searchData = await searchRes.json();
        const places = searchData.results || [];

        if (places.length === 0) return [];

        // Get reviews for first match
        const fsqId = places[0].fsq_id;
        const reviewsUrl = `https://api.foursquare.com/v3/places/${fsqId}/tips`;

        const reviewsRes = await fetch(reviewsUrl, {
            headers: {
                'Authorization': FOURSQUARE_API_KEY,
                'accept': 'application/json'
            }
        });

        if (!reviewsRes.ok) return [];

        const reviewsData = await reviewsRes.json();
        return (reviewsData.tips || []).slice(0, 5).map(tip => ({
            text: tip.text,
            rating: tip.rating || 4,
            created_at: tip.created_at,
            user_name: tip.user ? `${tip.user.first_name || ''} ${tip.user.last_name || ''}`.trim() : 'Anonymous'
        }));
    } catch (err) {
        console.log(`   ❌ Error: ${err.message}`);
        return [];
    }
}

async function main() {
    console.log('=== FETCHING REVIEWS FROM FOURSQUARE ===\n');

    const businesses = await getBusinesses();
    console.log(`Found ${businesses.length} businesses with phone numbers\n`);

    const allReviews = [];
    let foundCount = 0;

    for (const business of businesses.slice(0, 30)) {
        console.log(`Checking: ${business.name} in ${business.city}`);

        const reviews = await fetchFoursquareReviews(business.name, business.city, business.phone);

        if (reviews.length > 0) {
            foundCount++;
            console.log(`   ✅ Found ${reviews.length} reviews\n`);

            reviews.forEach((review, i) => {
                const nameParts = review.user_name.split(' ');
                const initials = nameParts.map(n => n[0]).join('').substring(0, 2).toUpperCase() || '??';

                allReviews.push({
                    business_id: business.id,
                    reviewer_name: review.user_name,
                    reviewer_initials: initials,
                    rating: review.rating,
                    title: review.text.substring(0, 50) + (review.text.length > 50 ? '...' : ''),
                    comment: review.text,
                    review_date: new Date(review.created_at * 1000).toISOString(),
                    verified: true,
                    source: 'foursquare',
                    helpful: Math.floor(Math.random() * 8),
                    created_at: new Date().toISOString()
                });
            });
        } else {
            console.log(`   ⚠️  No reviews\n`);
        }

        await new Promise(r => setTimeout(r, 500));
    }

    console.log('\n=== SUMMARY ===');
    console.log(`Businesses checked: 30`);
    console.log(`Businesses with reviews: ${foundCount}`);
    console.log(`Total reviews found: ${allReviews.length}`);

    if (allReviews.length > 0) {
        writeFileSync('scripts/fetched_reviews_foursquare.json', JSON.stringify(allReviews, null, 2));
        console.log(`\n📁 Saved to scripts/fetched_reviews_foursquare.json`);
    }
}

main().catch(console.error);
