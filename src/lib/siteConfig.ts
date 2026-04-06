/**
 * Site configuration utility — provides domain-aware branding,
 * support emails, social handles, and URLs for UK/US deployments.
 */

export function isUSDomain(): boolean {
    if (typeof window === 'undefined') return false;
    const hostname = window.location.hostname;
    const port = window.location.port;
    return (
        hostname.includes('emergencycontractors.net') ||
        (hostname === 'localhost' && ['3001', '5173'].includes(port)) ||
        (hostname === '127.0.0.1' && ['3001', '5173'].includes(port))
    );
}

export function getSupportEmail(): string {
    return isUSDomain()
        ? 'emergencycontractors@outlook.com'
        : 'emergencytradesmen@outlook.com';
}

export function getSiteName(): string {
    return isUSDomain() ? 'Emergency Contractors' : 'Emergency Tradesmen';
}

export function getSiteDomain(): string {
    return isUSDomain()
        ? 'https://emergencycontractors.net'
        : 'https://emergencytradesmen.net';
}

export function getSocialHandle(): string {
    return isUSDomain() ? '@emergencycontractors' : '@emergencytradesmen';
}

export function getSocialUrls(): Record<string, string> {
    const handle = getSocialHandle();
    return {
        facebook: `https://facebook.com/${handle}`,
        twitter: `https://twitter.com/${handle}`,
        instagram: `https://instagram.com/${handle}`,
        linkedin: `https://linkedin.com/company/${handle}`,
    };
}

export function getPostcodeLabel(): string {
    return isUSDomain() ? 'Zip Code' : 'Postcode';
}

export function getPostcodePlaceholder(): string {
    return isUSDomain() ? '10001' : 'SW1A 1AA';
}

export function getCurrencySymbol(): string {
    return isUSDomain() ? '$' : '£';
}
