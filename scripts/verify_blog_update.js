import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    const slugs = [
        'ac-heatwave-preparation-signs-repair-uk-2026',
        'ac-heatwave-preparation-signs-repair-us-2026'
    ];

    for (const slug of slugs) {
        const { data, error } = await supabase
            .from('posts')
            .select('content')
            .eq('slug', slug)
            .single();

        if (error) {
            console.error(`Error fetching post ${slug}:`, error);
            continue;
        }

        if (data.content.includes('COSTWAY')) {
            console.log(`✅ Post ${slug} correctly contains the product recommendation.`);
        } else {
            console.error(`❌ Post ${slug} DOES NOT contain the product recommendation.`);
        }
    }
}

verify();
