import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Business } from "@/lib/businesses";
import { Star, MapPin, Phone, Clock, ExternalLink, MessageSquareQuote, Heart, TrendingUp, ShieldCheck, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { isBusinessCurrentlyOpen } from "@/lib/businessHours";
import { QuoteRequestModal } from "./QuoteRequestModal";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/db"; // Use our new DB layer
import { useToast } from "@/hooks/use-toast";
import { AuthModal } from "@/components/AuthModal";
import { useComparison } from "@/contexts/ComparisonContext";
import { motion } from "framer-motion";

interface BusinessCardProps {
    business: Business;
    rank: number;
    tradeName?: string;
    cityName?: string;
}

export function BusinessCard({ business, rank, tradeName = "Tradesperson", cityName = "London" }: BusinessCardProps) {
    const { isAuthenticated } = useAuth();
    const [liked, setLiked] = useState(false);
    const { addToComparison, removeFromComparison, isInComparison } = useComparison();
    const { toast } = useToast();
    const navigate = useNavigate();

    const inComparison = isInComparison(business.id);
    const [isLoadingFav, setIsLoadingFav] = useState(false); // Track loading state



    useEffect(() => {
        // Check if favorite on mount (if logged in)
        if (isAuthenticated) {
            db.favorites.isFavorite(business.id).then(isFav => setLiked(isFav));
        }
    }, [business.id, isAuthenticated]);

    const handleFavorite = async () => {
        if (!isAuthenticated) return; // Should be handled by UI, but safety check
        setIsLoadingFav(true);

        try {
            if (liked) {
                await db.favorites.remove(business.id);
                setLiked(false);
                toast({
                    title: "Removed from favorites",
                    description: `${business.name} has been removed from your saved list.`,
                });
            } else {
                await db.favorites.add({
                    id: business.id,
                    name: business.name,
                    trade: tradeName,
                    city: cityName,
                });
                setLiked(true);
                toast({
                    title: "Added to favorites",
                    description: `${business.name} has been saved to your list.`,
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to update favorites. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsLoadingFav(false);
        }
    };

    const handleCompare = () => {
        if (inComparison) {
            removeFromComparison(business.id);
            toast({
                title: "Removed from comparison",
                description: `${business.name} has been removed from price comparison.`,
            });
        } else {
            const added = addToComparison(business.id);
            if (added) {
                toast({
                    title: "Added to comparison",
                    description: `${business.name} added. Click "View Comparison" to compare prices.`,
                    action: (
                        <Button size="sm" variant="outline" onClick={() => navigate('/compare')}>
                            View
                        </Button>
                    ),
                });
            } else {
                toast({
                    title: "Comparison full",
                    description: "You can compare up to 4 businesses. Remove one to add another.",
                    variant: "destructive",
                });
            }
        }
    };

    const isAvailable = isBusinessCurrentlyOpen(business.hours, business.isOpen24Hours);

    // Check real-time availability (Live Ping)
    const lastPing = business.last_available_ping ? new Date(business.last_available_ping) : null;
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const isLive = lastPing && lastPing > oneHourAgo;

    const showAvailable = isLive || isAvailable; // Real-time ping overrides hours? Or just adds to it. 
    // Let's say if isLive is true, they are DEFINITELY available.

    const isPaid = business.is_premium || business.tier === 'paid' || (business.priority_score && business.priority_score > 0);

    return (
        <motion.div
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`group relative bg-card rounded-lg border hover:shadow-2xl hover:shadow-gold/10 transition-all duration-300 overflow-hidden aspect-[4/5] flex flex-col ${isPaid
                ? "border-gold/50 shadow-lg shadow-gold/5 bg-gradient-to-br from-card to-gold/5"
                : "border-border/50 hover:border-gold/30"
                }`}
        >
            {/* Rank badge / Featured Badge */}
            <div className={`absolute top-4 left-4 z-10 rounded-full flex items-center justify-center ${isPaid
                ? "px-3 h-7 bg-gold text-black font-bold text-xs uppercase tracking-wide shadow-md"
                : "w-10 h-10 bg-gold/10 border border-gold/30 font-display text-gold font-bold"
                }`}>
                {isPaid ? (
                    <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 fill-black" />
                        Featured
                    </span>
                ) : (
                    <span>{rank}</span>
                )}
            </div>

            {/* Favorite Button */}
            <div className="absolute top-4 right-4 z-10">
                {isAuthenticated ? (
                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={isLoadingFav}
                        className={`rounded-full hover:bg-gold/10 ${liked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-gold'}`}
                        onClick={handleFavorite}
                    >
                        <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''} ${isLoadingFav ? 'animate-pulse' : ''}`} />
                    </Button>
                ) : (
                    <AuthModal
                        trigger={
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full text-muted-foreground hover:text-gold hover:bg-gold/10"
                            >
                                <Heart className="w-5 h-5" />
                            </Button>
                        }
                        defaultTab="register"
                    />
                )}
            </div>

            <div className="p-6 pt-16 flex-1 flex flex-col">
                {/* Business name */}
                <h3 className="font-display text-xl tracking-wide text-foreground mb-3 pr-4">
                    <Link to={`/business/${business.id}`} className="hover:text-gold transition-colors">
                        {business.name}
                    </Link>
                </h3>

                {/* Rating section */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-gold text-gold" />
                        <span className="font-semibold text-foreground">{business.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                        ({business.reviewCount} {business.reviewCount === 1 ? 'review' : 'reviews'})
                    </span>
                    {showAvailable ? (
                        <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium uppercase tracking-wider bg-green-500/10 text-green-500 rounded-full border border-green-500/30">
                            <span className="relative flex h-2 w-2">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75 ${isLive ? 'duration-75' : ''}`}></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            {isLive ? "Live Now" : "Available Now"}
                        </span>
                    ) : (
                        <span className="ml-auto px-3 py-1 text-xs font-medium uppercase tracking-wider bg-red-500/10 text-red-500 rounded-full border border-red-500/30">
                            Closed
                        </span>
                    )}
                </div>

                {/* Business details */}
                <div className="space-y-2.5 mb-5 text-sm">
                    {business.address && (
                        <div className="flex items-start gap-2.5 text-muted-foreground">
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gold/70" />
                            <span>{business.address}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                        <Clock className="w-4 h-4 flex-shrink-0 text-gold/70" />
                        <span>{business.hours}</span>
                    </div>
                    {business.rating >= 4.8 && (
                        <div className="flex items-center gap-2.5 text-gold">
                            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                            <span>Smart Price Guarantee</span>
                        </div>
                    )}
                </div>

                {/* Featured review */}
                {business.featuredReview && (
                    <div className="mb-5 p-4 bg-secondary/30 rounded-lg border border-border/30">
                        <div className="flex gap-2 items-start">
                            <MessageSquareQuote className="w-4 h-4 text-gold/70 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-muted-foreground italic">
                                "{business.featuredReview}"
                            </p>
                        </div>
                    </div>
                )}

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-2 mb-3 mt-auto">
                    {business.phone ? (
                        <Button
                            asChild
                            variant="hero"
                            className={isPaid && business.whatsapp_number ? "" : "col-span-2"}
                        >
                            <a href={`tel:${business.phone}`} className="flex items-center justify-center gap-2">
                                <Phone className="w-4 h-4" />
                                Call Now
                            </a>
                        </Button>
                    ) : (
                        <Button
                            variant="secondary"
                            className={`cursor-not-allowed opacity-50 ${isPaid && business.whatsapp_number ? "" : "col-span-2"}`}
                            disabled
                        >
                            <span className="flex items-center justify-center gap-2">
                                <Phone className="w-4 h-4" />
                                No Phone
                            </span>
                        </Button>
                    )}

                    {/* WhatsApp Button - Premium Only */}
                    {isPaid && business.whatsapp_number && (
                        <Button
                            asChild
                            className="bg-green-500 hover:bg-green-600 text-white"
                        >
                            <a
                                href={`https://wa.me/${business.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I found ${business.name} on Emergency Tradesmen and would like to enquire about your services.`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                WhatsApp
                            </a>
                        </Button>
                    )}

                    <QuoteRequestModal
                        businessName={business.name}
                        businessId={business.id}
                        tradeName={tradeName}
                        variant="outline"
                        className="border-gold/30 hover:bg-gold/5 hover:text-gold"
                    />

                    <Button
                        variant="outline"
                        onClick={handleCompare}
                        className={`border-gold/30 hover:bg-gold/5 hover:text-gold ${inComparison ? 'bg-gold/10 border-gold' : ''}`}
                    >
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {inComparison ? 'In Comparison' : 'Compare'}
                    </Button>

                    {business.website && (
                        <Button
                            asChild
                            variant="outline"
                            className="border-gold/30 hover:bg-gold/5 hover:text-gold"
                        >
                            <a
                                href={business.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Website
                            </a>
                        </Button>
                    )}
                </div>

                {/* Phone number display */}
                {business.phone && (
                    <div className="mt-4 pt-4 border-t border-border/30">
                        <a
                            href={`tel:${business.phone}`}
                            className="text-sm text-muted-foreground hover:text-gold transition-colors flex items-center gap-2"
                        >
                            <Phone className="w-3.5 h-3.5" />
                            {business.phone}
                        </a>
                    </div>
                )}
            </div>

            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-gold/0 via-gold/0 to-gold/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </motion.div>
    );
}
