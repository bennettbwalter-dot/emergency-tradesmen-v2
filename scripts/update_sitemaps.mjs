/**
 * Chunk 1.1: Update sitemaps with all current blog posts and correct lastmod dates
 */

import posts from './all_posts.json' with { type: 'json' };
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public');

function formatDate(dateStr) {
    if (!dateStr) return '2026-03-25';
    const d = new Date(dateStr);
    return d.toISOString().split('T')[0];
}

function buildSitemapEntry(loc, lastmod, changefreq = 'weekly', priority = '0.8', imageLoc = null, imageTitle = null) {
    let xml = `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>`;
    
    if (imageLoc) {
        xml += `
    <image:image>
      <image:loc>${imageLoc}</image:loc>`;
        if (imageTitle) {
            xml += `
      <image:title>${imageTitle}</image:title>`;
        }
        xml += `
    </image:image>`;
    }
    
    xml += `
  </url>`;
    return xml;
}

// Split posts into UK and US
const ukPosts = posts.filter(p => p.published && (p.slug.includes('-gb') || p.slug.includes('-uk') || 
    (!p.slug.includes('-us') && !p.slug.includes('usa'))));
const usPosts = posts.filter(p => p.published && (p.slug.includes('-us') || p.slug.includes('usa')));

console.log(`UK posts: ${ukPosts.length}`);
console.log(`US posts: ${usPosts.length}`);

// Build UK blog sitemap
const ukUrls = ukPosts.map(p => {
    const coverImage = p.cover_image;
    let imageLoc = null;
    if (coverImage) {
        imageLoc = coverImage.startsWith('http') ? coverImage : `https://emergencytradesmen.net${coverImage}`;
    }
    return buildSitemapEntry(
        `https://emergencytradesmen.net/blog/${p.slug}`,
        formatDate(p.updated_at || p.published_at),
        'weekly',
        '0.8',
        imageLoc,
        p.title
    );
}).join('\n');

const ukSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${ukUrls}
</urlset>`;

fs.writeFileSync(path.join(publicDir, 'sitemap-blog-uk.xml'), ukSitemap);
console.log('✓ UK blog sitemap updated');

// Build US blog sitemap
const usUrls = usPosts.map(p => {
    const coverImage = p.cover_image;
    let imageLoc = null;
    if (coverImage) {
        imageLoc = coverImage.startsWith('http') ? coverImage : `https://emergencycontractors.net${coverImage}`;
    }
    return buildSitemapEntry(
        `https://emergencycontractors.net/blog/${p.slug}`,
        formatDate(p.updated_at || p.published_at),
        'weekly',
        '0.8',
        imageLoc,
        p.title
    );
}).join('\n');

const usSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${usUrls}
</urlset>`;

fs.writeFileSync(path.join(__dirname, '../public/sitemap-blog-us.xml'), usSitemap);
console.log('✓ US blog sitemap updated');

// Update main UK sitemap index
const today = formatDate(new Date().toISOString());
const ukIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://emergencytradesmen.net/sitemap-static-uk.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://emergencytradesmen.net/sitemap-uk.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://emergencytradesmen.net/sitemap-businesses-uk-1.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://emergencytradesmen.net/sitemap-blog-uk.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;

fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), ukIndex);
console.log('✓ UK sitemap index updated');

// Update main US sitemap index
const usIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://emergencycontractors.net/sitemap-static-us.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://emergencycontractors.net/sitemap-us-1.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://emergencycontractors.net/sitemap-us-2.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://emergencycontractors.net/sitemap-us-3.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://emergencycontractors.net/sitemap-us-4.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://emergencycontractors.net/sitemap-us-5.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://emergencycontractors.net/sitemap-businesses-us-1.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://emergencycontractors.net/sitemap-businesses-us-2.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://emergencycontractors.net/sitemap-businesses-us-3.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://emergencycontractors.net/sitemap-businesses-us-4.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://emergencycontractors.net/sitemap-businesses-us-5.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://emergencycontractors.net/sitemap-blog-us.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;

fs.writeFileSync(path.join(__dirname, '../public/sitemap-us.xml'), usIndex);
console.log('✓ US sitemap index updated');

console.log('\n=== Summary ===');
console.log(`UK blog entries: ${ukPosts.length}`);
console.log(`US blog entries: ${usPosts.length}`);
console.log(`Total: ${ukPosts.length + usPosts.length}`);
