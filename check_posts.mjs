import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

function filterPosts(data, countryCode) {
  return data.filter(post => {
    if (!post) return false;
    try {
        const slug = (post.slug || "").toString().toLowerCase();
        const isUS = slug.endsWith('-us') || slug.endsWith('-usa') || slug.includes('-us-') || slug.includes('-usa-');
        const isUK = slug.endsWith('-gb') || slug.endsWith('-uk') || slug.includes('-gb-') || slug.includes('-uk-');

        if (countryCode === 'US') {
            return isUS || !isUK;
        } else {
            return isUK || !isUS;
        }
    } catch (err) {
        return false;
    }
  });
}

async function check() {
  const { data, error } = await supabase.from('posts').select('id, title, slug, published, published_at');
  if (error) {
    console.error('Error fetching posts:', error);
    return;
  }
  console.log('Total posts in DB:', data.length);
  const gbPosts = filterPosts(data, 'GB');
  const usPosts = filterPosts(data, 'US');
  console.log('GB posts count:', gbPosts.length);
  console.log('GB posts:');
  gbPosts.forEach(p => console.log(` - ${p.slug} (${p.title})`));
  console.log('US posts count:', usPosts.length);
  console.log('US posts:');
  usPosts.forEach(p => console.log(` - ${p.slug} (${p.title})`));
}
check();

