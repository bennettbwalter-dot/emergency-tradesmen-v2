import fs from 'fs';
import path from 'path';

function escapeSql(str) {
  if (!str) return '';
  return str.replace(/'/g, "''");
}

async function run() {
  console.log('🚀 Generating SQL insert script...');
  
  const usFile = path.join(process.cwd(), 'optimized-blogs', 'usa-emergencycontractors', 'ceiling-fan-humming-wobbling-dead-us.md');
  const ukFile = path.join(process.cwd(), 'optimized-blogs', 'uk-emergencytradesmen', 'combi-boiler-losing-pressure-summer-gb.md');

  let usContent = fs.readFileSync(usFile, 'utf8');
  let ukContent = fs.readFileSync(ukFile, 'utf8');

  const now = new Date().toISOString();
  
  const posts = [
    {
      title: "Ceiling Fan Humming, Wobbling, or Dead? Safe Fixes Before Calling a 24/7 Electrician",
      slug: "ceiling-fan-humming-wobbling-dead-us",
      content: usContent,
      excerpt: "Ceiling fan humming, wobbling, or completely dead? Follow this step-by-step troubleshooting guide to test circuit breakers, secure blade irons, check remote receiver wire nuts, replace run capacitors, and lubricate cast-iron motor bearings.",
      cover_image: "/images/blog/us-ceiling-fan-hero.png"
    },
    {
      title: "Combi Boiler Losing Pressure in Summer? Quick Fixes Before Calling a Gas Engineer",
      slug: "combi-boiler-losing-pressure-summer-gb",
      content: ukContent,
      excerpt: "Is your combi boiler losing pressure during the summer heatwave? Follow this UK DIY guide to inspect lockshield and TRV valves for leaks, check the external PRV safety pipe, top up the filling loop, and bleed air from radiators.",
      cover_image: "/images/blog/uk-combi-boiler-hero.png"
    }
  ];

  let sql = `-- Run this in your Supabase SQL Editor to publish today's blogs:\n\n`;

  for (const post of posts) {
    sql += `INSERT INTO public.posts (title, slug, content, excerpt, cover_image, published, published_at)
VALUES (
  '${escapeSql(post.title)}',
  '${escapeSql(post.slug)}',
  '${escapeSql(post.content)}',
  '${escapeSql(post.excerpt)}',
  '${escapeSql(post.cover_image)}',
  true,
  '${now}'
)
ON CONFLICT (slug) DO UPDATE SET 
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  excerpt = EXCLUDED.excerpt,
  cover_image = EXCLUDED.cover_image,
  published = EXCLUDED.published,
  published_at = EXCLUDED.published_at;

`;
  }

  const sqlFile = path.join(process.cwd(), 'insert_todays_blogs.sql');
  fs.writeFileSync(sqlFile, sql);

  console.log('✅ Generated insert_todays_blogs.sql');
  console.log('👉 Please open insert_todays_blogs.sql, copy everything, and run it in your Supabase SQL Editor.');
}

run().catch(console.error);
