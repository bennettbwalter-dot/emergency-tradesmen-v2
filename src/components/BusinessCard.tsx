
import { Link } from "react-router-dom";
import { Star, MapPin, Phone, ShieldCheck, Zap, Heart, MessageSquareQuote, Factory, Wrench, TrendingUp, Clock, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
// import { db } from "@/lib/db"; // Commented out to prevent crashes for now
import { useState } from "react";
import { AuthModal } from "./AuthModal";
import { QuoteRequestModal } from "./QuoteRequestModal";
import { Business } from "@/lib/businesses";
import { useComparison } from "@/contexts/ComparisonContext";
import { useToast } from "@/components/ui/use-toast"; // Changed to useToast hook

interface BusinessCardProps {
    business: Business;
    rank: number;
}

export function BusinessCard({ business, rank }: BusinessCardProps) {
    const { isAuthenticated } = useAuth();
    const [liked, setLiked] = useState(false);
    const { addToComparison, removeFromComparison, isInComparison } = useComparison(); // Fixed destructuring
    const { toast } = useToast();

    const inComparison = isInComparison(business.id); // Fixed usage

    // Trade Icon Logic
    let TradeIcon = Wrench;
    if (business.trade === 'electrician') TradeIcon = Zap;
    if (business.trade === 'plumber') TradeIcon = Wrench;
    if (business.trade === 'locksmith') TradeIcon = Key;
    if (business.trade === 'glazier') TradeIcon = Factory;

    // Just use Wrench as default if unknown
    const tradeName = business.trade ? business.trade.charAt(0).toUpperCase() + business.trade.slice(1) : "Tradesperson";

    const handleFavorite = async () => {
        if (!isAuthenticated) return;
        // Mock functionality for now
        setLiked(!liked);
    };

    // Availability Logic
    const isAvailable = true; // For emergency trades, default to available or use logic

    // Check real-time availability (Live Ping)
    const lastPing = business.last_available_ping ? new Date(business.last_available_ping) : null;
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const isLive = lastPing && lastPing > oneHourAgo;

    const showAvailable = isLive || business.isOpen24Hours || isAvailable;

    const isPaid = business.is_premium || business.tier === 'paid' || (business.priority_score && business.priority_score > 0);

    return (
        <div
            className={`group relative bg-card rounded-lg border hover:shadow-2xl hover:shadow-gold/10 hover:-translate-y-1 transition-[shadow,border-color,transform] duration-300 overflow-hidden aspect-[4/5] flex flex-col ${isPaid
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
                        className={`rounded-full hover:bg-gold/10 ${liked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-gold'}`}
                        onClick={(e) => { e.preventDefault(); handleFavorite(); }}
                    >
                        <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
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
                        <span>{business.hours || "24/7 Emergency"}</span>
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
                            variant="default"
                            className={`bg-gradient-to-r from-gold to-yellow-500 hover:from-yellow-400 hover:to-gold text-black font-bold border-0 ${isPaid && business.whatsapp_number ? "" : "col-span-2"}`}
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
                                WhatsApp
                            </a>
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <QuoteRequestModal
                        businessName={business.name}
                        businessId={business.id}
                        tradeName={tradeName}
                        variant="outline"
                        className="border-gold/30 hover:bg-gold/5 hover:text-gold"
                    />

                    <Button
                        variant="outline"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (inComparison) {
                                removeFromComparison(business.id);
                                toast({ title: "Removed from comparison" });
                            } else {
                                addToComparison(business.id);
                                toast({ title: "Added to comparison" });
                            }
                        }}
                        className={`border-gold/30 hover:bg-gold/5 hover:text-gold ${inComparison ? 'bg-gold/10 border-gold' : ''}`}
                    >
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {inComparison ? 'In Comparison' : 'Compare'}
                    </Button>
                </div>

            </div>

            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-gold/0 via-gold/0 to-gold/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
    );
}
