import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function refinePost() {
    const slug = 'spring-condensation-mould-prevention-air-quality-2026';
    console.log(`Refining post: ${slug}`);

    const { data: post, error: fetchError } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .single();

    if (fetchError || !post) {
        console.error('Error fetching post:', fetchError);
        return;
    }

    // 1. Refine the Intro for AI Overview (AI Overview Trigger)
    const newIntro = `**Spring Condensation** is a quiet domestic emergency caused by the transition from winter to spring. Rapid temperature swings in March create high humidity and mould spores, risking property damage and respiratory health. To protect your home, ensure cross-flow ventilation, maintain steady heat, and address damp patches immediately before they spread.`;

    // 2. Add Local Coverage Links (Phase 3 SEO)
    const localCoverage = `\n\n---\n\n### 🌍 Local Emergency Coverage\nIf you are experiencing a damp-related emergency or suspect a leak is causing mould in your home, our verified specialists are available across the UK:\n- [Emergency Plumber in London](https://emergencytradesmen.net/emergency-plumber/london)\n- [Emergency Plumber in Birmingham](https://emergencytradesmen.net/emergency-plumber/birmingham)\n- [Emergency Plumber in Manchester](https://emergencytradesmen.net/emergency-plumber/manchester)\n- [Emergency Plumber in Leeds](https://emergencytradesmen.net/emergency-plumber/leeds)`;

    // Construct updated content
    // We replace the first paragraph (or the start) with the new intro
    let updatedContent = post.content;
    
    // Remove the title line if it exists (which we restored recently without #)
    const lines = updatedContent.split('\n');
    if (lines[0].includes('Protecting Your Home’s Air Quality')) {
        lines.shift(); // Remove original title text from content
    }
    
    // Remove any empty lines at start
    while (lines.length > 0 && lines[0].trim() === '') {
        lines.shift();
    }
    
    // Build the content
    updatedContent = newIntro + '\n\n' + lines.join('\n') + localCoverage;

    const { error: updateError } = await supabase
        .from('posts')
        .update({ content: updatedContent })
        .eq('id', post.id);

    if (updateError) {
        console.error('Error updating post:', updateError);
    } else {
        console.log(`Successfully refined post: ${slug} for SEO and AI Overview.`);
    }
}

refinePost();
