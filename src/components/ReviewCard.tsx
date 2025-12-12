import { Star, ThumbsUp, ThumbsDown, CheckCircle, MessageSquare } from "lucide-react";
import { Review } from "@/lib/reviews";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface ReviewCardProps {
    review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
    const [helpful, setHelpful] = useState(review.helpful);
    const [notHelpful, setNotHelpful] = useState(review.notHelpful);
    const [userVote, setUserVote] = useState<"helpful" | "not-helpful" | null>(null);

    const handleVote = (vote: "helpful" | "not-helpful") => {
        if (userVote === vote) {
            // Remove vote
            if (vote === "helpful") {
                setHelpful(helpful - 1);
            } else {
                setNotHelpful(notHelpful - 1);
            }
            setUserVote(null);
        } else {
            // Add or change vote
            if (userVote === "helpful") {
                setHelpful(helpful - 1);
                setNotHelpful(notHelpful + 1);
            } else if (userVote === "not-helpful") {
                setNotHelpful(notHelpful - 1);
                setHelpful(helpful + 1);
            } else {
                if (vote === "helpful") {
                    setHelpful(helpful + 1);
                } else {
                    setNotHelpful(notHelpful + 1);
                }
            }
            setUserVote(vote);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    };

    return (
        <div className="bg-card border border-border/50 rounded-lg p-6 hover:border-gold/30 transition-colors">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    {/* User Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-gold font-medium text-sm">{review.userInitials}</span>
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-medium text-foreground">{review.userName}</h4>
                            {review.verified && (
                                <Badge variant="secondary" className="text-xs gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    Verified
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">{formatDate(review.date)}</p>
                    </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                            key={i}
                            className={`w-4 h-4 ${i < review.rating
                                    ? "fill-gold text-gold"
                                    : "text-muted-foreground/30"
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Job Type */}
            {review.jobType && (
                <Badge variant="outline" className="mb-3">
                    {review.jobType}
                </Badge>
            )}

            {/* Review Content */}
            <div className="mb-4">
                <h5 className="font-medium text-foreground mb-2">{review.title}</h5>
                <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
            </div>

            {/* Business Response */}
            {review.response && (
                <div className="bg-secondary/30 border-l-2 border-gold/50 rounded-r-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-gold" />
                        <span className="text-sm font-medium text-foreground">
                            Response from {review.response.businessName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {formatDate(review.response.date)}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.response.text}</p>
                </div>
            )}

            {/* Helpful Actions */}
            <div className="flex items-center gap-4 pt-4 border-t border-border/30">
                <span className="text-sm text-muted-foreground">Was this review helpful?</span>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote("helpful")}
                        className={`gap-2 ${userVote === "helpful" ? "text-gold" : "text-muted-foreground"
                            }`}
                    >
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-sm">{helpful}</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote("not-helpful")}
                        className={`gap-2 ${userVote === "not-helpful" ? "text-destructive" : "text-muted-foreground"
                            }`}
                    >
                        <ThumbsDown className="w-4 h-4" />
                        <span className="text-sm">{notHelpful}</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
