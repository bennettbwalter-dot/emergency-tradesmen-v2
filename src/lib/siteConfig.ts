/**
 * Site configuration utility — provides domain-aware branding,
 * support emails, social handles, and URLs for UK/US deployments.
 */

export const SITE_URLS = {
    production: {
        GB: 'https://emergencytradesmen.net',
        US: 'https://emergencycontractors.net',
    },
    local: {
        GB: 'http://localhost:3000',
        US: 'http://localhost:3001',
    },
} as const;

export function isUSDomain(): boolean {
    if (typeof window === 'undefined') return false;
    const hostname = window.location.hostname;
    const port = window.location.port;
    return (
        import.meta.env.MODE === 'us' ||
        hostname.includes('emergencycontractors.net') ||
        (hostname === 'localhost' && port === '3001') ||
        (hostname === '127.0.0.1' && port === '3001')
    );
}

export function getSiteCountryCode(): 'GB' | 'US' {
    return isUSDomain() ? 'US' : 'GB';
}

function isLocalHost(): boolean {
    if (typeof window === 'undefined') return false;
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
}

export function getSupportEmail(): string {
    return isUSDomain()
        ? 'emergencycontractor@outlook.com'
        : 'emergencytradesmen@outlook.com';
}

export function getSiteName(): string {
    return isUSDomain() ? 'Emergency Contractors' : 'Emergency Tradesmen';
}

export function getSiteDomain(): string {
    const countryCode = getSiteCountryCode();
    return isLocalHost() ? SITE_URLS.local[countryCode] : SITE_URLS.production[countryCode];
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
