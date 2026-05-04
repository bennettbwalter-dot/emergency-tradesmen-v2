// Edge-level region detection. Mirrors the slug regex used in BlogPage / BlogPostPage,
// plus the legacy `us-`/`uk-` prefix slugs (e.g. `us-sewage-backup-immediate-safety`).
// Crawlers must see a 301 to the correct domain before HTML is delivered — the JS
// redirect inside BlogPostPage runs after first paint, so it's too late for SEO.
function classifyBlogSlug(slug: string): 'uk' | 'us' | null {
  const s = slug.toLowerCase();
  const isUK = s.endsWith('-gb') || s.endsWith('-uk') ||
               s.includes('-gb-') || s.includes('-uk-') ||
               s.startsWith('uk-') || s.startsWith('gb-');
  const isUS = s.endsWith('-us') || s.endsWith('-usa') ||
               s.includes('-us-') || s.includes('-usa-') ||
               s.startsWith('us-') || s.startsWith('usa-');
  if (isUK && !isUS) return 'uk';
  if (isUS && !isUK) return 'us';
  return null;
}

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const hostname = url.hostname;
  const path = url.pathname;

  // 1. US Domain Routing (emergencycontractors.net)
  if (hostname.includes('emergencycontractors.net')) {
    // Region-mismatch 301: a UK-region blog slug accessed on the US domain
    // is redirected to the UK domain so crawlers never index UK content here.
    if (path.startsWith('/blog/')) {
      const slug = path.replace(/^\/blog\//, '').replace(/\/$/, '');
      if (slug && classifyBlogSlug(slug) === 'uk') {
        return Response.redirect(`https://emergencytradesmen.net${path}${url.search}`, 301);
      }
    }

    // Prevent infinite loop if somehow /us or /usa is accessed on this domain
    if (path.startsWith('/us') || path.startsWith('/usa')) {
      const newPath = path.replace(/^\/(us|usa)/, '') || '/';
      return Response.redirect(`https://emergencycontractors.net${newPath}`, 301);
    }

    // Silent rewrite: map internal /us/* to root /
    // BUT EXCLUDE ALL STATIC ASSETS to prevent MIME type crashes
    const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.woff', '.woff2', '.ttf', '.otf', '.json', '.xml', '.txt'];
    const isStaticAsset = staticExtensions.some(ext => path.toLowerCase().endsWith(ext)) || 
                          path.includes('/assets/') || 
                          path.includes('/images/') ||
                          path.includes('/blog/') ||
                          path.includes('/cdn-cgi/');
    
    if (isStaticAsset) {
      return context.next();
    }

    const newUrl = new URL(url.toString());
    newUrl.pathname = `/us${path === '/' ? '' : path}`;
    
    // Create a new request with the rewritten URL
    const rewrittenRequest = new Request(newUrl.toString(), context.request);
    
    // Process the request
    const response = await context.next(rewrittenRequest);
    
    // If we're on the US domain and a static asset was requested but it returned HTML (fallback),
    // it means the asset actually doesn't exist. Return a 404 instead of a MIME-crashing HTML response.
    const contentType = response.headers.get('Content-Type') || '';
    if (isStaticAsset && contentType.includes('text/html')) {
      return new Response('Asset not found', { status: 404 });
    }

    // Add security headers to the response to ensure Google Ads move through
    const newHeaders = new Headers(response.headers);
    // Note: We are already setting CSP in index.html, but if it's being blocked we can supplement here
    
    return new Response(response.body, {
      ...response,
      headers: newHeaders
    });
  }

  // 2. UK Domain Protection (emergencytradesmen.net)
  if (hostname.includes('emergencytradesmen.net')) {
    // Region-mismatch 301: a US-region blog slug accessed on the UK domain
    // is redirected to the US domain.
    if (path.startsWith('/blog/')) {
      const slug = path.replace(/^\/blog\//, '').replace(/\/$/, '');
      if (slug && classifyBlogSlug(slug) === 'us') {
        return Response.redirect(`https://emergencycontractors.net${path}${url.search}`, 301);
      }
    }

    if (path.startsWith('/us') || path.startsWith('/usa')) {
      // Redirect to the US domain equivalent
      const newPath = path.replace(/^\/(us|usa)/, '') || '/';
      return Response.redirect(`https://emergencycontractors.net${newPath}`, 301);
    }
  }

  return context.next();
};
