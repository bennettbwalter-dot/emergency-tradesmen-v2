import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const hubs = [
  {
    title: 'Emergency Plumbing Problems Homeowners Face: The 2026 Ultimate Survival Guide',
    slug: 'emergency-plumbing-problems-homeowners-face',
    file: 'scripts/hubs/plumbing-pillar.md',
    image: '/blog/hubs/plumbing-pillar.png',
    excerpt: "Don't let a minor drip turn into a major disaster. Learn how to identify, triage, and resolve the most common plumbing emergencies in 2026."
  },
  {
    title: 'Emergency Electrical Problems in Homes: The 2026 Safety and Troubleshooting Guide',
    slug: 'emergency-electrical-problems-in-homes',
    file: 'scripts/hubs/electrical-pillar.md',
    image: '/blog/hubs/electrical-pillar.png',
    excerpt: 'Electrical faults are the leading cause of house fires. Learn how to identify hazards, safely reset your breakers, and when to call a verified electrician in 2026.'
  },
  {
    title: 'Emergency Lock and Security Problems Homeowners Face: The 2026 Protection Guide',
    slug: 'emergency-lock-security-problems-pillar',
    file: 'scripts/hubs/locksmith-pillar.md',
    image: '/blog/hubs/locksmith-pillar.png',
    excerpt: 'A standard lock can be breached in 9 seconds. Learn how to identify security vulnerabilities, prevent snap attacks, and secure your home in 2026.'
  }
];

async function insertHubs() {
  for (const hub of hubs) {
    console.log(`Processing hub: ${hub.title}...`);
    
    let content;
    try {
      content = fs.readFileSync(hub.file, 'utf8');
    } catch (err) {
      console.error(`Error reading file ${hub.file}:`, err);
      continue;
    }

    // Check if post exists
    const { data: existingPost } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', hub.slug)
      .single();

    if (existingPost) {
      console.log(`Post with slug ${hub.slug} already exists, updating...`);
      const { error } = await supabase
        .from('posts')
        .update({
          title: hub.title,
          content: content,
          excerpt: hub.excerpt,
          published: true,
          published_at: new Date().toISOString(),
          cover_image: hub.image,
          updated_at: new Date().toISOString()
        })
        .eq('slug', hub.slug);

      if (error) console.error(`Error updating ${hub.slug}:`, error);
      else console.log(`Successfully updated ${hub.slug}`);
    } else {
      console.log(`Inserting new post for ${hub.slug}...`);
      const { error } = await supabase
        .from('posts')
        .insert({
          title: hub.title,
          slug: hub.slug,
          content: content,
          excerpt: hub.excerpt,
          published: true,
          published_at: new Date().toISOString(),
          cover_image: hub.image,
          author_id: null // Set to a default author ID if required
        });

      if (error) console.error(`Error inserting ${hub.slug}:`, error);
      else console.log(`Successfully inserted ${hub.slug}`);
    }
  }
}

insertHubs();
