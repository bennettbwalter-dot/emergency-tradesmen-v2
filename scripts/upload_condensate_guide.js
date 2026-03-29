
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function uploadPost() {
    const content = fs.readFileSync('scripts/new_condensate_guide_gb.md', 'utf8');

    const post = {
        title: "Frozen Condensate Pipe Fix: How to Thaw Your Boiler in 5 Minutes",
        slug: "frozen-condensate-pipe-fix-gb",
        excerpt: "Is your boiler showing an EA or F1 error code during a cold snap? Learn how to safely thaw your frozen condensate pipe and restore heating in minutes.",
        content: content,
        cover_image: "/blog/boiler/frozen-pipe.jpg",
        published: true,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    console.log("Uploading new post...");
    const { data, error } = await supabase
        .from('posts')
        .insert([post])
        .select();

    if (error) {
        console.error("Upload Error:", error);
    } else {
        console.log("Upload Success! New post ID:", data[0].id);
    }
}

uploadPost();
