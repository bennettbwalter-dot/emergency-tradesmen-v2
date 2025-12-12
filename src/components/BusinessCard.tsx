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

    // Calculate if business is currently available
    const isAvailable = isBusinessCurrentlyOpen(business.hours, business.isOpen24Hours);

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

    return (
        <motion.div
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="group relative bg-card rounded-lg border border-border/50 hover:border-gold/30 hover:shadow-2xl hover:shadow-gold/10 transition-all duration-300 overflow-hidden aspect-[4/5] flex flex-col"
        >
            {/* Rank badge */}
            <div className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
                <span className="font-display text-gold font-bold">{rank}</span>
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
                    {isAvailable ? (
                        <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium uppercase tracking-wider bg-green-500/10 text-green-500 rounded-full border border-green-500/30">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Available Now
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
                            className="col-span-2"
                        >
                            <a href={`tel:${business.phone}`} className="flex items-center justify-center gap-2">
                                <Phone className="w-4 h-4" />
                                Call Now
                            </a>
                        </Button>
                    ) : (
                        <Button
                            variant="secondary"
                            className="col-span-2 cursor-not-allowed opacity-50"
                            disabled
                        >
                            <span className="flex items-center justify-center gap-2">
                                <Phone className="w-4 h-4" />
                                No Phone
                            </span>
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
