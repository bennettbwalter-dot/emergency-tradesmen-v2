import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
dotenv.config({ path: '.env.production' });

const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const { data: posts, error } = await sb.from('posts').select('id,slug,title,content,cover_image').eq('published', true).limit(2000);
if (error) { console.error(error); process.exit(1); }

const publicDir = 'public';

function imagePathExists(p) {
  if (!p) return { exists: false, reason: 'empty' };
  if (p.startsWith('http')) return { exists: true, reason: 'remote' };
  let normalized = p.startsWith('/') ? p.substring(1) : p;
  // Strip query/fragment
  normalized = normalized.split('?')[0].split('#')[0];
  const fsPath = path.join(publicDir, normalized);
  if (fs.existsSync(fsPath)) return { exists: true, reason: 'ok' };
  // Try webp variant
  const webpVariant = normalized.replace(/\.(png|svg|jpg|jpeg)$/i, '.webp');
  if (webpVariant !== normalized) {
    const fsPath2 = path.join(publicDir, webpVariant);
    if (fs.existsSync(fsPath2)) return { exists: false, reason: 'wrong_ext_webp_exists', alt: '/' + webpVariant };
  }
  // Try png variant if .webp fails
  const pngVariant = normalized.replace(/\.webp$/i, '.png');
  if (pngVariant !== normalized) {
    const fsPath3 = path.join(publicDir, pngVariant);
    if (fs.existsSync(fsPath3)) return { exists: false, reason: 'webp_missing_png_exists', alt: '/' + pngVariant };
  }
  return { exists: false, reason: 'missing' };
}

const allBrokenImages = [];
const postsWithInlineIssues = [];

for (const post of posts) {
  const content = post.content || '';
  const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/gi;
  const mdImgRegex = /!\[[^\]]*\]\(([^)]+)\)/g;
  const images = [];
  let m;
  while ((m = imgRegex.exec(content)) !== null) images.push(m[1]);
  while ((m = mdImgRegex.exec(content)) !== null) images.push(m[1]);

  const broken = [];
  for (const src of images) {
    const r = imagePathExists(src);
    if (!r.exists) {
      broken.push({ src, reason: r.reason, alt: r.alt });
      allBrokenImages.push({ slug: post.slug, src, reason: r.reason, alt: r.alt });
    }
  }
  if (broken.length > 0) {
    postsWithInlineIssues.push({ slug: post.slug, title: post.title, broken });
  }
}

console.log(`Total published posts: ${posts.length}`);
console.log(`Posts with broken inline images: ${postsWithInlineIssues.length}`);
console.log(`Total broken inline image refs: ${allBrokenImages.length}`);

console.log('\n--- POSTS WITH BROKEN INLINE IMAGES ---');
postsWithInlineIssues.forEach(p => {
  console.log(`\n[${p.slug}] ${p.title}`);
  p.broken.forEach(b => {
    console.log(`  [${b.reason}] ${b.src}${b.alt ? ' (alt: '+b.alt+')' : ''}`);
  });
});

fs.writeFileSync('inline_image_audit_now.json', JSON.stringify({ allBrokenImages, postsWithInlineIssues }, null, 2));
