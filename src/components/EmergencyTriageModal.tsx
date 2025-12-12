import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    TRADE_OPTIONS,
    UrgencyLevel,
    assessTriage,
    formatCostRange,
} from "@/lib/triage";
import { getBusinessListings } from "@/lib/businesses";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useToast } from "@/hooks/use-toast";
import {
    ArrowLeft,
    ArrowRight,
    Phone,
    Clock,
    PoundSterling,
    AlertTriangle,
    CheckCircle,
    Zap,
    Calendar,
    MapPin,
    Loader2,
    Navigation,
} from "lucide-react";

interface EmergencyTriageModalProps {
    trigger?: React.ReactNode;
}

type Step = "trade" | "problem" | "urgency" | "location" | "results";

const URGENCY_OPTIONS: { id: UrgencyLevel; label: string; description: string; icon: React.ReactNode }[] = [
    {
        id: "emergency",
        label: "Emergency - Right Now",
        description: "Safety risk, major leak, locked out",
        icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
    },
    {
        id: "same-day",
        label: "Same Day",
        description: "Needs fixing today",
        icon: <Zap className="w-5 h-5 text-orange-500" />,
    },
    {
        id: "next-day",
        label: "Next Day or Two",
        description: "Can wait a bit",
        icon: <Clock className="w-5 h-5 text-yellow-500" />,
    },
    {
        id: "scheduled",
        label: "Schedule for Later",
        description: "No rush, plan ahead",
        icon: <Calendar className="w-5 h-5 text-blue-500" />,
    },
];

export function EmergencyTriageModal({ trigger }: EmergencyTriageModalProps) {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<Step>("trade");

    // Form state
    const [selectedTrade, setSelectedTrade] = useState<string>("");
    const [selectedProblem, setSelectedProblem] = useState<string>("");
    const [selectedUrgency, setSelectedUrgency] = useState<UrgencyLevel | "">("");
    const [postcode, setPostcode] = useState("");

    const currentTrade = TRADE_OPTIONS.find((t) => t.id === selectedTrade);

    const steps: Step[] = ["trade", "problem", "urgency", "location", "results"];
    const currentStepIndex = steps.indexOf(step);
    const progress = ((currentStepIndex + 1) / steps.length) * 100;

    const resetForm = () => {
        setStep("trade");
        setSelectedTrade("");
        setSelectedProblem("");
        setSelectedUrgency("");
        setPostcode("");
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) resetForm();
    };

    const goNext = () => {
        const nextIndex = currentStepIndex + 1;
        if (nextIndex < steps.length) {
            setStep(steps[nextIndex]);
        }
    };

    const goBack = () => {
        const prevIndex = currentStepIndex - 1;
        if (prevIndex >= 0) {
            setStep(steps[prevIndex]);
        }
    };

    const handleTradeSelect = (tradeId: string) => {
        setSelectedTrade(tradeId);
        setSelectedProblem(""); // Reset problem when trade changes
        goNext();
    };

    const handleProblemSelect = (problemId: string) => {
        setSelectedProblem(problemId);
        goNext();
    };

    const handleUrgencySelect = (urgency: UrgencyLevel) => {
        setSelectedUrgency(urgency);
        goNext();
    };

    const handleLocationSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (postcode.trim()) {
            goNext();
        }
    };

    const handleViewBusinesses = () => {
        setIsOpen(false);
        // Navigate to the trade/city page
        const citySlug = postcode.split(" ")[0].toLowerCase() || "london";
        navigate(`/emergency-${selectedTrade}/${citySlug}`);
    };

    // Get triage results
    const triageResult = selectedTrade && selectedProblem && selectedUrgency
        ? assessTriage(selectedTrade, selectedProblem, selectedUrgency)
        : null;

    // Get matching businesses
    const matchingBusinesses = selectedTrade
        ? getBusinessListings("london", selectedTrade)?.slice(0, 3) || []
        : [];

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="hero" size="lg">
                        <Zap className="w-5 h-5 mr-2" />
                        Get Help Now
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-display text-center">
                        {step === "trade" && "What do you need help with?"}
                        {step === "problem" && `What's the ${currentTrade?.name} issue?`}
                        {step === "urgency" && "How urgent is this?"}
                        {step === "location" && "Where are you located?"}
                        {step === "results" && "Your Assessment"}
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {step === "trade" && "Select the type of tradesperson you need"}
                        {step === "problem" && "Help us understand your situation"}
                        {step === "urgency" && "This helps us prioritize your request"}
                        {step === "location" && "Enter your postcode to find local help"}
                        {step === "results" && "Here's what we recommend"}
                    </DialogDescription>
                </DialogHeader>

                {/* Progress bar */}
                <div className="mb-4">
                    <Progress value={progress} className="h-1" />
                    <p className="text-xs text-muted-foreground text-center mt-2">
                        Step {currentStepIndex + 1} of {steps.length}
                    </p>
                </div>

                {/* Step Content */}
                <div className="min-h-[300px]">
                    {/* Trade Selection */}
                    {step === "trade" && (
                        <div className="grid grid-cols-2 gap-3">
                            {TRADE_OPTIONS.map((trade) => (
                                <button
                                    key={trade.id}
                                    onClick={() => handleTradeSelect(trade.id)}
                                    className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border/50 hover:border-gold/50 hover:bg-gold/5 transition-all text-center group"
                                >
                                    <span className="text-3xl">{trade.icon}</span>
                                    <span className="font-medium text-foreground group-hover:text-gold transition-colors">
                                        {trade.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Problem Selection */}
                    {step === "problem" && currentTrade && (
                        <div className="space-y-2">
                            {currentTrade.problems.map((problem) => (
                                <button
                                    key={problem.id}
                                    onClick={() => handleProblemSelect(problem.id)}
                                    className="w-full flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-gold/50 hover:bg-gold/5 transition-all text-left"
                                >
                                    <span className="font-medium">{problem.label}</span>
                                    {problem.urgencyHint === "emergency" && (
                                        <Badge variant="destructive" className="text-xs">Urgent</Badge>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Urgency Selection */}
                    {step === "urgency" && (
                        <div className="space-y-3">
                            {URGENCY_OPTIONS.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => handleUrgencySelect(option.id)}
                                    className="w-full flex items-center gap-4 p-4 rounded-lg border border-border/50 hover:border-gold/50 hover:bg-gold/5 transition-all text-left"
                                >
                                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                                        {option.icon}
                                    </div>
                                    <div>
                                        <p className="font-medium">{option.label}</p>
                                        <p className="text-sm text-muted-foreground">{option.description}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Location Input */}
                    {step === "location" && (
                        <form onSubmit={handleLocationSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="postcode">Your Postcode</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="postcode"
                                        placeholder="e.g., SW1A 1AA"
                                        value={postcode}
                                        onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                                        className="pl-9 text-lg"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={getLocation}
                                        disabled={geoLoading}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gold/10 rounded-full text-gold transition-colors"
                                        title="Use my location"
                                    >
                                        {geoLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Navigation className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-gold hover:bg-gold/90 text-gold-foreground">
                                Find Local Help
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </form>
                    )}

                    {/* Results */}
                    {step === "results" && triageResult && (
                        <div className="space-y-6">
                            {/* Priority indicator */}
                            <div className={`p-4 rounded-lg border ${triageResult.priorityScore >= 8
                                ? "border-red-500/30 bg-red-500/5"
                                : triageResult.priorityScore >= 5
                                    ? "border-orange-500/30 bg-orange-500/5"
                                    : "border-green-500/30 bg-green-500/5"
                                }`}>
                                <div className="flex items-center gap-3 mb-2">
                                    {triageResult.priorityScore >= 8 ? (
                                        <AlertTriangle className="w-5 h-5 text-red-500" />
                                    ) : (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    )}
                                    <span className="font-semibold">{triageResult.recommendedAction}</span>
                                </div>
                            </div>

                            {/* Stats grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg bg-card border border-border/50 text-center">
                                    <PoundSterling className="w-5 h-5 mx-auto mb-2 text-gold" />
                                    <p className="text-sm text-muted-foreground">Estimated Cost</p>
                                    <p className="font-display text-xl font-semibold text-gold">
                                        {formatCostRange(triageResult.estimatedCost)}
                                    </p>
                                </div>
                                <div className="p-4 rounded-lg bg-card border border-border/50 text-center">
                                    <Clock className="w-5 h-5 mx-auto mb-2 text-gold" />
                                    <p className="text-sm text-muted-foreground">Expected Wait</p>
                                    <p className="font-display text-xl font-semibold">
                                        {triageResult.estimatedWaitTime}
                                    </p>
                                </div>
                            </div>

                            {/* Top matches preview */}
                            {matchingBusinesses.length > 0 && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Top matches near you:</p>
                                    <div className="space-y-2">
                                        {matchingBusinesses.map((business) => (
                                            <div key={business.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50">
                                                <span className="font-medium truncate">{business.name}</span>
                                                <Badge variant="outline" className="text-gold border-gold/30">
                                                    ⭐ {business.rating}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex flex-col gap-3">
                                <Button variant="hero" size="lg" asChild>
                                    <a href="tel:08001234567">
                                        <Phone className="w-4 h-4 mr-2" />
                                        Call Now: 0800 123 4567
                                    </a>
                                </Button>
                                <Button variant="outline" onClick={handleViewBusinesses}>
                                    View All {currentTrade?.name}s in {postcode}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                {step !== "trade" && step !== "results" && (
                    <div className="flex justify-between pt-4 border-t">
                        <Button variant="ghost" onClick={goBack}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
