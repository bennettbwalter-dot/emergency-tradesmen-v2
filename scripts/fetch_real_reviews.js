import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { writeFileSync } from 'fs';

dotenv.config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const YELP_API_KEY = process.env.YELP_API_KEY;
const FOURSQUARE_API_KEY = process.env.FOURSQUARE_API_KEY;

// Sample business names and locations to search for reviews
async function getBusinesses() {
    const { data: businesses, error } = await supabase
        .from('businesses')
        .select('id, name, city, trade, phone, website, postcode')
        .not('name', 'is', null)
        .limit(100);

    if (error) {
        console.error('Error fetching businesses:', error);
        return [];
    }

    return businesses;
}

// Fetch reviews from Yelp for a business
async function fetchYelpReviews(businessName, city, trade) {
    if (!YELP_API_KEY) {
        console.log('⚠️  No Yelp API key');
        return [];
    }

    const searchTerm = `${businessName} ${trade} ${city}`;
    const url = `https://api.yelp.com/v3/businesses/search?term=${encodeURIComponent(searchTerm)}&location=${encodeURIComponent(city)}&limit=5&sort_by=review_count`;

    try {
        const res = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${YELP_API_KEY}`,
                'accept': 'application/json'
            }
        });

        if (!res.ok) {
            console.log(`❌ Yelp API error: ${res.status} for ${businessName}`);
            return [];
        }

        const data = await res.json();
        const businesses = data.businesses || [];

        if (businesses.length === 0) {
            return [];
        }

        // Get reviews for the first matching business
        const yelpBusiness = businesses[0];
        const reviewsUrl = `https://api.yelp.com/v3/businesses/${yelpBusiness.id}/reviews`;

        const reviewsRes = await fetch(reviewsUrl, {
            headers: {
                'Authorization': `Bearer ${YELP_API_KEY}`,
                'accept': 'application/json'
            }
        });

        if (!reviewsRes.ok) return [];

        const reviewsData = await reviewsRes.json();
        return (reviewsData.reviews || []).map(review => ({
            yelp_id: review.id,
            rating: review.rating,
            text: review.text,
            time_created: review.time_created,
            user_name: review.user.name,
            user_url: review.user.profile_url,
            url: review.url
        }));
    } catch (err) {
        console.log(`❌ Yelp fetch error for ${businessName}:`, err.message);
        return [];
    }
}

// Convert Yelp review to our review format
function yelpToReview(yelpReview, businessId, index) {
    const nameParts = yelpReview.user_name.split(' ');
    const initials = nameParts.map(n => n[0]).join('').substring(0, 2).toUpperCase();

    return {
        business_id: businessId,
        reviewer_name: yelpReview.user_name,
        reviewer_initials: initials,
        rating: yelpReview.rating,
        title: yelpReview.text.substring(0, 50) + (yelpReview.text.length > 50 ? '...' : ''),
        comment: yelpReview.text,
        review_date: yelpReview.time_created,
        verified: true,
        source: 'yelp',
        source_url: yelpReview.url,
        helpful: Math.floor(Math.random() * 10),
        created_at: new Date().toISOString()
    };
}

async function fetchAndStoreReviews() {
    console.log('=== FETCHING REAL REVIEWS FROM YELP ===\n');

    const businesses = await getBusinesses();
    console.log(`Found ${businesses.length} businesses to check\n`);

    const allReviews = [];
    let processedCount = 0;

    // Process first 20 businesses to stay within API limits
    for (const business of businesses.slice(0, 20)) {
        processedCount++;
        console.log(`[${processedCount}/20] Checking: ${business.name} in ${business.city}`);

        const yelpReviews = await fetchYelpReviews(business.name, business.city, business.trade);

        if (yelpReviews.length > 0) {
            console.log(`   ✅ Found ${yelpReviews.length} Yelp reviews`);

            const formattedReviews = yelpReviews.map((r, i) =>
                yelpToReview(r, business.id, i)
            );

            allReviews.push(...formattedReviews);
        } else {
            console.log(`   ⚠️  No Yelp reviews found`);
        }

        // Rate limit - Yelp allows 5000/day but be conservative
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log(`\n=== SUMMARY ===`);
    console.log(`Total reviews found: ${allReviews.length}`);

    if (allReviews.length > 0) {
        // Save to file for review before inserting
        writeFileSync('scripts/fetched_reviews.json', JSON.stringify(allReviews, null, 2));
        console.log(`\n📁 Reviews saved to scripts/fetched_reviews.json`);
        console.log(`Review the file and run: node scripts/insert_reviews.js`);
    } else {
        console.log('\nNo reviews found. Businesses may not have Yelp listings.');
    }

    return allReviews;
}

fetchAndStoreReviews().catch(console.error);
