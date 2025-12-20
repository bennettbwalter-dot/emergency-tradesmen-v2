import os

triage_path = r"..\src\components\EmergencyTriageModal.tsx"

new_content = '''import { useState, useEffect } from "react";
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
import { Progress } from "@/components/ui/progress";
import {
    TRADE_OPTIONS,
} from "@/lib/triage";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useToast } from "@/hooks/use-toast";
import { useChatbot } from "@/contexts/ChatbotContext";
import {
    ArrowLeft,
    ArrowRight,
    Zap,
    MapPin,
    Loader2,
    Navigation,
    CheckCircle,
} from "lucide-react";

interface EmergencyTriageModalProps {
    trigger?: React.ReactNode;
}

type Step = "trade" | "verify" | "location";

// Quick verification questions based on trade
const VERIFICATION_QUESTIONS: Record<string, { question: string; options: string[] }> = {
    plumber: {
        question: "Is water actively leaking or flowing?",
        options: ["Yes - active leak", "No - but not draining", "No - other issue", "Not sure"],
    },
    electrician: {
        question: "Is there a complete power outage?",
        options: ["Yes - total power loss", "Partial - some circuits", "No - but sparking/smell", "Not sure"],
    },
    locksmith: {
        question: "Are you currently locked out?",
        options: ["Yes - locked out now", "Lock broken/jammed", "Lost keys", "Security concern"],
    },
    "gas-engineer": {
        question: "Can you smell gas right now?",
        options: ["Yes - strong smell", "Faint smell", "No smell - boiler issue", "Carbon monoxide alarm"],
    },
};

export function EmergencyTriageModal({ trigger }: EmergencyTriageModalProps) {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { setDetectedTrade, setDetectedCity } = useChatbot();
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<Step>("trade");

    // Form state
    const [selectedTrade, setSelectedTrade] = useState<string>("");
    const [verificationAnswer, setVerificationAnswer] = useState<string>("");

    // Geolocation hook
    const { getLocation, loading: geoLoading, place } = useGeolocation();

    const currentTrade = TRADE_OPTIONS.find((t) => t.id === selectedTrade);
    const verificationQ = selectedTrade ? VERIFICATION_QUESTIONS[selectedTrade] : null;

    const steps: Step[] = ["trade", "verify", "location"];
    const currentStepIndex = steps.indexOf(step);
    const progress = ((currentStepIndex + 1) / steps.length) * 100;

    const resetForm = () => {
        setStep("trade");
        setSelectedTrade("");
        setVerificationAnswer("");
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
        setDetectedTrade(tradeId);
        setVerificationAnswer("");
        goNext();
    };

    const handleVerificationSelect = (answer: string) => {
        setVerificationAnswer(answer);
        goNext();
    };

    // Auto-detect location when reaching location step
    useEffect(() => {
        if (step === "location" && !place?.city) {
            getLocation();
        }
    }, [step]);

    // Auto-navigate when location is detected
    useEffect(() => {
        if (step === "location" && place?.city && selectedTrade) {
            setDetectedCity(place.city);
            toast({
                title: "Location Found",
                description: `Redirecting to ${currentTrade?.name}s in ${place.city}...`,
            });
            setTimeout(() => {
                setIsOpen(false);
                navigate(`/emergency-${selectedTrade}/${place.city.toLowerCase()}`);
            }, 800);
        }
    }, [place, step, selectedTrade]);

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
                        {step === "verify" && currentTrade && `${currentTrade.name} Emergency`}
                        {step === "location" && "Finding Local Help"}
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {step === "trade" && "Select the type of tradesperson you need"}
                        {step === "verify" && "Quick question to help us route you correctly"}
                        {step === "location" && "Detecting your location..."}
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

                    {/* Quick Verification */}
                    {step === "verify" && verificationQ && (
                        <div className="space-y-4">
                            <p className="text-center text-lg font-medium mb-4">{verificationQ.question}</p>
                            <div className="space-y-2">
                                {verificationQ.options.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => handleVerificationSelect(option)}
                                        className="w-full flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-gold/50 hover:bg-gold/5 transition-all text-left"
                                    >
                                        <span className="font-medium">{option}</span>
                                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Location Detection */}
                    {step === "location" && (
                        <div className="flex flex-col items-center justify-center space-y-6 py-8">
                            {geoLoading ? (
                                <>
                                    <Loader2 className="w-16 h-16 animate-spin text-gold" />
                                    <div className="text-center">
                                        <p className="font-medium text-lg mb-2">Detecting your location...</p>
                                        <p className="text-sm text-muted-foreground">
                                            This helps us find the nearest {currentTrade?.name?.toLowerCase()}s
                                        </p>
                                    </div>
                                </>
                            ) : place?.city ? (
                                <>
                                    <CheckCircle className="w-16 h-16 text-green-500" />
                                    <div className="text-center">
                                        <p className="font-medium text-lg mb-2">Location Found!</p>
                                        <p className="text-sm text-muted-foreground">
                                            Finding {currentTrade?.name?.toLowerCase()}s in {place.city}...
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <MapPin className="w-16 h-16 text-gold" />
                                    <div className="text-center">
                                        <p className="font-medium text-lg mb-2">Location Required</p>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Please enable location services to continue
                                        </p>
                                        <Button
                                            onClick={getLocation}
                                            className="bg-gold hover:bg-gold/90 text-black"
                                        >
                                            <Navigation className="w-4 h-4 mr-2" />
                                            Try Again
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Navigation */}
                {step !== "trade" && step !== "location" && (
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
'''

with open(triage_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Emergency Triage Modal streamlined!")
