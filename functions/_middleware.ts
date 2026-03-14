export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const hostname = url.hostname;
  const path = url.pathname;

  // 1. US Domain Routing (emergencycontractors.net)
  if (hostname.includes('emergencycontractors.net')) {
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
    if (path.startsWith('/us') || path.startsWith('/usa')) {
      // Redirect to the US domain equivalent
      const newPath = path.replace(/^\/(us|usa)/, '') || '/';
      return Response.redirect(`https://emergencycontractors.net${newPath}`, 301);
    }
  }

  return context.next();
};
