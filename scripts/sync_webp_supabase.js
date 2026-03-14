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
    let content = post.content;
    let featured_image = post.featured_image;
    let modified = false;

    imageExtensions.forEach(ext => {
      // Improved regex with word boundary and check for markdown/quote context
      const regex = new RegExp('\\.' + ext + '(?=[\\"\'\'\\s\\)])', 'gi');
      if (regex.test(content)) {
        content = content.replace(regex, '.webp');
        modified = true;
      }
      if (featured_image && featured_image.toLowerCase().endsWith('.' + ext)) {
        featured_image = featured_image.substring(0, featured_image.lastIndexOf('.')) + '.webp';
        modified = true;
      }
    });

    if (modified) {
      const { error: updateError } = await supabase
        .from('posts')
        .update({ content, featured_image })
        .eq('id', post.id);
      
      if (updateError) {
        console.error(`Error updating post ${post.id}:`, updateError);
      } else {
        console.log(`Synced WebP in Supabase post: ${post.title}`);
      }
    }
  }
}

syncWebpToSupabase();
