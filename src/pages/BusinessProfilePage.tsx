import { useParams, Navigate, Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
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

import { db } from "@/lib/db";
import { trackEvent } from "@/lib/analytics";

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
    const trade = business.trade || "tradesperson";

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

    return (
        <>
            <SEO
                title={`${business.name} - ${formattedTrade} in ${formattedCity} | Emergency Tradesmen`}
                description={`Read reviews and request a quote from ${business.name}, a top-rated ${formattedTrade} in ${formattedCity}. Available 24/7 for emergency services.`}
                canonical={`/business/${business.id}`}
                jsonLd={businessSchema}
            />

            <Header />

            <main className="min-h-screen bg-background pb-20">
                {/* Breadcrumb / Back Navigation */}
                <div className="bg-secondary/30 border-b border-border/50 py-4">
                    <div className="container-wide">
                        <Link
                            to={`/${trade === 'gas-engineer' ? 'emergency-gas-engineer' : 'emergency-' + trade}/${city}`}
                            className="inline-flex items-center text-sm text-muted-foreground hover:text-gold transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to {formattedCity} {formattedTrade}s
                        </Link>
                    </div>
                </div>

                {/* Hero Profile Header */}
                <div className="bg-card border-b border-border/50">
                    <div className="container-wide py-10">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            {/* Profile Image / Logo */}
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl bg-gold/5 border-2 border-gold/20 flex items-center justify-center shrink-0 overflow-hidden">
                                {business.logo_url ? (
                                    <img src={business.logo_url} alt={business.name} className="w-full h-full object-contain p-2" />
                                ) : (
                                    <span className="font-display text-4xl font-bold text-gold">
                                        {business.name.substring(0, 1)}
                                    </span>
                                )}
                            </div>

                            {/* Business Info */}
                            <div className="flex-1 space-y-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                                            {business.name}
                                        </h1>
                                        <div className="flex flex-wrap items-center gap-4 text-sm">
                                            <div className="flex items-center gap-1.5 text-gold font-medium">
                                                <Star className="w-5 h-5 fill-current" />
                                                <span className="text-lg">{business.rating.toFixed(1)}</span>
                                                <span className="text-muted-foreground ml-1">({business.reviewCount} reviews)</span>
                                            </div>
                                            <span className="text-muted-foreground hidden md:inline">•</span>
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <MapPin className="w-4 h-4" />
                                                {business.address || formattedCity}
                                            </div>
                                            <span className="text-muted-foreground hidden md:inline">•</span>
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <Clock className="w-4 h-4" />
                                                {business.hours}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Verification Badges */}
                                    <div className="flex gap-2">
                                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 py-1.5">
                                            <Shield className="w-3.5 h-3.5 mr-1.5" />
                                            Verified
                                        </Badge>
                                        {business.isOpen24Hours && (
                                            <Badge variant="outline" className="bg-gold/10 text-gold border-gold/30 py-1.5">
                                                <Clock className="w-3.5 h-3.5 mr-1.5" />
                                                24/7 Available
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons - Emergency Hierarchy */}
                                <div className="space-y-3 pt-2">
                                    {/* Emergency Notice */}
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
                                        <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                                            ⚡ Need emergency help? Call immediately for fastest response
                                        </p>
                                    </div>

                                    {/* PRIMARY: Phone Call */}
                                    <Button
                                        asChild
                                        size="lg"
                                        variant="hero"
                                        className="w-full bg-gradient-to-r from-gold to-yellow-500 hover:from-yellow-400 hover:to-gold text-black font-bold text-lg py-7"
                                        onClick={() => trackEvent("Business", "Call Now", `${business.name} (${business.id})`)}
                                    >
                                        <a href={`tel:${business.phone}`} className="flex items-center justify-center gap-2">
                                            <Phone className="w-5 h-5" />
                                            📞 CALL NOW: {business.phone}
                                        </a>
                                    </Button>

                                    {/* SECONDARY: WhatsApp */}
                                    <Button
                                        asChild
                                        size="lg"
                                        className="w-full bg-green-500 hover:bg-green-600 text-white text-base py-6"
                                        onClick={() => trackEvent("Business", "WhatsApp Click", `${business.name} (${business.id})`)}
                                    >
                                        <a
                                            href={`https://wa.me/${(business.whatsapp_number || business.phone).replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I need help from ${business.name}. I found you on Emergency Tradesmen.`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2"
                                        >
                                            💬 WhatsApp Now
                                        </a>
                                    </Button>

                                    {/* TERTIARY: Other options */}
                                    <div className="grid grid-cols-1 gap-2 pt-2">
                                        {business.website && (
                                            <Button asChild variant="outline" className="border-border/30 hover:bg-secondary/50 text-muted-foreground text-sm">
                                                <a href={business.website} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="w-3 h-3 mr-2" />
                                                    Website
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="container-wide py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Left Column - Details */}
                        <div className="lg:col-span-2 space-y-10">

                            {/* About Section */}
                            <section className="animate-fade-up">
                                <h2 className="font-display text-2xl font-semibold mb-4">About {business.name}</h2>
                                <div className="prose prose-neutral max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
                                    {description}
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                                    <div className="bg-secondary/30 p-4 rounded-lg text-center border border-border/50">
                                        <Award className="w-6 h-6 mx-auto mb-2 text-gold" />
                                        <p className="font-medium text-foreground">10+ Years</p>
                                        <p className="text-xs text-muted-foreground">Experience</p>
                                    </div>
                                    <div className="bg-secondary/30 p-4 rounded-lg text-center border border-border/50">
                                        <CheckCircle className="w-6 h-6 mx-auto mb-2 text-gold" />
                                        <p className="font-medium text-foreground">Fully</p>
                                        <p className="text-xs text-muted-foreground">Insured</p>
                                    </div>
                                    <div className="bg-secondary/30 p-4 rounded-lg text-center border border-border/50">
                                        <ThumbsUp className="w-6 h-6 mx-auto mb-2 text-gold" />
                                        <p className="font-medium text-foreground">98%</p>
                                        <p className="text-xs text-muted-foreground">Satisfaction</p>
                                    </div>
                                    <div className="bg-secondary/30 p-4 rounded-lg text-center border border-border/50">
                                        <Calendar className="w-6 h-6 mx-auto mb-2 text-gold" />
                                        <p className="font-medium text-foreground">On Time</p>
                                        <p className="text-xs text-muted-foreground">Guarantee</p>
                                    </div>
                                </div>
                            </section>

                            {/* Services Section */}
                            <section className="animate-fade-up">
                                <h2 className="font-display text-2xl font-semibold mb-6">Services Offered</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {services.map((service, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border/50">
                                            <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold shrink-0">
                                                <CheckCircle className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium">{service}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Gallery Section - Real Photos or Trade-Specific Placeholders */}
                            <section className="animate-fade-up">
                                <h2 className="font-display text-2xl font-semibold mb-6">Recent Work</h2>
                                {photosLoading ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="aspect-video rounded-xl bg-secondary animate-pulse" />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        {displayImages.map((photo, i) => (
                                            <div key={photo.id || i} className="aspect-video rounded-xl overflow-hidden bg-secondary relative group">
                                                <img
                                                    src={photo.url}
                                                    alt={photo.caption || `${formattedTrade} work example ${i + 1}`}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    loading="lazy"
                                                />
                                                {photo.caption && !photo.isPlaceholder && (
                                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                                                        <p className="text-white text-sm">{photo.caption}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>


                            {/* Reviews Section Integration */}
                            <section id="reviews" className="animate-fade-up pt-8 border-t border-border/30">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="font-display text-2xl font-semibold">Customer Reviews</h2>
                                    <WriteReviewModal
                                        businessName={business.name}
                                        businessId={business.id}
                                    />
                                </div>
                                <ReviewsSection
                                    reviews={realReviews}
                                    stats={reviewStats}
                                    businessName={business.name}
                                />
                            </section>
                        </div>

                        {/* Right Column - Sticky Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-6">
                                {/* Contact Card */}
                                <div className="bg-card rounded-xl border border-border/50 p-6 shadow-lg shadow-black/5">
                                    <h3 className="font-display text-xl font-semibold mb-6">Contact Details</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                                <Phone className="w-5 h-5 text-gold" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1">Phone Number</p>
                                                <a href={`tel:${business.phone}`} className="font-medium hover:text-gold transition-colors block">
                                                    {business.phone || "Not available"}
                                                </a>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                                <MapPin className="w-5 h-5 text-gold" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1">Service Area</p>
                                                <p className="font-medium">{formattedCity} & Surrounding Areas</p>
                                                {business.address && (
                                                    <p className="text-sm text-muted-foreground mt-1">{business.address}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                                <Clock className="w-5 h-5 text-gold" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1">Opening Hours</p>
                                                <p className={`font-medium ${business.isOpen24Hours ? 'text-green-600' : ''}`}>
                                                    {business.hours}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-border/30 space-y-3">
                                        <Button
                                            asChild
                                            size="lg"
                                            className="w-full bg-gradient-to-r from-gold to-yellow-500 hover:from-yellow-400 hover:to-gold text-black font-bold"
                                            onClick={() => trackEvent("Business", "Call Now Sidebar", `${business.name} (${business.id})`)}
                                        >
                                            <a href={`tel:${business.phone}`} className="flex items-center justify-center gap-2">
                                                <Phone className="w-5 h-5" />
                                                📞 Call Now
                                            </a>
                                        </Button>
                                        <Button
                                            asChild
                                            className="w-full bg-green-500 hover:bg-green-600 text-white"
                                        >
                                            <a
                                                href={`https://wa.me/${(business.whatsapp_number || business.phone).replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I need help from ${business.name}.`)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                💬 WhatsApp
                                            </a>
                                        </Button>
                                    </div>
                                </div>

                                {/* Map View - For All Businesses */}
                                {(business.tier === 'paid' || business.is_premium) ? (
                                    <div className="bg-card rounded-xl border border-border/50 p-1 overflow-hidden h-64 relative">
                                        <InteractiveMap
                                            city={formattedCity}
                                            className="w-full h-full rounded-lg"
                                        />
                                    </div>
                                ) : (
                                    <div className="bg-card rounded-xl border border-border/50 p-1 overflow-hidden h-64 relative">
                                        <IframeMap
                                            city={formattedCity}
                                            businessName={business.name}
                                            address={business.address}
                                            className="w-full h-full rounded-lg"
                                        />
                                    </div>
                                )}

                                {/* Claim Business Button */}
                                {(!business.verified && (!claimStatus || (claimStatus.status === 'unclaimed' && !claimStatus.verified))) && (
                                    <div className="bg-secondary/30 rounded-xl p-4 border border-border/50 text-center">
                                        <p className="text-sm text-muted-foreground mb-3">
                                            Is this your business?
                                        </p>
                                        <Button asChild variant="outline" className="w-full border-gold/30 hover:bg-gold/10 hover:text-gold">
                                            <Link
                                                to={`/business/claim/${business.id}`}
                                                onClick={() => trackEvent("Business", "Claim Click", `${business.name} (${business.id})`)}
                                            >
                                                Claim This Business
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}

