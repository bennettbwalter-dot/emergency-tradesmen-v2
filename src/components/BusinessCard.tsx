import { Business } from "@/lib/businesses";
import { Star, MapPin, Phone, Clock, ExternalLink, MessageSquareQuote } from "lucide-react";
import { Button } from "./ui/button";

interface BusinessCardProps {
    business: Business;
    rank: number;
}

export function BusinessCard({ business, rank }: BusinessCardProps) {
    return (
        <div className="group relative bg-card rounded-lg border border-border/50 hover:border-gold/30 transition-all duration-300 overflow-hidden">
            {/* Rank badge */}
            <div className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
                <span className="font-display text-gold font-bold">{rank}</span>
            </div>

            <div className="p-6 pt-16">
                {/* Business name */}
                <h3 className="font-display text-xl tracking-wide text-foreground mb-3 pr-4">
                    {business.name}
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
                    {business.isOpen24Hours && (
                        <span className="ml-auto px-3 py-1 text-xs font-medium uppercase tracking-wider bg-gold/10 text-gold rounded-full border border-gold/30">
                            24/7
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
                <div className="flex flex-col sm:flex-row gap-3">
                    {business.phone ? (
                        <Button
                            asChild
                            variant="hero"
                            className="flex-1"
                        >
                            <a href={`tel:${business.phone}`} className="flex items-center justify-center gap-2">
                                <Phone className="w-4 h-4" />
                                Call Now
                            </a>
                        </Button>
                    ) : (
                        <Button
                            variant="secondary"
                            className="flex-1 cursor-not-allowed opacity-50"
                            disabled
                        >
                            <span className="flex items-center justify-center gap-2">
                                <Phone className="w-4 h-4" />
                                No Phone
                            </span>
                        </Button>
                    )}
                    {business.website && (
                        <Button
                            asChild
                            variant="outline"
                            className="flex-1 border-gold/30 hover:bg-gold/5 hover:text-gold"
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
        </div>
    );
}
