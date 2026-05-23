import { useParams, Navigate, Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import TrustpilotWidget from "@/components/TrustpilotWidget";
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchBusinessById } from "@/lib/businessService";
import { fetchBusinessPhotos } from "@/lib/photoService";
import { generateMockReviews, calculateReviewStats } from "@/lib/reviews";
import { ReviewsSection } from "@/components/ReviewsSection";
import { WriteReviewModal } from "@/components/WriteReviewModal";
import {
    Star, MapPin, Phone, Clock, ExternalLink, Shield, CheckCircle,
    Award, ThumbsUp, Calendar, ShieldCheck, Mail, Facebook, Instagram, Linkedin, Twitter, Video
} from "lucide-react";
import { GlassSocialIcon } from "@/components/ui/GlassSocialIcon";
import { InteractiveMap } from "@/components/InteractiveMap";
import { AdSlot } from "@/components/AdSlot";
import { LeafletMap } from "@/components/LeafletMap";
import { Business, calculateTrustScore, getListingDisplayStatus } from "@/lib/businesses";
import { ListingStatusBadge } from "@/components/ListingStatusBadge";
import { ClaimListingModal } from "@/components/claims/ClaimListingModal";
import { TrustBadgeStack } from "@/components/trust/TrustBadgeStack";
import { trades } from "@/lib/trades";

import { trackEvent } from "@/lib/analytics";
import { ShareMenu } from "@/components/ShareMenu";
import { getPostcodeForCity } from "@/lib/cityPostcodes";
import { getStateForCity } from "@/lib/usCityStates";

export default function BusinessProfilePage() {
    const { businessId } = useParams<{ businessId: string }>();
    const [business, setBusiness] = useState<Business | null>(null);
    const [loading, setLoading] = useState(true);
    const [photos, setPhotos] = useState<any[]>([]);
    const [photosLoading, setPhotosLoading] = useState(true);

    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const port = typeof window !== 'undefined' ? window.location.port : '';
    const isUSDomain = hostname.includes('emergencycontractors.net') || (hostname === 'localhost' && port === '3001') || (hostname === '127.0.0.1' && port === '3001');

    // Fetch business data from database
    useEffect(() => {
        async function loadBusiness() {
            if (!businessId) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const businessData = await fetchBusinessById(businessId);
                setBusiness(businessData);
            } catch (error) {
                console.error("Error loading business:", error);
                setBusiness(null);
            } finally {
                setLoading(false);
            }
        }
        loadBusiness();
    }, [businessId]);

    // Fetch real photos from database
    useEffect(() => {
        async function loadData() {
            if (businessId) {
                setPhotosLoading(true);
                try {
                    const businessPhotos = await fetchBusinessPhotos(businessId);
                    setPhotos(businessPhotos);
                } catch (err) {
                    console.error("Error loading business photos:", err);
                } finally {
                    setPhotosLoading(false);
                }
            }
        }
        loadData();
    }, [businessId]);

    if (loading) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-background flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading business details...</p>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    if (!business) {
        return <Navigate to="/404" replace />;
    }

    // Extract city and trade from business data
    const city = business.city || "your area";
    const rawTrade = (business.trade || "tradesperson").toLowerCase();

    // Find matching trade info, trying both slug and name, and partial matches
    const tradeInfo = trades.find(t =>
        t.slug === rawTrade ||
        t.name.toLowerCase() === rawTrade ||
        rawTrade.includes(t.slug)
    );

    // Use the matched slug if found. If not, check if name contains keywords for a fallback
    // Use the matched slug if found. If not, check if name contains keywords for a fallback
    let trade = tradeInfo?.slug || rawTrade;

    // Robust fallback: if trade is generic or not found, try to detect from business name
    if (trade === 'tradesperson' || !trades.some(t => t.slug === trade)) {
        const nameLc = business.name.toLowerCase();

        // Check for specific trades with potential naming overlaps
        if (nameLc.includes('drain') || nameLc.includes('unblock')) trade = 'drain-specialist';
        else if (nameLc.includes('gas') || nameLc.includes('heat') || nameLc.includes('boiler')) trade = 'gas-engineer';
        else if (nameLc.includes('plumb')) trade = 'plumber';
        else if (nameLc.includes('electric')) trade = 'electrician';
        else if (nameLc.includes('lock') && !nameLc.includes('unblock')) trade = 'locksmith';
        else if (nameLc.includes('glaz') || nameLc.includes('glass') || nameLc.includes('window')) trade = 'glazier';
        else if (nameLc.includes('breakdown') || nameLc.includes('car') || nameLc.includes('tow') || nameLc.includes('recovery')) trade = 'breakdown';
    }

    // Use the real featured review if available
    const realReviews = business.featuredReview ? [{
        id: `review-${business.id}`,
        businessId: business.id,
        userId: 'public-reviewer',
        userName: "Public Reviewer",
        userInitials: "G",
        rating: business.rating,
        title: "Customer Review",
        comment: business.featuredReview,
        date: new Date().toISOString(),
        verified: false,
        helpful: 1,
        notHelpful: 0,
    }] : [];

    const reviewStats = calculateReviewStats(realReviews);

    // If we have a real Google rating/count but only 1 review text, 
    // we should still reflect the aggregate stats in the stats object
    if (business.reviewCount > 0) {
        reviewStats.totalReviews = business.reviewCount;
        reviewStats.averageRating = business.rating;
    }

    // Calculate Trust Score (1-5 Basis) - Summing: Base(1) + Email + Social + Website + Reviews
    const trustScore = calculateTrustScore(business);
    const listingStatus = getListingDisplayStatus(business);
    const isVerifiedListing = listingStatus === 'verified';

    const formattedTrade = trade.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    const formattedCity = city.charAt(0).toUpperCase() + city.slice(1);

    // Use premium description if available, otherwise use generic description
    const description = business.premium_description || `
    ${business.name} appears as a public ${formattedTrade} listing in ${formattedCity}. Business details may need updating, so please confirm service availability, pricing, credentials, and insurance directly before booking.
    
    Are these your business details? Claim this listing to update contact information, service areas, opening hours, and profile details.
  `;

    // Use premium services if available, otherwise use trade-based defaults
    const services = (business.services_offered && business.services_offered.length > 0)
        ? business.services_offered
        : trade === 'electrician' ? [
            "24/7 Emergency Callouts", "Full House Rewiring", "Fuse Board Upgrades", "Lighting Installation", "Electrical Inspections (EICR)", "PAT Testing"
        ] : trade === 'plumber' ? [
            "Burst Pipe Repairs", "Leak Detection", "Boiler Servicing", "Bathroom Installation", "Drain Unblocking", "Central Heating Repairs"
        ] : trade === 'locksmith' ? [
            "Emergency Lockouts", "Lock Replacement", "Security Upgrades", "UPVC Specialist", "Key Cutting", "Burglary Repairs"
        ] : [
            "Emergency Repairs", "Installations", "Maintenance", "Safety Inspections", "Upgrades", "Consultations"
        ];

    // Trade-specific placeholder images for Recent Work section
    const getPlaceholderImages = (tradeName: string) => {
        const placeholders = {
            'electrician': [
                'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop', // Electrical panel
                'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&auto=format&fit=crop', // Wiring work
                'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&auto=format&fit=crop', // Light fixtures
                'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&auto=format&fit=crop', // Electrical tools
            ],
            'plumber': [
                'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&auto=format&fit=crop', // Plumbing pipes
                'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&auto=format&fit=crop', // Bathroom fixtures
                'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop', // Boiler/heating
                'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop', // Kitchen plumbing
            ],
            'locksmith': [
                'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop', // Door locks
                'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&auto=format&fit=crop', // Security system
                'https://images.unsplash.com/photo-1614267119463-8e3e2e57e0a6?w=800&auto=format&fit=crop', // Keys
                'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop', // Door hardware
            ],
            'gas-engineer': [
                'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&auto=format&fit=crop', // Gas meter
                'https://images.unsplash.com/photo-1581092918484-8313e1f7e8d6?w=800&auto=format&fit=crop', // Boiler
                'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&auto=format&fit=crop', // Heating system
                'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&auto=format&fit=crop', // Gas appliance
            ],
            'default': [
                'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop',
            ]
        };

        return placeholders[tradeName as keyof typeof placeholders] || placeholders.default;
    };

    // Use uploaded photos from business.photos if available, otherwise use fetched photos, then placeholders
    const uploadedPhotos = (business.photos && Array.isArray(business.photos) && business.photos.length > 0)
        ? business.photos.map((url, index) => ({
            id: `uploaded-${index}`,
            url: typeof url === 'string' ? url : url.url,
            caption: null,
            isPlaceholder: false
        }))
        : [];

    const displayImages = uploadedPhotos.length > 0
        ? uploadedPhotos
        : photos.length > 0
            ? photos
            : getPlaceholderImages(trade).map((url, index) => ({
                id: `placeholder-${index}`,
                url,
                caption: null,
                isPlaceholder: true
            }));



    // Determine country code from business data or default to GB
    const countryCode = business.country_code || 'GB';
    const isUS = countryCode === 'US';

    // Map of trade-specific representative images (trucks/vans/technicians)
    const tradeRepresentativeImages = {
        'builder': '/images/builder/emergency-builder-female-worker.webp', // Builder representative image
        'roofer': '/images/roofer/emergency-roofer-female-worker.webp', // Roofer representative image
        'water-restoration': '/images/water-restoration/emergency-water-restoration-final-worker.webp', // Water Restoration representative image
        'hvac': '/images/hvac/emergency-hvac-female-worker.webp', // HVAC representative image
        'electrician': '/images/electrician/socket-fix.webp', // Electrician at socket
        'plumber': '/images/plumber/sink-fix.webp', // Plumber under sink
        'locksmith': '/images/locksmith/lock-repair.webp', // Locksmith repairing lock
        'gas-engineer': '/images/gas-engineer/engineer-working.webp', // Gas Engineer working on boiler
        'drain-specialist': '/images/drain-specialist/drain-jetting.webp', // Drainage truck
        'glazier': '/images/glazier/window-board-up.webp', // Glazier boarding window
        'breakdown': '/images/breakdown-recovery/jump-start.webp', // Recovery truck
        'default': 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=800&auto=format&fit=crop'
    };

    // Map of trade-specific background hero images
    const tradeHeroBgImages = {
        'builder': '/images/builder/emergency-builder-hero.webp',
        'roofer': '/images/roofer/emergency-roofer-hero.webp',
        'water-restoration': '/images/water-restoration/emergency-water-restoration-hero.webp',
        'hvac': '/images/hvac/emergency-hvac-hero.webp',
        'plumber': '/images/plumber/boiler-fix.webp',
        'electrician': '/images/electrician/fusebox-fix.webp',
        'locksmith': '/images/locksmith/door-lock-pick.webp',
        'gas-engineer': '/images/gas-engineer/boiler-close-up.webp',
        'drain-specialist': '/images/drain-specialist/cctv-survey.webp',
        'glazier': '/images/glazier/glass-install.webp',
        'breakdown': '/images/breakdown-recovery/tow-truck-night.webp',
        'default': 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=2070&auto=format&fit=crop'
    };

    const heroBgImage = business.header_image_url || ((tradeHeroBgImages as any)[trade] || tradeHeroBgImages.default);

    const representativeImage = business.vehicle_image_url || ((tradeRepresentativeImages as any)[trade] || tradeRepresentativeImages.default);

    const siteDomain = isUSDomain ? 'https://emergencycontractors.net' : 'https://emergencytradesmen.net';

    const businessSchema = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": `${siteDomain}/business/${business.id}`,
        name: business.name,
        image: [
            ...(photos.length > 0 ? [photos[0].url] : []),
            `${siteDomain}${heroBgImage}`,
            `${siteDomain}${representativeImage}`
        ],
        telephone: business.phone,
        url: business.website || `${siteDomain}/business/${business.id}`,
        address: {
            "@type": "PostalAddress",
            streetAddress: business.address?.split(',')[0] || "",
            addressLocality: city,
            addressRegion: isUS ? getStateForCity(city) : "",
            postalCode: business.postalCode || (!isUS ? getPostcodeForCity(city) : ""),
            addressCountry: isUS ? "US" : "GB"
        },
        aggregateRating: business.rating ? {
            "@type": "AggregateRating",
            ratingValue: business.rating,
            reviewCount: business.reviewCount
        } : undefined,
        priceRange: isUS ? "$$" : "££",
        openingHours: business.isOpen24Hours ? "Mo-Su 00:00-24:00" : business.hours,
        openingHoursSpecification: business.isOpen24Hours ? {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
            "opens": "00:00",
            "closes": "23:59"
        } : undefined
    };

    const availabilityAnswer = business.isOpen24Hours
        ? `Yes. ${business.name} operates 24 hours a day, 7 days a week for emergency ${formattedTrade.toLowerCase()} call-outs in ${formattedCity}.`
        : `${business.name} operates during the following hours: ${business.hours || 'please call to confirm availability'}.`;
    const contactAnswer = business.phone
        ? `You can contact ${business.name} directly by phone at ${business.phone}. No forms or sign-up required — simply call to speak with a local ${formattedTrade.toLowerCase()}.`
        : `Visit the profile page to find ${business.name}'s contact details.`;
    const servicesAnswer = services.length > 0
        ? `${business.name} offers ${services.slice(0, 6).join(', ')}${services.length > 6 ? ', and more' : ''} in ${formattedCity} and surrounding areas.`
        : `${business.name} provides emergency ${formattedTrade.toLowerCase()} services in ${formattedCity} and surrounding areas.`;
    const areaAnswer = `${business.name} primarily serves ${formattedCity}${isUS && getStateForCity(city) ? `, ${getStateForCity(city)}` : ''} and nearby areas as an emergency ${formattedTrade.toLowerCase()}.`;
    const reviewsAnswer = business.reviewCount && business.reviewCount > 0
        ? `${business.name} has ${business.reviewCount} customer review${business.reviewCount === 1 ? '' : 's'} with an average rating of ${business.rating}/5.`
        : `Reviews for ${business.name} are collected on the profile page — be the first to share your experience.`;

    const faqItems = [
        { question: `Is ${business.name} available 24/7?`, answer: availabilityAnswer },
        { question: `How do I contact ${business.name}?`, answer: contactAnswer },
        { question: `What services does ${business.name} offer?`, answer: servicesAnswer },
        { question: `What areas does ${business.name} cover?`, answer: areaAnswer },
        { question: `Does ${business.name} have customer reviews?`, answer: reviewsAnswer },
    ];

    const tradePathSlug = trade === 'gas-engineer' ? 'emergency-gas-engineer' : `emergency-${trade}`;
    const citySlug = city.toLowerCase().replace(/\s+/g, '-');
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: siteDomain },
            { "@type": "ListItem", position: 2, name: `Emergency ${formattedTrade}`, item: `${siteDomain}/${tradePathSlug}` },
            { "@type": "ListItem", position: 3, name: formattedCity, item: `${siteDomain}/${tradePathSlug}/${citySlug}` },
            { "@type": "ListItem", position: 4, name: business.name, item: `${siteDomain}/business/${business.id}` },
        ]
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map(item => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer }
        }))
    };

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-gold/30">
            <SEO
                title={`${business.name} — ${formattedTrade} in ${formattedCity} | Public Listing`}
                description={`Need a ${formattedTrade} in ${formattedCity}? ${business.name} appears as a public business listing. Check contact details, confirm availability, or claim this listing to request updates.`}
                canonical={`/business/${business.id}`}
                jsonLd={[businessSchema, faqSchema, breadcrumbSchema]}
                alternates={[
                    { lang: isUSDomain ? 'en-US' : 'en-GB', href: `${siteDomain}/business/${business.id}` },
                    { lang: 'x-default', href: `${siteDomain}/business/${business.id}` },
                ]}
            />

            <Header />

            <main>
                {/* Breadcrumb Navigation - Subtle for dark theme */}
                <div className="bg-[#0A0A0A] pt-6 sm:pt-10">
                    <div className="container-wide">
                        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                            <Link to="/" className="hover:text-gold transition-colors">Home</Link>
                            <span className="text-gold/40">/</span>
                            <Link to={`/${tradePathSlug}`} className="hover:text-gold transition-colors">Emergency {formattedTrade}</Link>
                            <span className="text-gold/40">/</span>
                            <Link to={`/${tradePathSlug}/${citySlug}`} className="hover:text-gold transition-colors">{formattedCity}</Link>
                            <span className="text-gold/40">/</span>
                            <span aria-current="page" className="text-gold truncate max-w-[14rem] normal-case tracking-normal">{business.name}</span>
                        </nav>
                    </div>
                </div>

                {/* Premium Hero Section */}
                <section className="relative min-h-[500px] md:h-[650px] overflow-hidden flex flex-col justify-end pt-10">
                    {/* Background Overlay */}
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm"></div>
                        {/* Moody road background */}
                        <img
                            src={heroBgImage}
                            className="w-full h-full object-cover opacity-30 blur-[2px]"
                            alt={`${business.name} - ${formattedTrade} services in ${formattedCity} background`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
                    </div>

                    <div className="container-wide relative z-10 pb-16">
                        <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-12">
                            {/* Left Content: Business Info */}
                            <div className="w-full lg:max-w-2xl space-y-10 order-2 lg:order-1">
                                <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                                    {/* Logo/Initials Box */}
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-secondary/50 border-2 border-gold/30 flex items-center justify-center shrink-0 overflow-hidden shadow-2xl backdrop-blur-md">
                                        {business.logo_url ? (
                                            <img src={business.logo_url} alt={business.name} loading="lazy" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="font-display text-5xl font-bold text-gold">
                                                {business.name.substring(0, 1)}
                                            </span>
                                        )}
                                    </div>

                                    <div className="text-center md:text-left space-y-4">
                                        <h1 className="font-display text-4xl md:text-6xl text-foreground font-medium tracking-tight leading-tight">
                                            {business.name}
                                        </h1>
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm md:text-base font-medium">
                                            <div className="flex items-center gap-3 group cursor-help">
                                                <div className="relative flex items-center justify-center">
                                                    <div className={`absolute inset-0 rounded-full blur-md transition-colors animate-pulse ${trustScore >= 4 ? 'bg-emerald-500/20 group-hover:bg-emerald-500/40' : 'bg-blue-500/20 group-hover:bg-blue-500/40'}`}></div>
                                                    <div className="relative flex items-center justify-center w-8 h-8">
                                                        <Shield className={`w-8 h-8 relative z-10 ${trustScore >= 4 ? 'text-emerald-500 fill-emerald-500/10' : 'text-blue-500 fill-blue-500/10'}`} strokeWidth={2.5} />
                                                        <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-white">{trustScore}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`font-bold tracking-tight leading-none ${trustScore >= 4 ? 'text-emerald-500' : 'text-blue-500'}`}>
                                                        {trustScore === 5 ? 'TOP RATED' : 'PROFILE SCORE'}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Score {trustScore}/5</span>
                                                </div>
                                            </div>
                                            <span className="text-muted-foreground/40">•</span>
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <MapPin className="w-4 h-4" />
                                                {business.address || formattedCity}
                                            </div>
                                            <span className="text-muted-foreground/40">•</span>
                                            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-muted-foreground uppercase tracking-[0.2em] text-[10px] font-bold font-sans">
                                                <Award className="w-3 h-3 text-gold" />
                                                THE {formattedTrade.toUpperCase()}
                                            </div>
                                        </div>

                                        {/* Accreditation Row */}
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
                                            <ListingStatusBadge business={business} />
                                            <TrustBadgeStack business={business} />
                                            <Badge variant="outline" className="bg-gold/5 text-gold border-gold/30 font-bold uppercase tracking-tighter text-[10px] px-2 py-1">
                                                Details need confirmation
                                            </Badge>
                                        </div>

                                        <div className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                                            {business.phone ? (
                                                <Button
                                                    asChild
                                                    size="lg"
                                                    className="h-14 rounded-lg bg-gold text-black font-black hover:bg-gold-light"
                                                    onClick={() => trackEvent("Business", "Call Now Hero", `${business.name} (${business.id})`)}
                                                >
                                                    <a href={`tel:${business.phone}`} className="flex items-center justify-center gap-2">
                                                        <Phone className="w-5 h-5" />
                                                        Call Now
                                                    </a>
                                                </Button>
                                            ) : (
                                                <Button size="lg" disabled className="h-14 rounded-lg font-black">
                                                    Phone Not Available
                                                </Button>
                                            )}
                                            <ClaimListingModal
                                                business={business}
                                                triggerClassName="h-14 rounded-lg border-white/15 bg-white/5 px-5 text-white hover:bg-white/10"
                                            />
                                        </div>

                                        <div className="mt-4 grid gap-2 rounded-lg border border-white/10 bg-black/25 p-3 text-left text-xs text-white/76 sm:grid-cols-3">
                                            <span className="inline-flex items-center gap-2">
                                                <ShieldCheck className="h-4 w-4 shrink-0 text-gold" />
                                                Confirm call-out fee
                                            </span>
                                            <span className="inline-flex items-center gap-2">
                                                <ShieldCheck className="h-4 w-4 shrink-0 text-gold" />
                                                Ask about credentials
                                            </span>
                                            <span className="inline-flex items-center gap-2">
                                                <ShieldCheck className="h-4 w-4 shrink-0 text-gold" />
                                                Confirm insurance
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Right Content: Trade Image (Representative Truck/Van) */}
                            <div className="w-full lg:w-1/2 lg:max-w-xl order-1 lg:order-2 flex justify-center lg:justify-end">
                                <div className="relative group">
                                    {/* Glass reflection effect */}
                                    <div className="absolute -inset-4 bg-gold/20 rounded-3xl blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-700"></div>
                                    <div className="relative w-[300px] h-[200px] md:w-[500px] md:h-[350px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl rotate-2 group-hover:rotate-0 transition-transform duration-700">
                                        <img
                                            src={representativeImage}
                                            alt={`${formattedTrade} professional vehicle and equipment for ${business.name} in ${formattedCity}`}
                                            className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                    </div>

                                    {/* Flashing Light Effect (Simulating emergency lights) */}
                                    <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-gold/40 rounded-full blur-[80px] animate-pulse pointer-events-none"></div>
                                    <div className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-white/20 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDelay: '1s' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Content Grid */}
                <div className="container-wide py-16 md:py-24">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
                        {/* Left Column - Main Details */}
                        <div className="lg:col-span-2 space-y-20">

                            {/* About Section */}
                            <section className="space-y-12">

                                <div className="space-y-10 pt-8">
                                    <div className="flex items-center gap-4">
                                        <div className="text-5xl">{tradeInfo?.icon || '🔧'}</div>
                                        <h2 className="font-display text-4xl md:text-5xl text-foreground font-medium tracking-tight">About {business.name}</h2>
                                    </div>
                                    <div className="max-w-3xl space-y-8">
                                        <p className="text-xl md:text-2xl text-foreground/90 leading-relaxed font-light">
                                            {business.name} appears as a <span className="text-gold font-medium">public {formattedTrade} listing</span> in {formattedCity}. Please confirm details directly before booking emergency help.
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/50 border border-border">
                                                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold shrink-0">
                                                    <CheckCircle className="w-6 h-6" />
                                                </div>
                                                <p className="text-lg text-foreground font-medium tracking-tight">Rapid <span className="text-gold">emergency response</span></p>
                                            </div>
                                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/50 border border-border">
                                                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold shrink-0">
                                                    <CheckCircle className="w-6 h-6" />
                                                </div>
                                                <p className="text-lg text-foreground font-medium tracking-tight">Details <span className="text-foreground">need confirmation</span></p>
                                            </div>
                                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/50 border border-border">
                                                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold shrink-0">
                                                    <CheckCircle className="w-6 h-6" />
                                                </div>
                                                <p className="text-lg text-foreground font-medium tracking-tight">Public <span className="text-foreground">business listing</span></p>
                                            </div>
                                        </div>

                                        <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-line pt-4 italic font-light text-lg">
                                            {description}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Confidence Check Section */}
                            <section className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-8 md:p-10 space-y-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <Shield className="w-48 h-48 text-emerald-500" />
                                </div>

                                <div className="space-y-4 relative z-10">
                                    <div className="flex items-center gap-3 text-emerald-500">
                                        <ShieldCheck className="w-8 h-8" />
                                        <h2 className="font-display text-3xl md:text-4xl font-medium tracking-tight">Our Confidence Check</h2>
                                    </div>
                                    <p className="text-muted-foreground text-lg max-w-2xl">
                                                    Listings can be claimed and reviewed through our admin process. Until a listing status clearly says otherwise, confirm details, credentials, insurance, and pricing directly with the business.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 relative z-10">
                                    {[
                                        isVerifiedListing ? "Verification status confirmed" : "Public listing status",
                                        "Business details may need updating",
                                        "Claim this listing to request changes",
                                        "Confirm credentials directly",
                                        "Confirm insurance directly",
                                        "Request correction or removal"
                                    ].map((check, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                            </div>
                                            <span className="text-foreground/90 font-medium">{check}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4 border-t border-emerald-500/10 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                                    <p className="text-emerald-500/80 text-sm font-medium italic">
                                        "Public listings should be checked, corrected, claimed, or removed on request."
                                    </p>
                                    <Button asChild variant="outline" className="border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10">
                                        <Link to="/vetting-process">
                                            Learn About Claim Checks
                                        </Link>
                                    </Button>
                                </div>
                            </section>

                            {/* Services Offered */}
                            <section className="space-y-10">
                                <h2 className="font-display text-4xl text-foreground font-medium tracking-tight">Services Offered</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {services.map((service, index) => (
                                        <div
                                            key={index}
                                            className="group flex items-center gap-4 p-5 bg-secondary/30 hover:bg-secondary/50 border border-border hover:border-gold/20 rounded-xl transition-all duration-300"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-background/50 flex items-center justify-center text-muted-foreground group-hover:text-gold transition-colors">
                                                {trade === 'electrician' ? <Shield className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                                            </div>
                                            <span className="text-lg font-medium text-foreground/90">{service}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Recent Work Gallery */}
                            <section className="space-y-10">
                                <h2 className="font-display text-4xl text-foreground font-medium tracking-tight">Recent Work</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    {((business.tier === 'paid' || business.is_premium) && !photosLoading) ? (
                                        displayImages.slice(0, 3).map((photo, i) => (
                                            <div key={photo.id || i} className="group space-y-4">
                                                <div className="aspect-[4/5] md:aspect-[4/5] rounded-xl overflow-hidden bg-secondary/50 relative shadow-lg">
                                                    <img
                                                        src={photo.url}
                                                        alt={photo.caption || `${formattedTrade} work example`}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                        loading="lazy"
                                                    />
                                                </div>
                                                <p className="text-gold font-medium text-sm md:text-base px-2">
                                                    {photo.caption || `${formattedTrade} Services`}
                                                </p>
                                            </div>
                                        ))
                                    ) : photosLoading ? (
                                        [1, 2, 3].map((i) => (
                                            <div key={i} className="aspect-[4/3] rounded-xl bg-white/5 animate-pulse" />
                                        ))
                                    ) : null}
                                </div>
                            </section>

                            {/* Customer Reviews - Integrated into the dark theme */}
                            <section id="reviews" className="space-y-10 pt-10 border-t border-border">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                    <h2 className="font-display text-4xl text-foreground font-medium">Customer Reviews</h2>
                                    <WriteReviewModal
                                        businessName={business.name}
                                        businessId={business.id}
                                    />
                                </div>
                                <div className="bg-secondary/30 p-6 md:p-10 rounded-3xl border border-border">
                                    <ReviewsSection
                                        reviews={realReviews}
                                        stats={reviewStats}
                                        businessName={business.name}
                                    />
                                </div>
                            </section>
                        </div>


                        {/* Right Column - Premium Sticky Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-8">
                                {/* Contact Card */}
                                <div className="bg-card rounded-3xl border border-border p-8 shadow-2xl relative overflow-hidden group">
                                    {/* Subtle Ambient Glow */}
                                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-gold/5 rounded-full blur-3xl group-hover:bg-gold/10 transition-colors duration-500"></div>

                                    <h3 className="font-display text-2xl font-semibold mb-8 border-b border-border pb-4">Contact Details</h3>

                                    <div className="space-y-8 mb-10">
                                        <div className="flex items-start gap-5">
                                            <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0 border border-gold/20 shadow-lg shadow-gold/5">
                                                <Phone className="w-5 h-5 text-gold" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 font-bold">Phone Number</p>
                                                <a href={`tel:${business.phone}`} className="text-lg font-medium text-foreground hover:text-gold transition-colors">
                                                    {business.phone || "Not available"}
                                                </a>
                                            </div>
                                        </div>

                                        {business.email && (
                                            <div className="flex items-start gap-5">
                                                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0 border border-gold/20 shadow-lg shadow-gold/5">
                                                    <Mail className="w-5 h-5 text-gold" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 font-bold">Email Address</p>
                                                    <a href={`mailto:${business.email}`} className="text-lg font-medium text-foreground hover:text-gold transition-colors break-all">
                                                        {business.email}
                                                    </a>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-start gap-5">
                                            <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0 border border-gold/20 shadow-lg shadow-gold/5">
                                                <MapPin className="w-5 h-5 text-gold" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 font-bold">Service Area</p>
                                                <p className="text-lg font-medium text-foreground">{formattedCity} & Surrounding Areas</p>
                                                {business.address && (
                                                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{business.address}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-5">
                                            <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0 border border-gold/20 shadow-lg shadow-gold/5">
                                                <Clock className="w-5 h-5 text-gold" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 font-bold">Opening Hours</p>
                                                <p className="text-lg font-medium text-green-500">
                                                    {business.isOpen24Hours ? "Open 24 hours" : business.hours}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <Button
                                            asChild
                                            size="lg"
                                            className="w-full bg-gold hover:bg-gold-light text-black font-bold h-16 rounded-xl shadow-lg shadow-gold/10"
                                            onClick={() => trackEvent("Business", "Call Now Sidebar", `${business.name} (${business.id})`)}
                                        >
                                            <a href={`tel:${business.phone}`} className="flex items-center justify-center gap-2">
                                                <Phone className="w-5 h-5" />
                                                Call Now
                                            </a>
                                        </Button>

                                        {(() => {
                                            const domainName = typeof window !== "undefined" ? window.location.hostname : "emergencytradesmen.net";
                                            const tradeLabel = business.trade || "contractor";
                                            const cityLabel = formattedCity || business.city || "my area";
                                            const waText = `Hi ${business.name}, I found your profile on ${domainName} and need an emergency ${tradeLabel.toLowerCase()} in ${cityLabel}. Are you available?`;
                                            const waHref = `https://wa.me/${(business.whatsapp_number || business.phone || "").replace(/\D/g, '')}?text=${encodeURIComponent(waText)}`;

                                            return (
                                                <Button
                                                    asChild
                                                    size="lg"
                                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-16 rounded-xl shadow-lg shadow-emerald-600/10"
                                                    onClick={() => trackEvent("Business", "WhatsApp Click Sidebar", `${business.name} (${business.id})`)}
                                                >
                                                    <a href={waHref} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                                                        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black shrink-0">W</div>
                                                        Chat on WhatsApp
                                                    </a>
                                                </Button>
                                            );
                                        })()}

                                        {business.website && (
                                            <Button
                                                asChild
                                                variant="outline"
                                                size="lg"
                                                className="w-full h-16 rounded-xl border-border bg-transparent text-foreground hover:bg-secondary"
                                                onClick={() => trackEvent("Business", "Website Click", `${business.name} (${business.id})`)}
                                            >
                                                <a
                                                    href={business.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-2"
                                                >
                                                    <ExternalLink className="w-5 h-5 text-gold" strokeWidth={2} />
                                                    Visit Website
                                                </a>
                                            </Button>
                                        )}
                                        <ShareMenu businessName={business.name} city={formattedCity} />
                                        <ClaimListingModal
                                            business={business}
                                            triggerClassName="w-full h-12 rounded-xl border-border/70 bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground"
                                        />
                                    </div>
                                </div>

                                    {/* === SOCIAL MEDIA BAR (Obsidian Gold Style) === */}
                                    <div className="bg-card rounded-3xl border border-border p-6 shadow-2xl relative overflow-hidden group">
                                        <h3 className="font-display text-lg font-semibold mb-4 border-b border-border pb-2">Connect on Social</h3>
                                        <div className="flex justify-center gap-4 py-2">
                                            {business.social_links?.facebook && (
                                                <GlassSocialIcon platform="facebook" href={business.social_links.facebook} />
                                            )}
                                            {business.social_links?.instagram && (
                                                <GlassSocialIcon platform="instagram" href={business.social_links.instagram} />
                                            )}
                                            {business.social_links?.twitter && (
                                                <GlassSocialIcon platform="twitter" href={business.social_links.twitter} />
                                            )}
                                            {business.social_links?.linkedin && (
                                                <GlassSocialIcon platform="linkedin" href={business.social_links.linkedin} />
                                            )}
                                            {business.social_links?.tiktok && (
                                                <GlassSocialIcon platform="tiktok" href={business.social_links.tiktok} />
                                            )}
                                        </div>
                                    </div>

                                {/* Map View Container */}
                                <div className="bg-secondary/30 rounded-3xl border border-border p-1 overflow-hidden h-[300px] shadow-2xl">
                                    {(business.tier === 'paid' || business.is_premium) ? (
                                        <InteractiveMap
                                            city={formattedCity}
                                            latitude={business.latitude}
                                            longitude={business.longitude}
                                            className="w-full h-full rounded-[20px]"
                                        />
                                    ) : (
                                        <LeafletMap
                                            city={formattedCity}
                                            businessName={business.name}
                                            address={business.address}
                                            latitude={business.latitude}
                                            longitude={business.longitude}
                                            className="w-full h-full rounded-[20px]"
                                        />
                                    )}
                                </div>

                                {/* Ad Slot: Below map in sidebar */}
                                <AdSlot slot="7143278448" format="infeed" />
                            </div>
                        </div>
                    </div>
                </div >

                {/* FAQ Section — direct-answer content + FAQPage schema for AI Overviews */}
                <section className="container-wide py-16" aria-labelledby="business-faq-heading">
                    <div className="max-w-3xl mx-auto">
                        <h2 id="business-faq-heading" className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6 text-center">
                            Frequently Asked Questions
                        </h2>
                        <div className="space-y-3">
                            {faqItems.map((item, idx) => (
                                <details key={idx} className="group bg-card/40 border border-border/40 rounded-lg p-5 open:bg-card/60 open:border-gold/30 transition-colors">
                                    <summary className="cursor-pointer font-semibold text-foreground list-none flex items-start justify-between gap-4">
                                        <span>{item.question}</span>
                                        <span className="text-gold text-xl leading-none mt-0.5 group-open:rotate-45 transition-transform">+</span>
                                    </summary>
                                    <p className="mt-3 text-muted-foreground leading-relaxed">{item.answer}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>
            </main >

            <Footer />
        </div >
    );
}

