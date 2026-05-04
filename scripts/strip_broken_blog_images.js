// Strip broken inline image references from published blog posts.
// Per fix instruction: do NOT substitute placeholders. Just remove the <img>
// tags whose src points to a path not present on disk in /public.
//
// Strategy:
//  1. Pull every published post.
//  2. Walk every <img src="..."> and ![alt](src) markdown ref in content.
//  3. If src is a remote URL → keep.
//  4. If src resolves to an existing file in /public → keep.
//  5. If src has a webp twin that exists (eg .png missing but .webp present) →
//     rewrite the path to the .webp twin.
//  6. Otherwise → strip the <img> tag (and its enclosing <figure>...</figure>
//     wrapper if that wrapper is then empty). For markdown ![]() refs, strip
//     the whole reference (it leaves no orphan structure).
//  7. Update Supabase posts.content for posts that changed.
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.production' });
const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const PUBLIC_DIR = 'public';

function resolveRef(src) {
  if (!src) return { kind: 'missing' };
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) {
    return { kind: 'remote' };
  }
  let normalized = src.startsWith('/') ? src.substring(1) : src;
  normalized = normalized.split('?')[0].split('#')[0];
  const fsPath = path.join(PUBLIC_DIR, normalized);
  if (fs.existsSync(fsPath)) return { kind: 'ok' };

  // Try swapping legacy raster ext to webp
  const webpVariant = normalized.replace(/\.(png|svg|jpg|jpeg)$/i, '.webp');
  if (webpVariant !== normalized && fs.existsSync(path.join(PUBLIC_DIR, webpVariant))) {
    return { kind: 'rewrite', newPath: '/' + webpVariant };
  }
  // Try swapping webp back to png if a png twin happens to exist
  const pngVariant = normalized.replace(/\.webp$/i, '.png');
  if (pngVariant !== normalized && fs.existsSync(path.join(PUBLIC_DIR, pngVariant))) {
    return { kind: 'rewrite', newPath: '/' + pngVariant };
  }
  return { kind: 'missing' };
}

function cleanupContent(content) {
  if (!content) return { content, changed: false, removed: [], rewritten: [] };
  let result = content;
  const removed = [];
  const rewritten = [];

  // 1. HTML <img> tags
  // Match <img ...> (self-closing or not) — non-greedy, no nested <
  result = result.replace(/<img\b[^>]*?\bsrc=["']([^"']+)["'][^>]*?\/?\s*>/gi, (full, src) => {
    const r = resolveRef(src);
    if (r.kind === 'remote' || r.kind === 'ok') return full;
    if (r.kind === 'rewrite') {
      rewritten.push({ from: src, to: r.newPath });
      return full.replace(src, r.newPath);
    }
    removed.push(src);
    return '';
  });

  // 2. Markdown image refs ![alt](src)
  result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (full, alt, src) => {
    const r = resolveRef(src.trim());
    if (r.kind === 'remote' || r.kind === 'ok') return full;
    if (r.kind === 'rewrite') {
      rewritten.push({ from: src, to: r.newPath });
      return `![${alt}](${r.newPath})`;
    }
    removed.push(src);
    return '';
  });

  // 3. Clean up <figure>...</figure> wrappers that are now empty
  //    (only whitespace, optional <figcaption> with no img remaining)
  result = result.replace(/<figure\b[^>]*>\s*(<figcaption\b[^>]*>[\s\S]*?<\/figcaption>\s*)?<\/figure>/gi, '');

  // 4. Clean up <picture>...</picture> wrappers that are now empty (no <img> left)
  result = result.replace(/<picture\b[^>]*>\s*<\/picture>/gi, '');

  // 5. Clean up entirely empty <a> wrappers that previously held only an image
  //    Pattern: <a href="..."></a> with no children or only whitespace
  result = result.replace(/<a\b[^>]*>\s*<\/a>/gi, '');

  return {
    content: result,
    changed: result !== content,
    removed,
    rewritten,
  };
}

async function main() {
  const DRY_RUN = process.argv.includes('--dry-run');
  const { data: posts, error } = await sb
    .from('posts')
    .select('id,slug,title,content,published')
    .eq('published', true)
    .limit(2000);
  if (error) throw error;

  let totalChanged = 0;
  let totalRemoved = 0;
  let totalRewritten = 0;
  const summary = [];

  for (const post of posts) {
    const { content, changed, removed, rewritten } = cleanupContent(post.content);
    if (!changed) continue;
    if (!DRY_RUN) {
      const { error: upErr } = await sb
        .from('posts')
        .update({ content })
        .eq('id', post.id);
      if (upErr) {
        console.error(`❌ Update failed for ${post.slug}:`, upErr.message);
        continue;
      }
    }
    totalChanged++;
    totalRemoved += removed.length;
    totalRewritten += rewritten.length;
    summary.push({ slug: post.slug, removed: removed.length, rewritten: rewritten.length, removedPaths: removed, rewrittenPaths: rewritten });
    console.log(`${DRY_RUN ? '🔍' : '✅'} ${post.slug}: removed=${removed.length} rewritten=${rewritten.length}`);
  }

  console.log('\n===== SUMMARY =====');
  console.log(`Mode: ${DRY_RUN ? 'DRY-RUN (no DB writes)' : 'LIVE (DB updated)'}`);
  console.log(`Posts modified: ${totalChanged}`);
  console.log(`Image refs removed: ${totalRemoved}`);
  console.log(`Image refs rewritten: ${totalRewritten}`);
  fs.writeFileSync('image_cleanup_report.json', JSON.stringify(summary, null, 2));
  console.log('Report → image_cleanup_report.json');
}

await main();
