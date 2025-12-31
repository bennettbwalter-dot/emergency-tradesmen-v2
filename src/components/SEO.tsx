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
}

const DEFAULT_DESCRIPTION = "Need a tradesman near you? We connect you with verified 24/7 emergency plumbers, electricians, locksmiths & gas engineers. Local experts arriving in 30-90 mins.";
const DEFAULT_IMAGE = "https://emergencytradesmen.net/tradesman-hero-v2.webp";
const SITE_URL = "https://emergencytradesmen.net";
const SITE_NAME = "Emergency Tradesmen";

export function SEO({
    title,
    description = DEFAULT_DESCRIPTION,
    canonical,
    keywords,
    ogImage = DEFAULT_IMAGE,
    ogType = 'website',
    jsonLd,
    noIndex = false
}: SEOProps) {

    const fullTitle = `${title} | ${SITE_NAME}`;
    const absoluteUrl = canonical ? (canonical.startsWith('http') ? canonical : `${SITE_URL}${canonical}`) : SITE_URL;

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
