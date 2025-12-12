import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Star, ThumbsUp, Trash2, CheckCircle, Search, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        loadReviews();
    }, []);

    async function loadReviews() {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading reviews:', error);
            toast({
                title: "Error",
                description: "Failed to load reviews",
                variant: "destructive",
            });
        } else {
            console.log("Loaded reviews:", data);
            setReviews(data || []);
        }
        setIsLoading(false);
    }

    async function deleteReview(id: number) {
        if (!confirm("Are you sure you want to delete this review?")) return;

        const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Error deleting review:", error);
            toast({
                title: "Error",
                description: "Failed to delete review",
                variant: "destructive",
            });
        } else {
            toast({
                title: "Deleted",
                description: "Review deleted successfully",
            });
            loadReviews();
        }
    }

    // Since our schema doesn't have an "approved" column yet, we'll assume all reviews are visible
    // but maybe we want to add verifying Verified Purchase manually if needed.
    // For now, let's just allow deleting.

    const filteredReviews = reviews.filter(r => {
        const matchesSearch =
            r.user_name?.toLowerCase().includes(search.toLowerCase()) ||
            r.title?.toLowerCase().includes(search.toLowerCase()) ||
            r.comment?.toLowerCase().includes(search.toLowerCase());

        if (filter === "all") return matchesSearch;
        if (filter === "5star") return matchesSearch && r.rating === 5;
        if (filter === "low") return matchesSearch && r.rating <= 3;
        return matchesSearch;
    });

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-display text-foreground mb-2">Review Moderation</h1>
                <p className="text-muted-foreground">Manage customer reviews</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search reviews..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Reviews</SelectItem>
                        <SelectItem value="5star">5 Stars</SelectItem>
                        <SelectItem value="low">Low Rating (≤ 3)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-32 bg-secondary/50 rounded-lg animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredReviews.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground bg-card rounded-lg border border-border">
                            <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
                            <p>No reviews found matching your criteria</p>
                        </div>
                    ) : (
                        filteredReviews.map((review) => (
                            <div key={review.id} className="bg-card p-6 rounded-lg border border-border hover:border-gold/30 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="flex text-gold">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 ${i < review.rating ? "fill-gold" : "text-muted-foreground/30"}`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="font-semibold">{review.title}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <span>by {review.user_name}</span>
                                            {review.verified_purchase && (
                                                <Badge variant="secondary" className="text-[10px] h-5 bg-green-500/10 text-green-500 border-green-500/20">
                                                    Verified Customer
                                                </Badge>
                                            )}
                                            <span>•</span>
                                            <span>{new Date(review.created_at).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span className="font-mono text-xs">Biz ID: {review.business_id}</span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:bg-destructive/10"
                                        onClick={() => deleteReview(review.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                                <p className="text-sm text-foreground/80">{review.comment}</p>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
