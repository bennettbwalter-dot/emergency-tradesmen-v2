import fs from 'fs';

const allPosts = JSON.parse(fs.readFileSync('scripts/all_posts.json', 'utf8'));

const mapping = {};
allPosts.forEach(post => {
  mapping[post.slug] = post.published_at;
});

// Smarter mapping for variants
const slugs = Object.keys(mapping);
slugs.forEach(slug => {
  const date = mapping[slug];
  
  // If the slug doesn't have a region suffix, populate the common variants
  if (!slug.endsWith('-gb') && !slug.endsWith('-us') && !slug.endsWith('-usa')) {
    const gbVariant = slug + '-gb';
    const usVariant = slug + '-us';
    if (!mapping[gbVariant]) mapping[gbVariant] = date;
    if (!mapping[usVariant]) mapping[usVariant] = date;
  }
  
  // If it does have a suffix, map the base slug too if not present
  const match = slug.match(/^(.*)-(gb|us|usa)$/);
  if (match) {
    const base = match[1];
    if (!mapping[base]) mapping[base] = date;
    
    // Also map cross-region if missing
    const otherRegion = match[2] === 'gb' ? 'us' : 'gb';
    const otherVariant = base + '-' + otherRegion;
    if (!mapping[otherVariant]) mapping[otherVariant] = date;
  }
});

fs.writeFileSync('tmp/intended_dates.json', JSON.stringify(mapping, null, 2));

console.log(`Extracted and expanded to ${Object.keys(mapping).length} dates.`);
