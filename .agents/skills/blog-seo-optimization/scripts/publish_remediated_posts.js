#!/usr/bin/env node
/**
 * Publish remediated posts from an exported JSON corpus back to Supabase `posts`.
 *
 * Usage:
 *   node .agents/skills/blog-seo-optimization/scripts/publish_remediated_posts.js \
 *     --input all_posts_audit.json \
 *     --only-remediated \
 *     --limit 50 \
 *     --dry-run
 *
 * Requires:
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY (preferred) or VITE_SUPABASE_ANON_KEY
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';

function parseArgs(argv) {
  const args = {
    input: 'all_posts_audit.json',
    limit: null,
    onlyRemediated: false,
    dryRun: false,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--input') args.input = argv[++i];
    else if (token === '--limit') args.limit = Number(argv[++i]);
    else if (token === '--only-remediated') args.onlyRemediated = true;
    else if (token === '--dry-run') args.dryRun = true;
    else throw new Error(`Unknown arg: ${token}`);
  }
  return args;
}

function loadPosts(inputPath) {
  const absolute = path.resolve(process.cwd(), inputPath);
  const raw = fs.readFileSync(absolute, 'utf8');
  const posts = JSON.parse(raw);
  if (!Array.isArray(posts)) throw new Error('Input JSON must be an array of posts.');
  return posts;
}

function filterPosts(posts, { onlyRemediated, limit }) {
  let out = posts.filter((p) => p && p.slug && p.content);
  if (onlyRemediated) {
    out = out.filter((p) => String(p.updated_at || '').startsWith('2026-03-20T00:00:00'));
  }
  if (Number.isFinite(limit) && limit > 0) out = out.slice(0, limit);
  return out;
}

function buildPayload(post) {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    cover_image: post.cover_image ?? null,
    published: post.published ?? true,
    published_at: post.published_at ?? null,
    updated_at: new Date().toISOString(),
  };
}

async function main() {
  const args = parseArgs(process.argv);
  const posts = loadPosts(args.input);
  const target = filterPosts(posts, args);

  console.log(`Loaded posts: ${posts.length}`);
  console.log(`Target posts: ${target.length}`);
  console.log(`Mode: ${args.dryRun ? 'DRY RUN' : 'LIVE'}`);

  if (target.length === 0) {
    console.log('No posts matched filters. Nothing to do.');
    return;
  }

  if (args.dryRun) {
    console.log('Sample slugs:', target.slice(0, 10).map((p) => p.slug));
    return;
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY/VITE_SUPABASE_ANON_KEY env vars.');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const payload = target.map(buildPayload);
  const { data, error } = await supabase
    .from('posts')
    .upsert(payload, { onConflict: 'slug' })
    .select('slug');

  if (error) throw error;
  console.log(`Upserted posts: ${data?.length ?? 0}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
