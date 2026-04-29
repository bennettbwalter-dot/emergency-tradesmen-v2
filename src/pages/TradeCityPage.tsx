import { useParams, Navigate, useLocation } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef, useMemo, Suspense, lazy } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FAQSection } from "@/components/FAQSection";
import { CTABanner } from "@/components/CTABanner";
import { TrustBadges } from "@/components/TrustBadges";
import { isFavorite } from "@/lib/auth";
import { BusinessCard } from "@/components/BusinessCard";
import { BusinessCardSkeleton } from "@/components/BusinessCardSkeleton";
import { SearchFilterBar } from "@/components/SearchFilterBar";
import { ReviewsSection } from "@/components/ReviewsSection";
import { WriteReviewModal } from "@/components/WriteReviewModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Squares from "@/components/ui/Squares";
import { generateTradePageData, cities, usCities, cityToState, getCitiesForState, trades, commonProblems } from "@/lib/trades";
import { US_STATES } from "@/lib/us_states";
import { getPostcodeForCity } from "@/lib/cityPostcodes";
import { cityCoordinates, findNearestCity } from "@/lib/cityCoordinates";
import { usCityCoordinates } from "@/lib/usCityCoordinates";
import { getBusinessListings } from "@/lib/businesses";
import { fetchBusinesses } from "@/lib/businessService";
import { generateMockReviews, calculateReviewStats } from "@/lib/reviews";
import { useBusinessFilters } from "@/hooks/useBusinessFilters";
import { Phone, Clock, CheckCircle, MapPin, PoundSterling, DollarSign, Shield, Navigation, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { AdSlot } from "@/components/AdSlot";
import { AvailabilityCarousel } from "@/components/AvailabilityCarousel";
import { HomeEmergencyAd } from "@/components/HomeEmergencyAd";

// Lazy load heavy map component
const InteractiveMap = lazy(() => import("@/components/InteractiveMap").then(module => ({ default: module.InteractiveMap })));
import { useLocalization } from "@/contexts/LocalizationContext";
import { useSimpleTheme } from "@/components/simple-theme";
import type { Business } from "@/lib/businesses";
import { supabase } from "@/lib/supabase";
import { FloatingEmergencyCTA } from "@/components/FloatingEmergencyCTA";
import { TroubleshootingGuide } from "@/components/TroubleshootingGuide";
import { PhoneCaptureModal } from "@/components/PhoneCaptureModal";
import { LocalAreaBackdrop } from "@/components/earth/LocalAreaBackdrop";
import { Zap, ArrowRight, Star } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function TradeCityPage() {
  const { countryCode, tradePath, city, state, area, metro, suburb } = useParams<{
    countryCode: string;
    tradePath: string;
    city: string;
    state?: string;
    area?: string;
    metro?: string;
    suburb?: string;
  }>();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const hasLoadedRef = useRef(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const ITEMS_PER_PAGE = 9;

  const location = useLocation();

  // Resolution Logic for Hierarchy
  const rawTargetLocation = suburb || area || city || metro || state;

  // Parse location from URL if present (Emergency CTA flow)
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const urlLat = queryParams.get('lat');
  const urlLng = queryParams.get('lng');
  const earthZoomParam = queryParams.get('earthZoom');
  const earthPitchParam = queryParams.get('earthPitch');
  const earthBearingParam = queryParams.get('earthBearing');
  const earthZoom = earthZoomParam ? Number(earthZoomParam) : undefined;
  const earthPitch = earthPitchParam ? Number(earthPitchParam) : undefined;
  const earthBearing = earthBearingParam ? Number(earthBearingParam) : undefined;

  const resolvedLocation = useMemo(() => {
    if (!rawTargetLocation && urlLat && urlLng) {
      const nearest = findNearestCity(parseFloat(urlLat), parseFloat(urlLng), countryCode?.toUpperCase() || (location.pathname.startsWith('/us') ? 'US' : 'GB'));
      if (nearest) {
        return nearest.city;
      }
    }
    return rawTargetLocation;
  }, [rawTargetLocation, urlLat, urlLng, countryCode, location.pathname]);

  // CRITICAL FIX: Default to 'London' (or National) if no city provided to prevent crash
  let validCity = resolvedLocation ? decodeURIComponent(resolvedLocation) : (countryCode === 'US' ? 'New York' : 'London');

  // FIX: US Routing Ambiguity
  // If tradePath matches a known US state (e.g. /us/texas/dallas matched as :tradePath/:city),
  // treat it as state, not trade.
  let effectiveTradePath = tradePath;
  let effectiveState = state;

  if (!effectiveState && effectiveTradePath && US_STATES.some(s => s.slug === effectiveTradePath)) {
    effectiveState = effectiveTradePath;
    effectiveTradePath = undefined;
  }

  // Resolution Logic for Trade
  let validTrade = effectiveTradePath ? effectiveTradePath.replace("emergency-", "") : "default";

  // Fallback for explicit routes (e.g. /emergency-plumber/:city) where tradePath param is missing from useParams
  if (validTrade === "default") {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    // Find the segment that looks like a trade (starts with emergency- or matches a known trade)
    const tradeSegment = pathSegments.find(s => s.startsWith('emergency-') || ['plumber', 'electrician', 'locksmith'].includes(s));

    if (tradeSegment) {
      validTrade = tradeSegment.replace("emergency-", "").replace("-near-me", "");
    }
  }

  // Handle /us/ca/los-angeles legacy ambiguity if needed, but new router prevents most.
  // We keep it simple: Trust params.

  const country = countryCode?.toUpperCase() || (location.pathname.startsWith('/us') ? 'US' : 'GB');

  // Pass state and metro context to generator for strict lookup
  const pageData = generateTradePageData(
    validTrade,
    validCity,
    country,
    effectiveState,
    metro
  );

  // Normalize cities for check (handles hyphens from URL)
  const normalizedCitiesGB = cities.map(c => c.toLowerCase().replace(/\s+/g, '-'));
  // We can't just check usCities array anymore because it doesn't contain suburbs
  // We rely on generateTradePageData to have validated it, or we need a robust check.
  // Since pageData is already generated above using generateTradePageData(..., validCity, ...),
  // we can check if pageData was successfully returned and what country it thinks it is.

  // However, we need to know if it's supposed to be US or GB for the Redirect logic below.
  // If pageData exists, we can trust it?

  // Let's make a more robust check using our Knowledge Base (or us_cities.json implicitly available via imports in trades.ts but not here directly efficiently)
  // Actually, we can use the `pageData` result. generateTradePageData returns null if not found.
  // But wait, generateTradePageData might return data even if not found if we passed 'US' as countryCode (it falls back to input name).

  // Let's assume if the route is /us/..., we are looking for US.
  // The redirect logic below deals with "Region Mismatch".

  const isCityUS = countryCode === 'us' || (pageData && pageData.city && usCities.includes(pageData.city)) || false;
  // This is imperfect. Better:

  // If we are in /us route, we assume US.
  // If we are in /... (GB) route, we assume GB.
  // The Mismatch logic tries to catch: user goes to /london (GB) but london is US? No.
  // It catches: user goes to /us/london (if london is GB only) -> Redirect to /london.

  // Ideally we use `getLocationIndex` but that's overkill to import here if we can avoid it.
  // Let's rely on simple heuristic + explicit countryCode param.

  // Region Mismatch / Redirects
  // We trust the URL structure for Country determination, but also handle the US-specific root domain.
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const port = typeof window !== 'undefined' ? window.location.port : '';
  const isUSDomain = hostname.includes('emergencycontractors.net') || (hostname === 'localhost' && port === '3001') || (hostname === '127.0.0.1' && port === '3001');

  const actualCountry = useMemo(() => {
    const hostname = window.location.hostname;
    const port = window.location.port;
    if (hostname.includes('emergencycontractors.net') || (hostname === 'localhost' && port === '3001') || (hostname === '127.0.0.1' && port === '3001')) return 'US';
    if (hostname.includes('emergencytradesmen.net') || port === '3000' || (hostname === 'localhost' && port === '3000')) return 'GB';

    // Fallback detection
    if (
      location.pathname.startsWith('/us/') ||
      location.pathname.startsWith('/us') ||
      countryCode?.toLowerCase() === 'us' ||
      pageData?.countryCode === 'US' ||
      (validCity && usCities.includes(validCity))
    ) return 'US';

    return 'GB';
  }, [countryCode, pageData?.countryCode, validCity, usCities, location.pathname]);

  // NEW: State Page Detection
  const isStatePage = useMemo(() => {
    return actualCountry === 'US' && !!effectiveState && (!city || city.toLowerCase() === effectiveState.toLowerCase());
  }, [actualCountry, effectiveState, city]);

  // Only redirect if there is a glaring mismatch (e.g. city definitely wrong?)
  // For now, removing strict redirect allows new US locations to work without "white-listing" in trades.ts
  // Old logic removed.

  const toTitleCase = (str: string) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const tradeInfo = pageData?.trade || { slug: validTrade, name: validTrade || 'Tradesperson', icon: '🔧' } as any;
  const tradeDisplayName = (actualCountry === 'US' && 'usName' in tradeInfo) ? (tradeInfo as any).usName : tradeInfo.name;

  // Apply title case to city name and ensure it's not just a slug
  const rawCityName = pageData?.city || validCity || (countryCode?.toUpperCase() === 'US' ? 'United States' : 'United Kingdom');
  const cityName = toTitleCase(rawCityName.replace(/-/g, ' '));
  const cityCoords = cityCoordinates[cityName] || usCityCoordinates[cityName];
  const earthBackdropLat = urlLat ? Number(urlLat) : cityCoords?.lat;
  const earthBackdropLng = urlLng ? Number(urlLng) : cityCoords?.lng;

  const serviceAreas = pageData?.serviceAreas || [];
  const averageResponseTime = pageData?.averageResponseTime || '30-90 minutes';
  const emergencyPriceRange = pageData?.emergencyPriceRange || '£75 - £150';
  const certifications = pageData?.certifications || [];
  const services = pageData?.services || [];
  const faqs = pageData?.faqs || [];

  // Map of trade-specific background images for hero
  const tradeHeroImages: Record<string, string> = {
    'plumber': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=2070&auto=format&fit=crop',
    'electrician': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069&auto=format&fit=crop',
    'locksmith': 'https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=2070&auto=format&fit=crop',
    'gas-engineer': '/images/gas-engineer/gas-engineer-hero.webp',
    'drain-specialist': 'https://images.unsplash.com/photo-1542013936693-884638332954?q=80&w=2070&auto=format&fit=crop',
    'glazier': '/images/glazier/glazier-hero.webp',
    'breakdown': '/images/breakdown-recovery/breakdown-hero.webp',
    'default': 'https://images.unsplash.com/photo-1469122312224-c5846569efe1?q=80&w=2070&auto=format&fit=crop'
  };

  // Prefer image from trade config (trades.ts) if available, otherwise fallback to local map
  const heroImage = (pageData?.problem as any)?.image || (tradeInfo as any).image || tradeHeroImages[tradeInfo.slug] || tradeHeroImages.default;

  const { settings, userCoords } = useLocalization();
  const { theme } = useSimpleTheme();

  const effectiveCoords = useMemo(() => {
    if (urlLat && urlLng) {
      return { latitude: parseFloat(urlLat), longitude: parseFloat(urlLng) };
    }
    return userCoords;
  }, [urlLat, urlLng, userCoords]);

  // Fetch real businesses from Supabase — does NOT depend on userCoords
  // userCoords is only used for sorting (handled in a separate effect below)
  const prevContextRef = useRef<string>("");

  useEffect(() => {
    // Only fetch if we have valid data
    if (!tradeInfo.slug) return;

    const currentContext = `${tradeInfo.slug}-${cityName}-${actualCountry}`;
    const isNewLocationOrTrade = prevContextRef.current !== currentContext;

    async function loadBusinesses() {
      if (isNewLocationOrTrade) {
        setIsLoading(true);
        prevContextRef.current = currentContext;
      }

      try {
        const realBusinesses = await fetchBusinesses(
          tradeInfo.slug,
          validCity,
          actualCountry,
          effectiveCoords || undefined,
          isStatePage ? effectiveState : undefined
        );
        setBusinesses(realBusinesses);
      } catch (error) {
        console.error('Error loading businesses:', error);
        setBusinesses([]);
      } finally {
        setIsLoading(false);
        hasLoadedRef.current = true;
      }
    }

    loadBusinesses();
  }, [tradeInfo.slug, cityName, actualCountry]);

  // Separate effect: Re-sort existing businesses when userCoords becomes available
  // This avoids a full refetch and prevents the "empty flash" on mobile
  useEffect(() => {
    if (!effectiveCoords || businesses.length === 0) return;

    setBusinesses(prev => [...prev].sort((a, b) => {
      // 1. Paid businesses always first
      if (a.tier === 'paid' && b.tier !== 'paid') return -1;
      if (a.tier !== 'paid' && b.tier === 'paid') return 1;

      // 2. Proximity sort using effectiveCoords
      if (a.latitude && a.longitude && b.latitude && b.longitude) {
        const distA = Math.sqrt(
          Math.pow((a.latitude - effectiveCoords.latitude) * 69, 2) +
          Math.pow((a.longitude - effectiveCoords.longitude) * 69 * Math.cos(effectiveCoords.latitude * Math.PI / 180), 2)
        );
        const distB = Math.sqrt(
          Math.pow((b.latitude - effectiveCoords.latitude) * 69, 2) +
          Math.pow((b.longitude - effectiveCoords.longitude) * 69 * Math.cos(effectiveCoords.latitude * Math.PI / 180), 2)
        );
        return distA - distB;
      }

      // 3. Fallback to priority score
      return (b.priority_score || 0) - (a.priority_score || 0);
    }));
  }, [effectiveCoords]);

  // Real-time updates for Availability
  useEffect(() => {
    try {
      const channel = supabase
        .channel('public:businesses')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'businesses' },
          (payload) => {
            setBusinesses(current =>
              current.map(b =>
                b.id === payload.new.id
                  ? { ...b, ...payload.new }
                  : b
              )
            );
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (e) {
      console.warn('Real-time subscription failed (non-critical):', e);
    }
  }, []);

  // Show phone capture modal once per session after a short delay
  useEffect(() => {
    const key = 'phone_modal_seen';
    if (sessionStorage.getItem(key)) return;
    const timer = setTimeout(() => {
      setShowPhoneModal(true);
      sessionStorage.setItem(key, '1');
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Apply filters and sorting
  const { filters, setFilters, filteredBusinesses, totalCount, resultsCount } =
    useBusinessFilters(businesses);

  // Pagination Logic — sort favorites to top first
  const sortedBusinesses = useMemo(() => {
    return [...filteredBusinesses].sort((a, b) => {
      const aFav = isFavorite(a.id) ? 1 : 0;
      const bFav = isFavorite(b.id) ? 1 : 0;
      return bFav - aFav; // Favorited businesses come first
    });
  }, [filteredBusinesses]);

  const totalPages = Math.ceil(resultsCount / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentBusinesses = sortedBusinesses.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, city, tradePath]);

  // No redirect on empty results — render in-place so the URL is preserved for SEO

  // Early returns must happen AFTER hooks
  const validatedTradePath = tradeInfo.slug;

  // Guard: Only allow known trade slugs — reject non-trade paths like 'blog', 'about', etc.
  const knownTrades = ['plumber', 'electrician', 'locksmith', 'gas-engineer', 'drain-specialist', 'glazier', 'roofer', 'breakdown', 'builder', 'water-restoration', 'hvac', 'pest-control', 'handyman', 'joiner', 'default'];
  if (!validatedTradePath || (!knownTrades.includes(validatedTradePath) && !pageData?.trade)) {
    return <Navigate to="/" replace />;
  }

  // Extract real verified reviews from the listings
  const realReviews = businesses
    .filter(b => b.featuredReview && b.rating >= 4.0)
    .slice(0, 8)
    .map((b) => ({
      id: `real-review-${b.id}`,
      businessId: b.id,
      userId: `user-${b.id}`,
      userName: "Verified Customer",
      userInitials: "VC",
      rating: b.rating,
      title: "Verified Review",
      comment: b.featuredReview!,
      date: new Date().toISOString(),
      verified: true,
      helpful: Math.floor(Math.random() * 5),
      notHelpful: 0,
    }));

  const reviewStats = calculateReviewStats(realReviews);

  const postcode = getPostcodeForCity(cityName);

  // Schema.org Type Mapping
  const tradeSchemaTypeMap: Record<string, string> = {
    'plumber': 'Plumber',
    'electrician': 'Electrician',
    'locksmith': 'Locksmith',
    'gas-engineer': 'Plumber', // Fallback for gas
    'drain-specialist': 'Plumber', // Fallback
    'glazier': 'HomeAndConstructionBusiness', // No direct Glazier type
    'breakdown': 'AutoRepair', // Closest match
    'default': 'HomeAndConstructionBusiness'
  };

  const schemaType = tradeSchemaTypeMap[tradeInfo.slug] || tradeSchemaTypeMap['default'];

  const baseDomain = isUSDomain ? 'https://emergencycontractors.net' : 'https://emergencytradesmen.net';

  const serviceSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": schemaType,
    "@id": `${baseDomain}/emergency-${tradeInfo.slug}/${cityName.toLowerCase().replace(/\s+/g, '-')}#localbusiness`,
    name: `Emergency ${tradeDisplayName} ${cityName}`,
    description: `24/7 emergency ${tradeDisplayName.toLowerCase()} services in ${cityName}. Fast response, fully insured professionals.`,
    image: heroImage,
    url: `${baseDomain}/emergency-${tradeInfo.slug}/${cityName.toLowerCase().replace(/\s+/g, '-')}`,
    "priceRange": actualCountry === 'US' ? "$75 - $150" : "£75 - £150",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": cityName,
      "addressCountry": countryCode?.toUpperCase() || "GB",
      ...(postcode ? { "postalCode": postcode } : {}),
      ...(effectiveState ? { "addressRegion": effectiveState } : {})
    },
    ...(cityCoords ? {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": cityCoords.lat,
        "longitude": cityCoords.lng
      }
    } : {}),
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "00:00",
      "closes": "23:59"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": reviewStats.averageRating.toFixed(1),
      "reviewCount": reviewStats.totalReviews,
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": realReviews.map(review => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": review.userName
      },
      "datePublished": review.date,
      "reviewBody": review.comment,
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": "5",
        "worstRating": "1"
      }
    })),
    "areaServed": [
      { "@type": "City", "name": cityName },
      ...serviceAreas.slice(0, 6).map((area: any) => ({
        "@type": "AdministrativeArea",
        "name": typeof area === 'string' ? area : area.name || area
      }))
    ],
    "itemListElement": services.map((service) => ({
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": service
      }
    })),
    "potentialAction": {
      "@type": "ReserveAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseDomain}/contact`,
        "actionPlatform": [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform"
        ]
      },
      "result": {
        "@type": "Reservation",
        "name": `Emergency ${tradeDisplayName} Booking`
      }
    }
  }), [tradeInfo.slug, cityName, tradeDisplayName, heroImage, countryCode, postcode, actualCountry, reviewStats.averageRating, reviewStats.totalReviews, JSON.stringify(realReviews), JSON.stringify(serviceAreas), JSON.stringify(services)]);

  const faqSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }), [JSON.stringify(faqs)]);

  // --- Long-tail SEO: derive state code and coordinates ---
  const isUS = actualCountry === 'US';
  const tradeName = tradeDisplayName.toLowerCase(); // FIXED: restored tradeName for downstream usages
  const stateSlug = isUS ? cityToState[cityName]?.toUpperCase() : '';
  const stateCode = stateSlug || '';
  const citySlug = cityName.toLowerCase().replace(/\s+/g, '-');

  const breadcrumbSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseDomain
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": `Emergency ${tradeDisplayName}`,
        "item": `${baseDomain}/emergency-${tradeInfo.slug}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": `${cityName}${isUS && stateCode ? `, ${stateCode}` : ''}`,
        "item": `${baseDomain}/emergency-${tradeInfo.slug}/${citySlug}`
      }
    ]
  }), [baseDomain, tradeInfo.slug, cityName, tradeDisplayName, citySlug, isUS, stateCode]);

  // FIXED: Ensure coordinates are resolved correctly for map centering
  const isCityInUS = usCities.includes(cityName);
  const countryForCoords = isUS || isCityInUS ? 'US' : 'GB';

  const canonicalPath = isUS
    ? (isUSDomain ? `/${effectiveTradePath}/${citySlug}` : `/us/${effectiveTradePath}/${citySlug}`)
    : `/${effectiveTradePath}/${citySlug}`;

  // --- Enhanced Titles for Long-Tail "Near Me" Ranking ---
  const localTerm = isUS ? 'Contractors' : 'Tradesmen';
  const seoTitle = isStatePage
    ? `Emergency ${tradeDisplayName} in ${cityName} – Best Local ${localTerm} Near Me 24/7`
    : pageData?.problem
      ? `${pageData.problem.name} in ${cityName}${stateCode ? ` ${stateCode}` : ''} – Emergency Repair 24/7`
      : isUS
        ? `Emergency ${tradeDisplayName} ${cityName} ${stateCode} – Local ${localTerm} Near Me 24/7`
        : `Emergency ${tradeDisplayName} ${cityName} – Local ${localTerm} Near Me 24/7`;

  // --- Richer Meta Descriptions (question → answer → CTA) ---
  const listingCount = businesses.length;
  const seoDescription = isStatePage
    ? `Need an emergency ${tradeName} near me in ${cityName}? ✓ ${listingCount > 0 ? listingCount : 'Verified'} local contractors across the state ✓ ${averageResponseTime} avg response ✓ Open 24 hours. Call now for fast help.`
    : pageData?.problem
      ? `${pageData.problem.description} in ${cityName}${stateCode ? ` ${stateCode}` : ''}. Available 24/7 with ${averageResponseTime} response time. Get connected with a verified expert now.`
      : isUS
        ? `Need an emergency ${tradeName} near me in ${cityName} ${stateCode}? ✓ ${listingCount > 0 ? listingCount : 'Verified'} local contractors ✓ ${averageResponseTime} avg response ✓ Open 24 hours. Get connected now.`
        : `Looking for a local emergency ${tradeName} near me in ${cityName}? ✓ ${listingCount > 0 ? listingCount : 'Verified'} local tradesmen ✓ ${averageResponseTime} response ✓ 24/7 availability. Call now for fast help.`;

  // --- Expanded Long-Tail Keywords Array ---
  const seoKeywords = pageData?.problem
    ? [
      pageData.problem.slug,
      `${cityName} ${pageData.problem.slug}`,
      `emergency ${tradeName}`,
      `${tradeName} near me`
    ]
    : [
      // Core "near me" variants
      `${tradeName} near me`,
      `emergency ${tradeName} near me`,
      `local ${tradeName} ${cityName}`,
      // Long-tail intent
      `24 hour ${tradeName} ${cityName}`,
      `${tradeName} open now ${cityName}`,
      `best ${tradeName} near me`,
      `trusted ${tradeName} ${cityName}`,
      // Emergency variants
      `emergency ${tradeName} near me open now`,
      `${tradeName} emergency call out ${cityName}`,
      // Market-specific - DENSITY BOOST as requested
      ...(isUS ? [
        `${tradeName} ${cityName} ${stateCode}`,
        `local contractors near me`,
        `emergency contractors ${cityName}`,
        `best contractors ${cityName}`,
        `${tradeName} ${stateCode} near me`
      ] : [
        `local tradesmen near me`,
        `emergency tradesmen ${cityName}`,
        `best tradesmen ${cityName}`,
        `${tradeName} ${cityName} UK`,
        `cheap ${tradeName} ${cityName}`
      ])
    ];

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        canonical={canonicalPath}
        ogImage={heroImage}
        jsonLd={[serviceSchema, faqSchema, breadcrumbSchema]}
        locale={isUS ? 'en_US' : 'en_GB'}
        {...(cityCoords ? {
          geo: {
            region: isUS ? `US-${stateCode}` : 'GB',
            placename: cityName,
            position: `${cityCoords.lat};${cityCoords.lng}`
          }
        } : {})}
        alternates={[
          { lang: 'en-GB', href: `https://emergencytradesmen.net/${effectiveTradePath}/${citySlug}` },
          { lang: 'en-US', href: `https://emergencycontractors.net/${effectiveTradePath}/${citySlug}` },
          { lang: 'x-default', href: `https://emergencytradesmen.net/${effectiveTradePath}/${citySlug}` }
        ]}
      />



      <Header countryCode={actualCountry} />

      <main>
        {/* Interactive local-area header */}
        <section className="relative h-[62svh] min-h-[440px] max-h-[760px] overflow-hidden bg-black">
          <LocalAreaBackdrop
            lat={Number.isFinite(earthBackdropLat) ? earthBackdropLat : cityCoords?.lat}
            lng={Number.isFinite(earthBackdropLng) ? earthBackdropLng : cityCoords?.lng}
            zoom={Number.isFinite(earthZoom) ? earthZoom : undefined}
            pitch={Number.isFinite(earthPitch) ? earthPitch : undefined}
            bearing={Number.isFinite(earthBearing) ? earthBearing : undefined}
            fallbackImage={heroImage}
            label={pageData?.problem ? `${pageData.problem.name} ${cityName}` : `Emergency ${tradeDisplayName} ${cityName}`}
            location={queryParams.get('earthLocation') || cityName}
            interactive
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-background/90 via-background/30 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-t from-background via-background/45 to-transparent" />
          <div className="pointer-events-none absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-gold/45 bg-background/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-gold shadow-[0_14px_40px_rgba(0,0,0,0.45)] backdrop-blur-md">
            <Navigation className="h-4 w-4" />
            Interactive street view: {cityName}{isUS && stateCode ? `, ${stateCode}` : ''}
          </div>
        </section>

        {/* Page introduction */}
        <section className="container-wide pt-10 pb-12 md:pt-14 md:pb-16">
          <div className="mx-auto max-w-4xl text-center">
              <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground/60">
                <Link to="/" className="hover:text-gold transition-colors">Home</Link>
                <span className="text-gold/50">/</span>
                <Link to={`/emergency-${tradeInfo.slug}`} className="text-foreground/80 hover:text-gold transition-colors">Emergency {tradeDisplayName}</Link>
                <span className="text-gold/50">/</span>
                <span className="text-gold font-medium" aria-current="page">{cityName}{isUS && stateCode ? `, ${stateCode}` : ''}</span>
              </nav>

              <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-gold/50 bg-secondary/50 px-5 py-2.5 shadow-[0_0_15px_rgba(212,175,55,0.2)] backdrop-blur-md animate-fade-up">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
                </span>
                <span className="text-sm font-medium uppercase tracking-wider text-foreground">
                  {pageData?.problem ? `${pageData.problem.name}s` : `${tradeDisplayName}s`} <span className="text-gold font-bold">available now</span> {isStatePage ? `across ${cityName}` : `in ${cityName}`}
                </span>
              </div>

              <h1 className="mb-6 animate-fade-up">
                <span className="block font-display text-4xl md:text-6xl tracking-wide text-foreground mb-2 text-balance">
                  {pageData?.problem ? pageData.problem.name : `Emergency ${tradeDisplayName}`}
                </span>
                <span className="block font-display text-4xl md:text-6xl tracking-wide text-gold">
                  in {cityName}{isUS && stateCode ? `, ${stateCode}` : ''}
                </span>
              </h1>

              <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-foreground/80 font-light animate-fade-up-delay-1">
                Don't panic – help is on the way. Our network of local emergency {tradeDisplayName.toLowerCase()}s {isStatePage ? `serving ${cityName}` : `in ${cityName}`} are ready to respond right now.
                With an average arrival time of {averageResponseTime}, you won't be waiting long. We only work with verified, fully insured professionals who deliver quality work at fair prices.
              </p>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-up-delay-2">
                <Button
                  variant="hero"
                  onClick={() => {
                    document.getElementById('listings')?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }}
                  className="flex items-center gap-3"
                >
                  <Phone className="w-5 h-5" />
                  Find a Pro
                </Button>
                <div className="flex items-center gap-3 text-foreground/70 px-6 py-3 border border-border/50 rounded-sm bg-secondary/30 backdrop-blur-sm">
                  <Clock className="w-5 h-5 text-gold" />
                  <span className="uppercase tracking-wider text-sm font-bold">Response in {averageResponseTime}</span>
                </div>
              </div>
          </div>
        </section>

        {/* TL;DR Answer Block — optimized for AI Overviews / featured snippets */}
        <section className="container-wide pt-10" aria-labelledby="quick-answer-heading">
          <div className="max-w-3xl mx-auto bg-secondary/40 border border-gold/30 rounded-xl p-6 md:p-7">
            <h2 id="quick-answer-heading" className="text-sm font-bold uppercase tracking-wider text-gold mb-3">
              Quick Answer
            </h2>
            <p className="text-base md:text-lg text-foreground/90 leading-relaxed">
              {pageData?.problem ? (
                <>
                  For <strong>{pageData.problem.name.toLowerCase()} in {cityName}{isUS && stateCode ? `, ${stateCode}` : ''}</strong>, contact a local emergency {tradeDisplayName.toLowerCase()} immediately. {listingCount > 0 ? `${listingCount} verified local ${tradeDisplayName.toLowerCase()}${listingCount === 1 ? ' is' : 's are'} available 24/7` : `Verified local ${tradeDisplayName.toLowerCase()}s are available 24/7`} with an average response time of <strong>{averageResponseTime}</strong>. Call directly — no forms, no waiting.
                </>
              ) : (
                <>
                  Need an <strong>emergency {tradeDisplayName.toLowerCase()} in {cityName}{isUS && stateCode ? `, ${stateCode}` : ''}</strong>? {listingCount > 0 ? `${listingCount} verified local ${tradeDisplayName.toLowerCase()}${listingCount === 1 ? '' : 's'}` : `Verified local ${tradeDisplayName.toLowerCase()}s`} {listingCount === 1 ? 'is' : 'are'} available 24/7 with an average response time of <strong>{averageResponseTime}</strong>. Call directly — no forms, no waiting.
                </>
              )}
            </p>
          </div>
        </section>

        {/* Trust Section */}
        <section className="container-wide py-12">
          {pageData?.localExpertise && (
            <div className="mb-12 p-6 bg-gold/5 border border-gold/20 rounded-xl animate-fade-up">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 flex items-center justify-center flex-shrink-0 transition-transform hover:scale-110 duration-500">
                  <img src="/et-logo-v3.webp" alt="Emergency Tradesmen" loading="lazy" decoding="async" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
                    {isStatePage ? `${cityName} Regional Presence` : `Local Intelligence: ${cityName}${isUS && stateCode ? `, ${stateCode}` : ''}`}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {pageData.localExpertise}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Coverage Map Section */}
          {/* Coverage Map Section - Lazy Loaded */}
          <div className="mb-12 h-[300px] md:h-[450px] rounded-2xl overflow-hidden border border-border/50 shadow-2xl relative group bg-secondary/10">
            <div className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur-md px-4 py-2 rounded-full border border-border/50 text-sm font-medium">
              Real-time local coverage: {cityName}{isUS && stateCode ? `, ${stateCode}` : ''}
            </div>
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center bg-muted/20 animate-pulse">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <MapPin className="w-8 h-8 opacity-20" />
                  <span className="text-sm">Loading map...</span>
                </div>
              </div>
            }>
              <InteractiveMap
                city={cityName}
                countryCode={actualCountry}
                showBusinesses={true}
                businesses={businesses}
                latitude={cityCoords?.lat}
                longitude={cityCoords?.lng}
                className="w-full h-full"
              />
            </Suspense>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {certifications.map((cert, index) => (
              <div key={index} className="flex items-center gap-3 p-5 bg-card rounded-lg border border-border/50 hover:border-gold/30 transition-colors">
                <div className="w-10 h-10 rounded-full border border-gold/30 bg-gold/5 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-gold" />
                </div>
                <span className="text-sm font-medium text-foreground">{cert}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className={cn("container-wide py-16", theme === 'dark' && "bg-card/30")}>
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-display text-foreground mb-4">{cityName} Emergency {tradeDisplayName} Services</h2>
            <p className="text-muted-foreground">Comprehensive emergency {tradeDisplayName.toLowerCase()} solutions for {cityName} and surrounding areas.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div key={index} className="flex items-start gap-4 p-6 bg-background rounded-lg border border-border/50 hover:border-gold/20 transition-all">
                <CheckCircle className="w-5 h-5 text-gold shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{service}</h3>
                  <p className="text-sm text-muted-foreground">Expert handling of all {service.toLowerCase()} situations.</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Ad Slot 1: Between Services and Listings */}
        <div className="container-wide py-4">
          <AdSlot slot="7143278448" format="infeed" />
        </div>

        {/* Affiliate Ad Section */}
        <div className="container-wide">
          <HomeEmergencyAd />
        </div>

        {/* Listings Section */}
        <section className="container-wide py-16 relative">
          {/* Background Grid */}
          {theme === 'dark' && (
            <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
              <Squares
                direction="diagonal"
                speed={0.3}
                squareSize={50}
                borderColor="rgba(212, 175, 55, 0.1)"
                hoverFillColor="rgba(212, 175, 55, 0.05)"
                lineThickness={0.5}
              />
            </div>
          )}

          <div className="mb-8 relative z-10">
            <SearchFilterBar
              filters={filters}
              onFiltersChange={setFilters}
              totalCount={totalCount}
              resultsCount={resultsCount}
            />
          </div>

          <div className="mb-6 relative z-10">
            <h2 className="text-2xl font-bold text-foreground">
              Top Rated Local {tradeInfo.name}s near {cityName}{isUS && stateCode ? `, ${stateCode}` : ''}
            </h2>
            <p className="text-muted-foreground">
              Found {totalCount} available experts nearby {resultsCount > 50 && `(Showing top 50)`}
            </p>
          </div>

          {isLoading || !hasLoadedRef.current ? (
            <div>
              <div className="text-center py-8 mb-6">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-gold" />
                <p className="text-muted-foreground">Finding verified {tradeInfo.name}s near {cityName}...</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <BusinessCardSkeleton key={i} />
                ))}
              </div>
            </div>
          ) : (
            <>
              <>
                {businesses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 bg-muted/10 rounded-xl border-2 border-dashed border-border/50 text-center px-6">
                    <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mb-4">
                      <Clock className="w-8 h-8 text-gold" />
                    </div>
                    <h3 className="text-2xl font-display font-semibold mb-2">No listings yet in {cityName}</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-6">
                      We're expanding our network of {tradeInfo.name.toLowerCase()} experts in this area. Be the first verified pro listed here and get all the local calls.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link
                        to="/pricing"
                        className="inline-flex items-center justify-center px-6 py-3 bg-gold hover:bg-gold/90 text-black font-bold rounded-xl text-sm transition-colors"
                      >
                        List Your Business Here →
                      </Link>
                      <Link
                        to="/locations"
                        className="inline-flex items-center justify-center px-6 py-3 border border-border hover:border-primary text-muted-foreground hover:text-primary rounded-xl text-sm transition-colors"
                      >
                        Browse Other Locations
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div id="listings" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
                    {currentBusinesses.map((business, index) => {
                      return (
                        <BusinessCard
                          key={business.id}
                          business={business}
                          rank={startIndex + index + 1}
                        />
                      );
                    })}
                  </div>
                )}

                {totalPages > 1 && (
                  <Pagination className="mb-16">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>

                      {(() => {
                        const maxVisible = 5;
                        let start = Math.max(1, currentPage - 2);
                        let end = start + maxVisible - 1;

                        if (end > totalPages) {
                          end = totalPages;
                          start = Math.max(1, end - maxVisible + 1);
                        }

                        return Array.from({ length: end - start + 1 }, (_, i) => {
                          const pageNum = start + i;
                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                isActive={currentPage === pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className="cursor-pointer"
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        });
                      })()}

                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            </>
          )}
        </section>

        {/* CTA Banner */}
        <section className="container-wide py-6">
          <CTABanner trade={tradeInfo.name} city={cityName} />
        </section>

        <section className="container-wide mb-8">
          <HomeEmergencyAd />
        </section>

        {/* Coverage & Pricing */}
        <section className="container-wide py-16">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card rounded-lg border border-border/50 p-8 hover:border-gold/30 transition-colors">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full border border-gold/30 bg-gold/5 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-gold" />
                </div>
                <h2 className="font-display text-xl tracking-wide text-foreground">Areas We Cover Near {cityName}</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {serviceAreas.map((area, i) => {
                  const areaSlug = area.toLowerCase().replace(/\s+/g, '-');
                  const linkPath = actualCountry === 'US'
                    ? `/us/emergency-${tradeInfo.slug}/${areaSlug}`
                    : `/emergency-${tradeInfo.slug}/${areaSlug}`;

                  return (
                    <Link
                      key={i}
                      to={linkPath}
                      className="px-3 py-1 bg-background rounded-full border border-border text-sm text-muted-foreground hover:bg-gold/10 hover:border-gold/30 hover:text-gold transition-colors"
                    >
                      {area}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="bg-card rounded-lg border border-border/50 p-8 hover:border-gold/30 transition-colors">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full border border-gold/30 bg-gold/5 flex items-center justify-center">
                  {actualCountry === 'US' ? (
                    <DollarSign className="w-6 h-6 text-gold" />
                  ) : (
                    <PoundSterling className="w-6 h-6 text-gold" />
                  )}
                </div>
                <h2 className="font-display text-xl tracking-wide text-foreground">Emergency Rates</h2>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-border/50">
                  <span className="text-muted-foreground">Call Out Fee</span>
                  <span className="font-semibold text-foreground">Included</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-border/50">
                  <span className="text-muted-foreground">Hourly Rate</span>
                  <span className="font-semibold text-foreground">{emergencyPriceRange}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Estimates</span>
                  <span className="font-semibold text-foreground">Free</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container-wide py-16">
          <ReviewsSection
            reviews={realReviews}
            stats={reviewStats}
            businessName={`${tradeInfo.name} in ${cityName}`}
          />
        </section>

        {/* Ad Slot 2: Between Reviews and FAQ */}
        <div className="container-wide py-4">
          <AdSlot slot="7143278448" format="infeed" />
        </div>

        <section className="container-wide py-16">
          <FAQSection
            faqs={faqs}
            trade={tradeInfo.name}
            city={cityName}
          />
        </section>

        {/* Troubleshooting Section */}
        <section className={cn("container-wide py-16", theme === 'dark' && "bg-secondary/10")}>
          <TroubleshootingGuide trade={tradeInfo} city={cityName} />
        </section>

        {/* Professional Acquisition Section */}
        <section className="container-wide pb-24">
          <div className="relative rounded-3xl overflow-hidden bg-[#0A0A0A] border border-white/10 p-8 md:p-16">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-l from-gold/40 to-transparent"></div>
              <img
                src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=2070&auto=format&fit=crop"
                alt="Professional Tradesperson"
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 gold text-sm font-bold uppercase tracking-widest text-gold mb-6">
                Professional Network
              </div>
              <h2 className="text-3xl md:text-5xl font-display text-white mb-6 leading-tight">
                Are you a qualified <span className="text-gold">{tradeInfo.name}</span> in {cityName}?
              </h2>
              <p className="text-white/60 text-lg mb-10 leading-relaxed">
                Join the fastest growing emergency trade network. Receive high-intent leads from customers in your area who need help right now.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="xl" className="bg-gold hover:bg-gold-light text-black font-bold px-8">
                  <Link to="/pricing">Join the Network</Link>
                </Button>
                <div className="flex items-center gap-3 px-6 py-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-stone-800 flex items-center justify-center text-[10px] font-bold text-white">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <div className="text-xs">
                    <div className="flex items-center gap-1 text-gold">
                      <Star className="w-3 h-3 fill-gold" />
                      <span className="font-bold">4.9/5</span>
                    </div>
                    <span className="text-white/40">Partner Rating</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Pages — internal link graph for problem/trade/city cross-linking */}
        {!isStatePage && (
          <section className="container-wide py-16 border-t border-border/30">
            <div className="grid md:grid-cols-3 gap-10">
              {/* Other trades in this city */}
              <div>
                <h2 className="text-lg font-display text-foreground mb-4">Other Emergency Services in {cityName}</h2>
                <ul className="space-y-2">
                  {trades
                    .filter((t) => t.slug !== tradeInfo.slug && t.slug !== 'builder' && t.slug !== 'breakdown')
                    .filter((t) => isUS ? t.slug !== 'gas-engineer' : t.slug !== 'hvac' && t.slug !== 'water-restoration' && t.slug !== 'roofer')
                    .slice(0, 6)
                    .map((t) => (
                      <li key={t.slug}>
                        <Link
                          to={`/emergency-${t.slug}/${citySlug}`}
                          className="text-sm text-muted-foreground hover:text-gold transition-colors flex items-center gap-2"
                        >
                          <div className="w-1 h-1 rounded-full bg-gold/30"></div>
                          Emergency {isUS && t.usName ? t.usName : t.name} in {cityName}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>

              {/* Common problems for this trade in this city */}
              <div>
                <h2 className="text-lg font-display text-foreground mb-4">Common {tradeDisplayName} Emergencies</h2>
                <ul className="space-y-2">
                  {commonProblems
                    .filter((p) => p.trade === tradeInfo.slug)
                    .filter((p) => p.country === 'BOTH' || p.country === actualCountry)
                    .filter((p) => !pageData?.problem || p.slug !== pageData.problem.slug)
                    .slice(0, 6)
                    .map((p) => (
                      <li key={p.slug}>
                        <Link
                          to={`/${p.slug}/${citySlug}`}
                          className="text-sm text-muted-foreground hover:text-gold transition-colors flex items-center gap-2"
                        >
                          <div className="w-1 h-1 rounded-full bg-gold/30"></div>
                          {p.name} in {cityName}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>

              {/* Same trade in other major cities */}
              <div>
                <h2 className="text-lg font-display text-foreground mb-4">Emergency {tradeDisplayName} in Other Cities</h2>
                <ul className="space-y-2">
                  {(isUS
                    ? ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Dallas", "Miami", "Philadelphia"]
                    : ["Leighton Buzzard (Bedfordshire)", "Luton (Bedfordshire)", "Milton Keynes (Buckinghamshire)", "Northampton (Northamptonshire)", "Reading (Berkshire)", "Bedford (Bedfordshire)", "Ashford (Kent)", "Ipswich (Suffolk)"]
                  )
                    .filter((c) => c.toLowerCase() !== cityName.toLowerCase())
                    .slice(0, 6)
                    .map((c) => {
                      const otherCitySlug = c.toLowerCase().replace(/\s+/g, '-');
                      return (
                        <li key={c}>
                          <Link
                            to={`/emergency-${tradeInfo.slug}/${otherCitySlug}`}
                            className="text-sm text-muted-foreground hover:text-gold transition-colors flex items-center gap-2"
                          >
                            <div className="w-1 h-1 rounded-full bg-gold/30"></div>
                            Emergency {tradeDisplayName} in {c}
                          </Link>
                        </li>
                      );
                    })}
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* Cities Directory for State Page */}
        {isStatePage && effectiveState && (
          <section className="container-wide py-16 border-t border-border/30">
            <div className="mb-8">
              <h2 className="text-2xl font-display text-foreground mb-2">Cities we cover in {cityName}</h2>
              <p className="text-muted-foreground text-sm">Select a city to find a local {tradeDisplayName.toLowerCase()} near you.</p>
            </div>
            <div className="grid grid-cols-2 shadow-inner sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-3 gap-x-6">
              {(() => {
                const stateCities = getCitiesForState(effectiveState);
                return stateCities.map((cityName: string) => {
                  const citySlug = cityName.toLowerCase().replace(/\s+/g, '-');
                  return (
                    <Link
                      key={cityName}
                      to={`/emergency-${tradeInfo.slug}/${citySlug}`}
                      className="text-sm text-muted-foreground hover:text-gold transition-colors flex items-center gap-2"
                    >
                      <div className="w-1 h-1 rounded-full bg-gold/30"></div>
                      {cityName}
                    </Link>
                  );
                });
              })()}
            </div>
          </section>
        )}
      </main>

      <Footer countryCode={actualCountry} />

      {/* Floating CTA for Mobile Conversion */}
      <FloatingEmergencyCTA
        business={filteredBusinesses.find(b => b.is_premium) || filteredBusinesses[0]}
        trade={tradeInfo.name}
        city={cityName}
        countryCode={actualCountry}
      />

      <WriteReviewModal
        businessName={`${tradeInfo.name} in ${cityName}`}
        businessId={`generic-${cityName}-${tradeInfo.slug}`}
      />

      {showPhoneModal && (
        <PhoneCaptureModal
          trade={tradeInfo.slug}
          city={cityName}
          country={actualCountry}
          onDismiss={() => setShowPhoneModal(false)}
        />
      )}
    </>
  );
}
