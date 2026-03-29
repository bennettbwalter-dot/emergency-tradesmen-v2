import { useState } from "react";
import { Star, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface WriteReviewModalProps {
    businessName: string;
    businessId: string;
}

export function WriteReviewModal({ businessName, businessId }: WriteReviewModalProps) {
    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [title, setTitle] = useState("");
    const [comment, setComment] = useState("");
    const [jobType, setJobType] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            toast({
                title: "Rating required",
                description: "Please select a star rating",
                variant: "destructive",
            });
            return;
        }

        // In a real app, this would submit to an API
        toast({
            title: "Review submitted!",
            description: "Thank you for your feedback. Your review will be published after verification.",
        });

        // Reset form
        setRating(0);
        setTitle("");
        setComment("");
        setJobType("");
        setName("");
        setEmail("");
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="border-gold/30 hover:bg-gold/5 hover:text-gold"
                >
                    <Star className="w-4 h-4 mr-2" />
                    Write a Review
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-display text-2xl tracking-wide">
                        Write a Review for {businessName}
                    </DialogTitle>
                    <DialogDescription>
                        Share your experience to help others make informed decisions
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    {/* Rating */}
                    <div className="space-y-2">
                        <Label className="text-base">Your Rating *</Label>
                        <div className="flex items-center gap-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setRating(i + 1)}
                                    onMouseEnter={() => setHoverRating(i + 1)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-8 h-8 ${i < (hoverRating || rating)
                                                ? "fill-gold text-gold"
                                                : "text-muted-foreground/30"
                                            }`}
                                    />
                                </button>
                            ))}
                            {rating > 0 && (
                                <span className="ml-2 text-sm text-muted-foreground">
                                    {rating === 5 && "Excellent"}
                                    {rating === 4 && "Very Good"}
                                    {rating === 3 && "Good"}
                                    {rating === 2 && "Fair"}
                                    {rating === 1 && "Poor"}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Job Type */}
                    <div className="space-y-2">
                        <Label htmlFor="jobType">Type of Service</Label>
                        <Select value={jobType} onValueChange={setJobType}>
                            <SelectTrigger id="jobType" className="bg-card border-border/50">
                                <SelectValue placeholder="Select service type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="emergency-repair">Emergency Repair</SelectItem>
                                <SelectItem value="routine-maintenance">Routine Maintenance</SelectItem>
                                <SelectItem value="installation">Installation</SelectItem>
                                <SelectItem value="inspection">Inspection</SelectItem>
                                <SelectItem value="diagnosis">Diagnosis & Repair</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Review Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Review Title *</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Sum up your experience in one line"
                            required
                            className="bg-card border-border/50"
                        />
                    </div>

                    {/* Review Comment */}
                    <div className="space-y-2">
                        <Label htmlFor="comment">Your Review *</Label>
                        <Textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell us about your experience with this business..."
                            required
                            rows={6}
                            className="bg-card border-border/50 resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                            Minimum 50 characters ({comment.length}/50)
                        </p>
                    </div>

                    {/* Your Details */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Your Name *</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Smith"
                                required
                                className="bg-card border-border/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="john@example.com"
                                required
                                className="bg-card border-border/50"
                            />
                            <p className="text-xs text-muted-foreground">
                                Won't be published
                            </p>
                        </div>
                    </div>

                    {/* Verification Notice */}
                    <div className="bg-secondary/30 border border-border/50 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">
                            <strong className="text-foreground">Verification:</strong> We'll send you an email to verify your review.
                            Your review will be published once verified. We take review authenticity seriously.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-border/30">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-gold hover:bg-gold/90 text-gold-foreground"
                            disabled={rating === 0 || comment.length < 50}
                        >
                            Submit Review
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
