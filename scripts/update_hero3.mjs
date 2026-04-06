import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

const { error } = await supabase
    .from('posts')
    .update({ cover_image: '/images/tradespeople/electric-light.png' })
    .eq('slug', '7-ways-to-safe-proof-your-garden-electrics-spring-2026-gb');

if (error) console.error('Error:', error);
else console.log('Updated hero image to: /images/tradespeople/electric-light.png');
