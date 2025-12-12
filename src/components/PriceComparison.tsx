import { useState, useEffect } from "react";
import { X, Check, TrendingUp, Clock, Shield, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Business } from "@/lib/businesses";
import { useComparison } from "@/contexts/ComparisonContext";
import {
    formatPrice,
    calculateJobCost,
    getPriceTier,
    getPriceRangeLabel,
    generateMockPricing,
} from "@/lib/pricing";
import { getBusinessById } from "@/lib/businesses";
import { Link } from "react-router-dom";

interface PriceComparisonProps {
    tradeName?: string;
}

export function PriceComparison({ tradeName = "electrician" }: PriceComparisonProps) {
    const { items, removeFromComparison, clearComparison } = useComparison();
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [jobHours, setJobHours] = useState(2);

    useEffect(() => {
        loadComparison();
    }, [items]);

    const loadComparison = () => {
        const loadedBusinesses = items
            .map(id => getBusinessById(id))
            .filter((item): item is NonNullable<ReturnType<typeof getBusinessById>> => item !== null)
            .map(item => item.business)
            .map(business => ({
                ...business,
                pricing: business.pricing || generateMockPricing(business.id, tradeName),
            }));

        setBusinesses(loadedBusinesses);
    };

    const handleRemove = (id: string) => {
        removeFromComparison(id);
    };

    const handleClearAll = () => {
        clearComparison();
    };

    if (businesses.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <TrendingUp className="w-12 h-12 text-muted-foreground/50 mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No businesses to compare</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                        Click "Compare" on business cards to add them here and see a side-by-side price comparison.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const cheapestBusiness = businesses.reduce((prev, current) => {
        const prevCost = prev.pricing ? calculateJobCost(prev.pricing, jobHours) : Infinity;
        const currentCost = current.pricing ? calculateJobCost(current.pricing, jobHours) : Infinity;
        return currentCost < prevCost ? current : prev;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-display font-bold">Price Comparison</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Comparing {businesses.length} {businesses.length === 1 ? 'business' : 'businesses'}
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleClearAll}>
                    Clear All
                </Button>
            </div>

            {/* Job Duration Selector */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Estimated Job Duration
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2 flex-wrap">
                        {[1, 2, 3, 4, 6, 8].map(hours => (
                            <Button
                                key={hours}
                                variant={jobHours === hours ? "default" : "outline"}
                                size="sm"
                                onClick={() => setJobHours(hours)}
                                className={jobHours === hours ? "bg-gold hover:bg-gold/90 text-gold-foreground" : ""}
                            >
                                {hours} {hours === 1 ? 'hour' : 'hours'}
                            </Button>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                        Select estimated job duration to see total costs including call-out fees
                    </p>
                </CardContent>
            </Card>

            {/* Comparison Table */}
            <ScrollArea className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
                    {businesses.map((business) => {
                        const pricing = business.pricing!;
                        const totalCost = calculateJobCost(pricing, jobHours);
                        const isCheapest = business.id === cheapestBusiness.id;
                        const tierInfo = getPriceTier(pricing);
                        const priceRange = getPriceRangeLabel(pricing);

                        return (
                            <Card key={business.id} className={`relative ${isCheapest ? 'border-gold shadow-lg' : ''}`}>
                                {isCheapest && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <Badge className="bg-gold text-gold-foreground">Best Value</Badge>
                                    </div>
                                )}

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 h-6 w-6"
                                    onClick={() => handleRemove(business.id)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>

                                <CardHeader className="pb-4">
                                    <Link to={`/business/${business.id}`} className="hover:text-gold transition-colors">
                                        <CardTitle className="text-lg pr-8">{business.name}</CardTitle>
                                    </Link>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="flex items-center gap-1">
                                            <span className="text-2xl font-bold text-foreground">★</span>
                                            <span className="font-semibold">{business.rating}</span>
                                            <span className="text-sm text-muted-foreground">
                                                ({business.reviewCount})
                                            </span>
                                        </div>
                                        <Badge variant="outline" className={tierInfo.color}>
                                            {tierInfo.label}
                                        </Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                        {priceRange} · {business.isOpen24Hours ? '24/7 Available' : 'Limited Hours'}
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Total Cost Highlight */}
                                    <div className="bg-secondary/50 rounded-lg p-4 text-center">
                                        <p className="text-sm text-muted-foreground mb-1">Total Cost ({jobHours}h)</p>
                                        <p className="text-3xl font-bold text-gold">{formatPrice(totalCost)}</p>
                                    </div>

                                    {/* Pricing Breakdown */}
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Call-out Fee</span>
                                            <span className="font-medium">{formatPrice(pricing.callOutFee)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Hourly Rate</span>
                                            <span className="font-medium">{formatPrice(pricing.hourlyRate)}/hr</span>
                                        </div>
                                        {pricing.emergency24hSurcharge && (
                                            <div className="flex justify-between text-orange-600">
                                                <span>24h Emergency</span>
                                                <span className="font-medium">+{pricing.emergency24hSurcharge}%</span>
                                            </div>
                                        )}
                                        {pricing.minimumCharge && (
                                            <div className="flex justify-between text-xs">
                                                <span className="text-muted-foreground">Min. Charge</span>
                                                <span>{formatPrice(pricing.minimumCharge)}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* What's Included */}
                                    <div className="border-t pt-3">
                                        <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-gold" />
                                            What's Included
                                        </p>
                                        <ul className="space-y-1">
                                            {pricing.whatsIncluded.slice(0, 3).map((item, idx) => (
                                                <li key={idx} className="text-xs flex items-start gap-2">
                                                    <Check className="w-3 h-3 text-green-600 mt-0.5 shrink-0" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Typical Jobs */}
                                    {pricing.typicalJobs && pricing.typicalJobs.length > 0 && (
                                        <div className="border-t pt-3">
                                            <p className="text-sm font-medium mb-2">Typical Jobs</p>
                                            <div className="space-y-1.5">
                                                {pricing.typicalJobs.slice(0, 2).map((job, idx) => (
                                                    <div key={idx} className="text-xs">
                                                        <div className="flex justify-between items-baseline">
                                                            <span className="text-muted-foreground">{job.name}</span>
                                                            <span className="font-medium text-gold">{job.priceRange}</span>
                                                        </div>
                                                        <span className="text-muted-foreground/70">{job.duration}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="pt-2 space-y-2">
                                        <Button asChild className="w-full bg-gold hover:bg-gold/90 text-gold-foreground">
                                            <Link to={`/business/${business.id}`}>View Full Profile</Link>
                                        </Button>
                                        <Button asChild variant="outline" className="w-full" size="sm">
                                            <a href={`tel:${business.phone}`}>
                                                <Phone className="w-3 h-3 mr-2" />
                                                Call Now
                                            </a>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {/* Comparison Tips */}
            <Card className="bg-secondary/30">
                <CardContent className="py-4">
                    <p className="text-sm text-muted-foreground">
                        <strong>Tip:</strong> Prices shown are estimates. Final costs may vary based on job complexity,
                        materials needed, and time of day. Always request a detailed quote before work begins.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
