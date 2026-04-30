import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env.uk.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      await walk(filePath, fileList);
    } else if (file.endsWith('.md')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

async function updateBlogs() {
  const blogsDir = path.resolve(__dirname, '..', 'optimized-blogs');
  const files = await walk(blogsDir);
  
  console.log(`Found ${files.length} blog files. Updating content in database...`);

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const slug = path.basename(file, '.md');
    
    // Check if post exists
    const { data: post } = await supabase
      .from('posts')
      .select('id, slug')
      .eq('slug', slug)
      .single();

    if (post) {
      console.log(`Updating ${slug}...`);
      const { error } = await supabase
        .from('posts')
        .update({ content })
        .eq('slug', slug);
      
      if (error) console.error(`Error updating ${slug}:`, error);
    }
  }
  console.log('Finished updating all blogs.');
}

updateBlogs();
