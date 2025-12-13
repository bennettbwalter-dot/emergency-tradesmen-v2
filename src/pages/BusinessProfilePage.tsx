import { useParams, Navigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBusinessById } from "@/lib/businesses";
import { fetchBusinessPhotos } from "@/lib/photoService";
import { generateMockReviews, calculateReviewStats } from "@/lib/reviews";
import { ReviewsSection } from "@/components/ReviewsSection";
import { QuoteRequestModal } from "@/components/QuoteRequestModal";
import { BookingModal } from "@/components/BookingModal";
import { MessageButton } from "@/components/MessageButton";
import { WriteReviewModal } from "@/components/WriteReviewModal";
import {
    Star, MapPin, Phone, Clock, ExternalLink, Shield, CheckCircle,
    Award, ThumbsUp, Calendar, ArrowLeft, Image as ImageIcon
} from "lucide-react";
import { InteractiveMap } from "@/components/InteractiveMap";
import { IframeMap } from "@/components/IframeMap";

import { db } from "@/lib/db";

export default function BusinessProfilePage() {
    const { businessId } = useParams<{ businessId: string }>();
    const [photos, setPhotos] = useState<any[]>([]);
    const [photosLoading, setPhotosLoading] = useState(true);
    const [claimStatus, setClaimStatus] = useState<{ status: string, verified: boolean } | null>(null);

    const data = businessId ? getBusinessById(businessId) : null;

    if (!data) {
        return <Navigate to="/404" replace />;
    }

    const { business, city, trade } = data;

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

    // Mock description and services based on trade
    const description = `
    ${business.name} is a premier ${formattedTrade} service provider in ${formattedCity}, dedicated to delivering top-tier solutions for both residential and commercial clients. 
    With years of experience in the industry, our team of certified professionals ensures that every job is completed to the highest standards of safety and quality.
    
    We pride ourselves on our rapid response times, transparent pricing, and exceptional customer service. Whether you're facing an emergency situation or planning a major installation, 
    we have the expertise and equipment to handle it efficiently. We are fully insured and our work is guaranteed, giving you peace of mind with every project.
  `;

    const services = trade === 'electrician' ? [
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

    const displayImages = photos.length > 0
        ? photos
        : getPlaceholderImages(trade).map((url, index) => ({
            id: `placeholder-${index}`,
            url,
            caption: null,
            isPlaceholder: true
        }));



    return (
        <>
            <Helmet>
                <title>{`${business.name} - ${formattedTrade} in ${formattedCity} | Emergency Tradesmen`}</title>
                <meta name="description" content={`Read reviews and request a quote from ${business.name}, a top-rated ${formattedTrade} in ${formattedCity}. Available 24/7 for emergency services.`} />
            </Helmet>

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
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl bg-gold/5 border-2 border-gold/20 flex items-center justify-center shrink-0">
                                <span className="font-display text-4xl font-bold text-gold">
                                    {business.name.substring(0, 1)}
                                </span>
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

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                    <Button asChild size="lg" variant="hero" className="flex-1 sm:flex-none">
                                        <a href={`tel:${business.phone}`}>
                                            <Phone className="w-4 h-4 mr-2" />
                                            Call {business.phone}
                                        </a>
                                    </Button>
                                    <MessageButton
                                        business={business}
                                        variant="secondary"
                                        className="flex-1 sm:flex-none bg-secondary hover:bg-secondary/80 text-base py-6"
                                    />
                                    <BookingModal
                                        businessName={business.name}
                                        businessId={business.id}
                                        tradeName={formattedTrade}
                                        variant="default"
                                        className="flex-1 sm:flex-none bg-gold hover:bg-gold/90 text-gold-foreground text-base py-6"
                                    />
                                    <QuoteRequestModal
                                        businessName={business.name}
                                        businessId={business.id}
                                        tradeName={formattedTrade}
                                        variant="outline"
                                        className="flex-1 sm:flex-none border-gold/30 hover:bg-gold/5 hover:text-gold text-base py-6"
                                    />
                                    {business.website && (
                                        <Button asChild size="lg" variant="secondary" className="flex-1 sm:flex-none">
                                            <a href={business.website} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="w-4 h-4 mr-2" />
                                                Visit Website
                                            </a>
                                        </Button>
                                    )}
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
                                        <QuoteRequestModal
                                            businessName={business.name}
                                            businessId={business.id}
                                            tradeName={formattedTrade}
                                            className="w-full bg-gold hover:bg-gold/90 text-gold-foreground"
                                        />
                                        <MessageButton
                                            business={business}
                                            variant="outline"
                                            className="w-full"
                                        />
                                    </div>
                                </div>

                                {/* Map View - Only for Premium/Paid Businesses */}
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
                                            <Link to={`/business/claim/${business.id}`}>
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
