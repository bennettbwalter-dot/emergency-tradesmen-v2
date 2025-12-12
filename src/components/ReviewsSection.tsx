import { useState } from "react";
import { ReviewCard } from "@/components/ReviewCard";
import { ReviewStatsDisplay } from "@/components/ReviewStatsDisplay";
import { Review, ReviewStats } from "@/lib/reviews";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Star, Filter } from "lucide-react";

interface ReviewsSectionProps {
    reviews: Review[];
    stats: ReviewStats;
    businessName: string;
}

export function ReviewsSection({ reviews, stats, businessName }: ReviewsSectionProps) {
    const [sortBy, setSortBy] = useState<"recent" | "highest" | "lowest" | "helpful">("recent");
    const [filterRating, setFilterRating] = useState<number | "all">("all");
    const [showCount, setShowCount] = useState(6);

    // Filter and sort reviews
    const filteredAndSortedReviews = reviews
        .filter((review) => {
            if (filterRating === "all") return true;
            return review.rating === filterRating;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case "recent":
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                case "highest":
                    return b.rating - a.rating;
                case "lowest":
                    return a.rating - b.rating;
                case "helpful":
                    return b.helpful - a.helpful;
                default:
                    return 0;
            }
        });

    const displayedReviews = filteredAndSortedReviews.slice(0, showCount);
    const hasMore = filteredAndSortedReviews.length > showCount;

    return (
        <div className="space-y-8">
            {/* Stats Overview */}
            <div>
                <div className="text-center mb-8">
                    <p className="text-gold uppercase tracking-luxury text-sm mb-4">Customer Reviews</p>
                    <h2 className="font-display text-3xl md:text-5xl tracking-wide text-foreground mb-4">
                        What Customers Say About {businessName}
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Real reviews from verified customers who have used this service
                    </p>
                </div>

                <ReviewStatsDisplay stats={stats} />
            </div>

            {/* Filters and Sort */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/30">
                <div className="flex items-center gap-3">
                    <Filter className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                        Showing {displayedReviews.length} of {filteredAndSortedReviews.length} reviews
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Rating Filter */}
                    <Select
                        value={filterRating.toString()}
                        onValueChange={(value) =>
                            setFilterRating(value === "all" ? "all" : parseInt(value))
                        }
                    >
                        <SelectTrigger className="w-[140px] bg-card border-border/50">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Ratings</SelectItem>
                            <SelectItem value="5">
                                <span className="flex items-center gap-2">
                                    5 <Star className="w-3 h-3 fill-gold text-gold" />
                                </span>
                            </SelectItem>
                            <SelectItem value="4">
                                <span className="flex items-center gap-2">
                                    4 <Star className="w-3 h-3 fill-gold text-gold" />
                                </span>
                            </SelectItem>
                            <SelectItem value="3">
                                <span className="flex items-center gap-2">
                                    3 <Star className="w-3 h-3 fill-gold text-gold" />
                                </span>
                            </SelectItem>
                            <SelectItem value="2">
                                <span className="flex items-center gap-2">
                                    2 <Star className="w-3 h-3 fill-gold text-gold" />
                                </span>
                            </SelectItem>
                            <SelectItem value="1">
                                <span className="flex items-center gap-2">
                                    1 <Star className="w-3 h-3 fill-gold text-gold" />
                                </span>
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Sort */}
                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                        <SelectTrigger className="w-[160px] bg-card border-border/50">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="recent">Most Recent</SelectItem>
                            <SelectItem value="highest">Highest Rated</SelectItem>
                            <SelectItem value="lowest">Lowest Rated</SelectItem>
                            <SelectItem value="helpful">Most Helpful</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Reviews List */}
            {displayedReviews.length > 0 ? (
                <div className="space-y-4">
                    {displayedReviews.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                    ))}

                    {/* Load More */}
                    {hasMore && (
                        <div className="text-center pt-4">
                            <Button
                                variant="outline"
                                onClick={() => setShowCount(showCount + 6)}
                                className="border-border/50 hover:border-gold/50"
                            >
                                Load More Reviews
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">
                        No reviews match your current filter
                    </p>
                    <Button
                        variant="ghost"
                        onClick={() => {
                            setFilterRating("all");
                            setSortBy("recent");
                        }}
                        className="mt-4"
                    >
                        Clear filters
                    </Button>
                </div>
            )}
        </div>
    );
}
