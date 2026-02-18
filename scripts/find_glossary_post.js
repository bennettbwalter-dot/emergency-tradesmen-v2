
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findGlossary() {
    const { data, error } = await supabase
        .from('posts')
        .select('slug, content')
        .ilike('content', '%Glossary%')
        .limit(1);

    if (error) {
        console.error('Error fetching posts:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('Found post with Glossary:', data[0].slug);
        console.log('--- Content Snippet ---');
        // Find the glossary section
        const content = data[0].content;
        const glossaryIndex = content.toLowerCase().indexOf('glossary');
        console.log(content.substring(glossaryIndex, glossaryIndex + 500));
    } else {
        console.log('No posts found with Glossary.');
    }
}

findGlossary();
