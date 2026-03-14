export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const hostname = url.hostname;
  const path = url.pathname;

  // 1. US Domain Routing (emergencycontractors.net)
  if (hostname === 'emergencycontractors.net' || hostname === 'www.emergencycontractors.net') {
    // Prevent infinite loop if somehow /us or /usa is accessed on this domain
    if (path.startsWith('/us') || path.startsWith('/usa')) {
      const newPath = path.replace(/^\/(us|usa)/, '') || '/';
      return Response.redirect(`${url.origin}${newPath}`, 301);
    }

    // Silent rewrite: map internal /us/* to root /
    // Cloudflare Pages Functions can use context.next() with a modified request
    const newUrl = new URL(url.toString());
    newUrl.pathname = `/us${path === '/' ? '' : path}`;
    
    // Create a new request with the rewritten URL
    const rewrittenRequest = new Request(newUrl.toString(), context.request);
    return context.next(rewrittenRequest);
  }

  // 2. UK Domain Protection (emergencytradesmen.net)
  if (hostname === 'emergencytradesmen.net' || hostname === 'www.emergencytradesmen.net') {
    if (path.startsWith('/us') || path.startsWith('/usa')) {
      // Redirect to the US domain equivalent
      const newPath = path.replace(/^\/(us|usa)/, '') || '/';
      return Response.redirect(`https://emergencycontractors.net${newPath}`, 301);
    }
  }

  return context.next();
};
