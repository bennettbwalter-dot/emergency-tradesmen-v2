import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updatePost() {
    // Post: Emergency At Home: Your Complete Guide to Crisis Management
    // Slug: emergency-at-home-guide

    const { data: post } = await supabase
        .from('posts')
        .select('id, content')
        .eq('slug', 'emergency-at-home-guide')
        .single();

    if (!post) {
        console.error('Post not found');
        return;
    }

    let content = post.content;

    // Insert images
    // 1. In Plumbing section
    content = content.replace('## 1. Plumbing Emergencies: Water is the Destroyer', '## 1. Plumbing Emergencies: Water is the Destroyer\n\n![Emergency Plumber Inspecting Boiler with Official ET Branding](/images/blog/branded/plumber-boiler-check-logo.png)');

    // 2. In Locksmith section
    content = content.replace('### Boarding Up After a Break-In', '### Boarding Up After a Break-In\n\n![Professional Emergency Boarding Secured with ET Branded Sticker](/images/blog/branded/emergency-boarding-logo.png)');

    const { error } = await supabase
        .from('posts')
        .update({ content })
        .eq('id', post.id);

    if (error) {
        console.error('Error updating post:', error);
    } else {
        console.log('Successfully updated emergency-at-home-guide');
    }
}

updatePost();
