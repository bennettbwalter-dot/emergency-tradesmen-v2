import { Helmet } from "react-helmet-async";

interface SEOProps {
    title: string;
    description?: string;
    canonical?: string;
    keywords?: string[];
    ogImage?: string;
    ogType?: 'website' | 'article' | 'profile' | 'business.business';
    jsonLd?: Record<string, any> | object[];
    noIndex?: boolean;
    geo?: {
        region: string;
        placename: string;
        position: string;
    };
    locale?: string;
    alternates?: {
        lang: string;
        href: string;
    }[];
}

const DEFAULT_DESCRIPTION = "Need a tradesman near you? We connect you with verified 24/7 emergency plumbers, electricians, locksmiths & gas engineers. Local experts arriving in 30-90 mins.";
const DEFAULT_IMAGE = "https://emergencytradesmen.net/tradesman-hero-v2.webp";
const SITE_URL_GB = "https://emergencytradesmen.net";
const SITE_URL_US = "https://emergencycontractors.net";
const SITE_NAME_GB = "Emergency Tradesmen";
const SITE_NAME_US = "Emergency Contractors";

export function SEO({
    title,
    description = DEFAULT_DESCRIPTION,
    canonical,
    keywords,
    ogImage = DEFAULT_IMAGE,
    ogType = 'website',
    jsonLd,
    noIndex = false,
    geo,
    locale = 'en_GB',
    alternates
}: SEOProps) {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const isUSDomain = hostname.includes('emergencycontractors.net');
    
    const SITE_URL = isUSDomain ? SITE_URL_US : SITE_URL_GB;
    const SITE_NAME = isUSDomain ? SITE_NAME_US : SITE_NAME_GB;

    const fullTitle = `${title} | ${SITE_NAME}`;
    
    // Adjust canonical for US Domain
    let effectiveCanonical = canonical;
    if (isUSDomain && effectiveCanonical?.startsWith('/us')) {
        effectiveCanonical = effectiveCanonical.replace(/^\/(us|usa)/, '') || '/';
    }

    const absoluteUrl = effectiveCanonical ? (effectiveCanonical.startsWith('http') ? effectiveCanonical : `${SITE_URL}${effectiveCanonical}`) : SITE_URL;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            {keywords && <meta name="keywords" content={keywords.join(', ')} />}
            <link rel="canonical" href={absoluteUrl} />
            {noIndex && <meta name="robots" content="noindex, nofollow" />}

            {/* OpenGraph / Facebook */}
            <meta property="og:type" content={ogType} />
            <meta property="og:url" content={absoluteUrl} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:locale" content={locale} />

            {/* Geo Targeting */}
            {geo && (
                <>
                    <meta name="geo.region" content={geo.region} />
                    <meta name="geo.placename" content={geo.placename} />
                    <meta name="geo.position" content={geo.position} />
                    <meta name="ICBM" content={geo.position.replace(';', ', ')} />
                </>
            )}

            {/* Internationalization */}
            {alternates?.map((alt) => (
                <link key={alt.lang} rel="alternate" hrefLang={alt.lang} href={alt.href} />
            ))}

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />

            {/* Structured Data (JSON-LD) */}
            {jsonLd && (
                <script type="application/ld+json">
                    {JSON.stringify(jsonLd)}
                </script>
            )}
        </Helmet>
    );
}
