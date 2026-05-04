import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
dotenv.config({ path: '.env.production' });
const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const { data, error } = await sb.from('posts').select('id,slug,title,cover_image,published,published_at,updated_at,excerpt').limit(2000);
if (error) { console.error(error); process.exit(1); }
fs.writeFileSync('all_posts_dump.json', JSON.stringify(data, null, 2));
console.log('Total posts:', data.length);
const pub = data.filter(p => p.published);
console.log('Published:', pub.length);
const slugs = pub.map(p=>p.slug);
const ukSlugs = slugs.filter(s => /(-gb|-uk)(\b|$|-)/.test(s));
const usSlugs = slugs.filter(s => /(-us|-usa)(\b|$|-)/.test(s));
const noRegion = slugs.filter(s => !/(-gb|-uk|-us|-usa)(\b|$|-)/.test(s));
console.log('UK slugs:', ukSlugs.length);
console.log('US slugs:', usSlugs.length);
console.log('No region:', noRegion.length);
console.log('No region slugs:', noRegion);
console.log('--- US TITLES with UK terms ---');
const ukTerms = /\b(tradesm[ae]n|callout|boiler|gas safe|consumer unit|RCD|MCB|stopcock|loft|UK|British|en-?GB)\b/i;
pub.filter(p => /(-us|-usa)(\b|$|-)/.test(p.slug)).forEach(p => {
  if (ukTerms.test(p.title) || ukTerms.test(p.excerpt||'')) {
    console.log('  US slug w/UK term:', p.slug, '|', p.title);
  }
});
console.log('--- UK TITLES with US terms ---');
const usTerms = /\b(contractor|HVAC|GFCI|breaker panel|main shut-off|basement|NEC|EPA|service call)\b/i;
pub.filter(p => /(-gb|-uk)(\b|$|-)/.test(p.slug)).forEach(p => {
  if (usTerms.test(p.title) || usTerms.test(p.excerpt||'')) {
    console.log('  UK slug w/US term:', p.slug, '|', p.title);
  }
});
