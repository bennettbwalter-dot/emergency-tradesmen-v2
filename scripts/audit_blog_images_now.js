import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
dotenv.config({ path: '.env.production' });

const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const { data: posts, error } = await sb.from('posts').select('id,slug,title,cover_image,published').eq('published', true).limit(2000);
if (error) { console.error(error); process.exit(1); }

const publicDir = 'public';

function checkPath(p) {
  if (!p) return { ok: false, reason: 'null/undefined', resolved: null };
  if (p.startsWith('http')) return { ok: true, reason: 'remote', resolved: p };
  // Resolve to filesystem path
  let normalized = p.startsWith('/') ? p.substring(1) : p;
  const fsPath = path.join(publicDir, normalized);
  if (fs.existsSync(fsPath)) {
    return { ok: true, reason: 'exists', resolved: fsPath };
  }
  // Try webp swap
  const swapped = normalized.replace(/\.(png|svg|jpg|jpeg)$/i, '.webp');
  const swapFsPath = path.join(publicDir, swapped);
  if (fs.existsSync(swapFsPath)) {
    return { ok: false, reason: 'wrong_ext_but_webp_exists', resolved: '/' + swapped };
  }
  // Try original lowercase
  const dir = path.dirname(fsPath);
  const base = path.basename(fsPath);
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    const ci = files.find(f => f.toLowerCase() === base.toLowerCase());
    if (ci) return { ok: false, reason: 'case_mismatch', resolved: path.join(dir, ci) };
  }
  return { ok: false, reason: 'missing', resolved: null };
}

const results = posts.map(p => {
  const check = checkPath(p.cover_image);
  return { ...p, check };
});

const broken = results.filter(r => !r.check.ok);
const good = results.filter(r => r.check.ok);

console.log(`Total published posts: ${results.length}`);
console.log(`Cover images OK: ${good.length}`);
console.log(`Cover images broken: ${broken.length}`);

console.log('\n--- BROKEN COVER IMAGES ---');
broken.forEach(b => {
  console.log(`  [${b.check.reason}] ${b.slug}`);
  console.log(`    cover: ${b.cover_image}`);
  if (b.check.resolved) console.log(`    -> would-be: ${b.check.resolved}`);
});

fs.writeFileSync('blog_image_audit_now.json', JSON.stringify(results, null, 2));
