
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function publishBlogPost() {
    try {
        // Read the HTML file provided by the user
        const htmlFilePath = 'C:\\Users\\Nick\\OneDrive\\protection\\OneDrive\\my App\\Blog Post Writer Remix-saved.html';
        console.log(`Reading HTML file from: ${htmlFilePath}`);

        let htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');

        // Extract content inside <body> tags
        const bodyContentMatch = htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);

        if (bodyContentMatch && bodyContentMatch[1]) {
            htmlContent = bodyContentMatch[1].trim();
            console.log('Successfully extracted body content.');
        } else {
            console.warn('Could not extract body content, using full file content.');
        }

        const post = {
            title: '5 Signs You Need an Emergency Plumber Immediately',
            slug: '5-signs-you-need-emergency-plumber-immediately',
            excerpt: 'Water damage waits for no one. Learn the 5 critical signs that mean you need to pick up the phone and call an emergency plumber right now.',
            content: htmlContent, // Storing HTML content
            cover_image: 'https://images.unsplash.com/photo-1581242163695-19d0acacd486?q=80&w=800&auto=format&fit=crop', // Keeping previous cover image or use one from HTML if extractable? HTML uses inline data URI for hero.
            published: true,
            published_at: new Date().toISOString()
        };

        // Check if content has the data URI hero image and maybe extract it or just leave it inline (it's large but works)
        // The HTML file has <img src='data:image/png;base64,...' /> in hero section.
        // We will leave it as is for exact fidelity.

        console.log(`Publishing post: ${post.title}`);

        const { data, error } = await supabase
            .from('posts')
            .upsert(post, { onConflict: 'slug' })
            .select();

        if (error) {
            console.error('Error publishing post:', error);
        } else {
            console.log('Successfully published post:', data);
        }

    } catch (err) {
        console.error('Failed to read file or publish post:', err);
    }
}

publishBlogPost();
