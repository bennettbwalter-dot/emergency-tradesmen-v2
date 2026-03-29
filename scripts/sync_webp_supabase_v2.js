import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function syncWebpToSupabase() {
  const { data: posts, error } = await supabase.from('posts').select('*');
  if (error) {
    console.error('Error fetching posts:', error);
    return;
  }

  const imageExtensions = ['png', 'jpg', 'jpeg', 'jfif'];

  for (const post of posts) {
    let content = post.content || '';
    let cover_image = post.cover_image || '';
    let modified = false;

    // Fix AC Heatwave Hero specifically if empty
    if (post.title.includes('AC Ready for the Early 2026 Heatwave') && (!cover_image || cover_image.includes('placeholder'))) {
        const regionSuffix = post.slug.endsWith('-us') ? 'us-2026' : 'uk-2026';
        cover_image = `/blog/ac-heatwave-preparation-signs-repair-${regionSuffix}/thermostat-85f.webp`;
        modified = true;
    }

    imageExtensions.forEach(ext => {
      const regex = new RegExp('\\.' + ext + '(?=[\\"\'\'\\s\\)])', 'gi');
      if (regex.test(content)) {
        content = content.replace(regex, '.webp');
        modified = true;
      }
      if (cover_image && (cover_image.toLowerCase().endsWith('.' + ext) || cover_image.toLowerCase().includes('.' + ext + '?'))) {
         // Handle potential query params or just standard extension
         const base = cover_image.split('?')[0];
         if (imageExtensions.some(e => base.toLowerCase().endsWith('.' + e))) {
             cover_image = base.substring(0, base.lastIndexOf('.')) + '.webp';
             modified = true;
         }
      }
    });

    if (modified) {
      const { error: updateError } = await supabase
        .from('posts')
        .update({ content, cover_image })
        .eq('id', post.id);
      
      if (updateError) {
        console.error(`Error updating post ${post.id}:`, updateError);
      } else {
        console.log(`Synced WebP in Supabase: ${post.title}`);
      }
    }
  }
}

syncWebpToSupabase();
