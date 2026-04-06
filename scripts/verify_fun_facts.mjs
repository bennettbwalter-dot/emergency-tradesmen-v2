import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function verifyFunFacts() {
    const { data: posts } = await supabase
        .from('posts')
        .select('slug, content')
        .eq('published', true);

    for (const p of posts) {
        const hasDidYouKnow = p.content.includes('<strong>💡 Did you know?</strong>');
        const hasProTip = p.content.includes('<strong>💡 Pro Tip:</strong>');
        console.log(p.slug + ': Did You Know=' + hasDidYouKnow + ', Pro Tip=' + hasProTip);
    }
}

verifyFunFacts();
