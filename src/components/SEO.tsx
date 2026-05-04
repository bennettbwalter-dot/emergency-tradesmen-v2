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
    locale,
    alternates
}: SEOProps) {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const port = typeof window !== 'undefined' ? window.location.port : '';
    const isUSDomain = hostname.includes('emergencycontractors.net') || (hostname === 'localhost' && port === '3001') || (hostname === '127.0.0.1' && port === '3001');

    const SITE_URL = isUSDomain ? SITE_URL_US : SITE_URL_GB;
    const SITE_NAME = isUSDomain ? SITE_NAME_US : SITE_NAME_GB;
    const effectiveLocale = locale ?? (isUSDomain ? 'en_US' : 'en_GB');

    // Prevent triple-pipe titles: only append brand name if not already present
    const titleAlreadyHasBrand = title.includes(SITE_NAME) || title.includes(SITE_NAME_GB) || title.includes(SITE_NAME_US);
    const fullTitle = titleAlreadyHasBrand ? title : `${title} | ${SITE_NAME}`;

    // Adjust canonical for US Domain
    let effectiveCanonical = canonical;
    if (isUSDomain) {
        // If on US domain, strip /us or /usa from the provided canonical or default to current path
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
        const pathToUse = effectiveCanonical || currentPath;
        effectiveCanonical = pathToUse.replace(/^\/(us|usa)/, '') || '/';
    }

    const absoluteUrl = effectiveCanonical
        ? (effectiveCanonical.startsWith('http') ? effectiveCanonical : `${SITE_URL}${effectiveCanonical}`)
        : SITE_URL;

    // Default Organization Schema — applied to all pages to reinforce brand identity
    const defaultSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": SITE_NAME,
        "alternateName": isUSDomain ? "Emergency Contractors Network" : "Emergency Tradesmen UK",
        "url": SITE_URL,
        "logo": `${SITE_URL}/et-logo-v3.png`,
        "description": description || DEFAULT_DESCRIPTION,
        "address": {
            "@type": "PostalAddress",
            "addressCountry": isUSDomain ? "US" : "GB"
        },
        "areaServed": {
            "@type": "Country",
            "name": isUSDomain ? "United States" : "United Kingdom"
        },
        "openingHours": "Mo-Su 00:00-24:00",
        "contactPoint": {
            "@type": "ContactPoint",
            "email": isUSDomain ? "emergencycontractors@outlook.com" : "emergencytradesmen@outlook.com",
            "contactType": "customer support",
            "availableLanguage": "English"
        },
        "sameAs": [
            "https://www.facebook.com/profile.php?id=61588024972553",
            "https://www.instagram.com/emergencytradesmen/",
            "https://x.com/etemergenc26245",
            "https://www.tiktok.com/@emergencytradesmen"
        ]
    };

    // Combine default schema with provided jsonLd
    const combinedJsonLd = jsonLd
        ? (Array.isArray(jsonLd) ? [defaultSchema, ...jsonLd] : [defaultSchema, jsonLd])
        : defaultSchema;

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
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:locale" content={effectiveLocale} />

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
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />

            {/* Harbor SEO script - US only */}



            {/* Structured Data (JSON-LD) */}
            <script type="application/ld+json">
                {JSON.stringify(combinedJsonLd)}
            </script>
        </Helmet>
    );
}
