import { Star, TrendingUp, CheckCircle, MessageSquare } from "lucide-react";
import { ReviewStats } from "@/lib/reviews";
import { Progress } from "@/components/ui/progress";

interface ReviewStatsDisplayProps {
    stats: ReviewStats;
}

export function ReviewStatsDisplay({ stats }: ReviewStatsDisplayProps) {
    return (
        <div className="bg-card border border-border/50 rounded-lg p-6">
            <div className="grid md:grid-cols-2 gap-8">
                {/* Overall Rating */}
                <div className="text-center md:text-left">
                    <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
                        Overall Rating
                    </p>
                    <div className="flex items-end gap-3 mb-4">
                        <span className="text-5xl font-display text-foreground">
                            {stats.averageRating.toFixed(1)}
                        </span>
                        <div className="flex items-center gap-1 mb-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-5 h-5 ${i < Math.round(stats.averageRating)
                                            ? "fill-gold text-gold"
                                            : "text-muted-foreground/30"
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? "s" : ""}
                    </p>

                    {/* Trust Indicators */}
                    <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border/30">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <CheckCircle className="w-4 h-4 text-gold" />
                                <span className="text-2xl font-display text-foreground">
                                    {Math.round(stats.verifiedPercentage)}%
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">Verified Reviews</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <MessageSquare className="w-4 h-4 text-gold" />
                                <span className="text-2xl font-display text-foreground">
                                    {Math.round(stats.responseRate)}%
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">Response Rate</p>
                        </div>
                    </div>
                </div>

                {/* Rating Distribution */}
                <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wider mb-4">
                        Rating Distribution
                    </p>
                    <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map((rating) => {
                            const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution];
                            const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

                            return (
                                <div key={rating} className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 w-16">
                                        <span className="text-sm font-medium text-foreground w-3">
                                            {rating}
                                        </span>
                                        <Star className="w-4 h-4 fill-gold text-gold" />
                                    </div>
                                    <div className="flex-1">
                                        <Progress value={percentage} className="h-2" />
                                    </div>
                                    <span className="text-sm text-muted-foreground w-12 text-right">
                                        {count}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Trending */}
                    {stats.averageRating >= 4.5 && (
                        <div className="mt-6 pt-6 border-t border-border/30">
                            <div className="flex items-center gap-2 text-sm">
                                <TrendingUp className="w-4 h-4 text-gold" />
                                <span className="text-muted-foreground">
                                    <span className="text-gold font-medium">Highly rated</span> by customers
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
