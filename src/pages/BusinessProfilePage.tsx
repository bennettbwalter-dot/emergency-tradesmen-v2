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
    Award, ThumbsUp, Calendar, ArrowLeft
} from "lucide-react";
import { InteractiveMap } from "@/components/InteractiveMap";
import { IframeMap } from "@/components/IframeMap";
import type { Business } from "@/lib/businesses";
import { trades } from "@/lib/trades";

import { db } from "@/lib/db";
import { trackEvent } from "@/lib/analytics";
import { ShareMenu } from "@/components/ShareMenu";

export default function BusinessProfilePage() {
    const { businessId } = useParams<{ businessId: string }>();
    const [business, setBusiness] = useState<Business | null>(null);
    const [loading, setLoading] = useState(true);
    const [photos, setPhotos] = useState<any[]>([]);
    const [photosLoading, setPhotosLoading] = useState(true);
    const [claimStatus, setClaimStatus] = useState<{ status: string, verified: boolean } | null>(null);

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

    // Fetch real photos and claim status from database
    useEffect(() => {
        async function loadData() {
            if (businessId) {
                setPhotosLoading(true);
                // Parallel fetch
                const [businessPhotos, statusData] = await Promise.all([
                    fetchBusinessPhotos(businessId),
                    db.businesses.getClaimStatus(businessId)
                ]);

                setPhotos(businessPhotos);
                if (statusData) {
                    setClaimStatus({
                        status: statusData.claim_status || 'unclaimed',
                        verified: statusData.verified || false
                    });
                }
                setPhotosLoading(false);
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
        userId: 'verified-user',
        userName: "Verified Google User",
        userInitials: "G",
        rating: business.rating,
        title: "Verified Review",
        comment: business.featuredReview,
        date: new Date().toISOString(),
        verified: true,
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

    const formattedTrade = trade.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    const formattedCity = city.charAt(0).toUpperCase() + city.slice(1);

    // Use premium description if available, otherwise use generic description
    const description = business.premium_description || `
    ${business.name} is a premier ${formattedTrade} service provider in ${formattedCity}, dedicated to delivering top-tier solutions for both residential and commercial clients. 
    With years of experience in the industry, our team of certified professionals ensures that every job is completed to the highest standards of safety and quality.
    
    We pride ourselves on our rapid response times, transparent pricing, and exceptional customer service. Whether you're facing an emergency situation or planning a major installation, 
    we have the expertise and equipment to handle it efficiently. We are fully insured and our work is guaranteed, giving you peace of mind with every project.
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



    const businessSchema = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": `https://emergencytradesmen.co.uk/business/${business.id}`,
        name: business.name,
        image: photos.length > 0 ? photos[0].url : undefined,
        telephone: business.phone,
        url: business.website || `https://emergencytradesmen.co.uk/business/${business.id}`,
        address: {
            "@type": "PostalAddress",
            addressLocality: city,
            addressCountry: "UK"
        },
        aggregateRating: business.rating ? {
            "@type": "AggregateRating",
            ratingValue: business.rating,
            reviewCount: business.reviewCount
        } : undefined,
        priceRange: "££"
    };

    // Map of trade-specific representative images (trucks/vans/technicians)
    const tradeRepresentativeImages = {
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
        'plumber': '/images/plumber/boiler-fix.png',
        'electrician': '/images/electrician/fusebox-fix.png',
        'locksmith': '/images/locksmith/door-lock-pick.png',
        'gas-engineer': '/images/gas-engineer/boiler-close-up.png',
        'drain-specialist': '/images/drain-specialist/cctv-survey.png',
        'glazier': '/images/glazier/glass-install.png',
        'breakdown': '/images/breakdown-recovery/tow-truck-night.jpg',
        'default': 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=2070&auto=format&fit=crop'
    };

    const heroBgImage = business.header_image_url || ((tradeHeroBgImages as any)[trade] || tradeHeroBgImages.default);

    const representativeImage = business.vehicle_image_url || ((tradeRepresentativeImages as any)[trade] || tradeRepresentativeImages.default);

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-gold/30">
            <SEO
                title={`${business.name} - ${formattedTrade} in ${formattedCity} | Emergency Tradesmen`}
                description={`Read reviews and request a quote from ${business.name}, a top-rated ${formattedTrade} in ${formattedCity}. Available 24/7 for emergency services.`}
                canonical={`/business/${business.id}`}
                jsonLd={businessSchema}
            />

            <Header />

            <main>
                {/* Breadcrumb Navigation - Subtle for dark theme */}
                <div className="bg-[#0A0A0A] pt-6 sm:pt-10">
                    <div className="container-wide">
                        <Link
                            to={`/${trade === 'gas-engineer' ? 'emergency-gas-engineer' : 'emergency-' + trade}/${city}`}
                            className="inline-flex items-center text-xs uppercase tracking-widest text-muted-foreground hover:text-gold transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to {formattedCity} {formattedTrade}s
                        </Link>
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
                            alt="Background"
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
                                            <img src={business.logo_url} alt={business.name} className="w-full h-full object-cover" />
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
                                            <div className="flex items-center gap-1.5 text-gold">
                                                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                                                Verified Business
                                            </div>
                                            <span className="text-muted-foreground/40">•</span>
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <MapPin className="w-4 h-4" />
                                                {business.address || formattedCity}
                                            </div>
                                            <span className="text-muted-foreground/40">•</span>
                                            <div className="text-muted-foreground uppercase tracking-[0.2em] text-[10px] md:text-xs font-bold font-sans">
                                                THE {formattedTrade.toUpperCase()}
                                            </div>
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
                                            alt={`${formattedTrade} service vehicle`}
                                            className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                                        {/* Overlay text on image */}
                                        <div className="absolute bottom-6 left-6 text-left">
                                            <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold mb-1">Local Service</p>
                                            <p className="text-white text-lg font-display italic">24/7 Response Vehicle</p>
                                        </div>
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
                                            {business.name} is a <span className="text-gold font-medium">trusted 24/7 {formattedTrade} service</span> provider in {formattedCity}, dedicated to delivering top-tier residential and commercial solutions through excellence and reliability.
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
                                                <p className="text-lg text-foreground font-medium tracking-tight">Fully <span className="text-foreground">qualified & insured</span></p>
                                            </div>
                                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/50 border border-border">
                                                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold shrink-0">
                                                    <CheckCircle className="w-6 h-6" />
                                                </div>
                                                <p className="text-lg text-foreground font-medium tracking-tight">Local & <span className="text-foreground">Verified</span></p>
                                            </div>
                                        </div>

                                        <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-line pt-4 italic font-light text-lg">
                                            {description}
                                        </div>
                                    </div>
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
                                                <p className="text-sm text-green-600 font-medium">Open 24 hours</p>
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
                                        <Button
                                            asChild
                                            size="lg"
                                            className="w-full bg-[#22C55E] hover:bg-[#1EA34D] text-white font-bold h-16 rounded-xl"
                                        >
                                            <a
                                                href={`https://wa.me/${(business.whatsapp_number || business.phone).replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I need help from ${business.name}.`)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .004 5.412 0 12.049c0 2.123.554 4.197 1.607 6.037L0 24l6.105-1.602a11.834 11.834 0 005.94 1.586h.004c6.637 0 12.048-5.412 12.052-12.049a11.815 11.815 0 00-3.588-8.412z" /></svg>
                                                WhatsApp
                                            </a>
                                        </Button>

                                        {business.website && (
                                            <Button
                                                asChild
                                                size="lg"
                                                className="w-full bg-[#0A0A0A] hover:bg-[#171717] text-white border border-white/10 hover:border-gold/30 font-bold h-16 rounded-xl transition-all duration-300 shadow-lg"
                                                onClick={() => trackEvent("Business", "Website Click", `${business.name} (${business.id})`)}
                                            >
                                                <a
                                                    href={business.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-2"
                                                >
                                                    <ExternalLink className="w-5 h-5 text-gold" />
                                                    Visit Website
                                                </a>
                                            </Button>
                                        )}
                                        <ShareMenu businessName={business.name} city={formattedCity} />
                                    </div>

                                    {/* Trustpilot Sidebar Widget */}
                                    <div className="mt-8 border-t border-border pt-6">
                                        <TrustpilotWidget
                                            templateId="5419b6a8b0d04a076446a9ad"
                                            businessId="676878b2d4b2944b9e1e2c94"
                                            username="emergencytradesmen.net"
                                            styleHeight="24px"
                                        />
                                    </div>
                                </div>

                                {/* Claim Business Button */}
                                {(!business.verified && (!claimStatus || (claimStatus.status === 'unclaimed' && !claimStatus.verified))) && (
                                    <div className="bg-secondary/30 rounded-2xl p-6 border border-gold/10 text-center flex flex-col items-center">
                                        <p className="text-xs text-muted-foreground mb-4 font-bold uppercase tracking-widest">
                                            Is this your business?
                                        </p>
                                        <Button asChild variant="outline" className="w-full border-gold/30 hover:bg-gold/10 hover:text-gold rounded-xl py-6">
                                            <Link
                                                to={`/business/claim/${business.id}`}
                                                onClick={() => trackEvent("Business", "Claim Click", `${business.name} (${business.id})`)}
                                            >
                                                Claim This Business
                                            </Link>
                                        </Button>
                                    </div>
                                )}

                                {/* Map View Container */}
                                <div className="bg-secondary/30 rounded-3xl border border-border p-1 overflow-hidden h-[300px] shadow-2xl">
                                    {(business.tier === 'paid' || business.is_premium) ? (
                                        <InteractiveMap
                                            city={formattedCity}
                                            className="w-full h-full rounded-[20px]"
                                        />
                                    ) : (
                                        <IframeMap
                                            city={formattedCity}
                                            businessName={business.name}
                                            address={business.address}
                                            className="w-full h-full rounded-[20px]"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div >
            </main >

            <Footer />
        </div >
    );
}

