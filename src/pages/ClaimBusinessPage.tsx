import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getBusinessById } from "@/lib/businesses";
import { db } from "@/lib/db";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Building, ShieldCheck, CheckCircle2, Phone } from "lucide-react";

// Normalize phone number for comparison (strip all non-digits)
function normalizePhone(phone: string): string {
    if (!phone) return "";
    // Remove all non-digit characters
    let digits = phone.replace(/\D/g, "");
    // Remove leading country codes (UK: 44, US: 1)
    if (digits.startsWith("44") && digits.length > 10) {
        digits = digits.slice(2);
    } else if (digits.startsWith("1") && digits.length === 11) {
        digits = digits.slice(1);
    }
    // Remove leading 0 for UK numbers
    if (digits.startsWith("0")) {
        digits = digits.slice(1);
    }
    return digits;
}

export default function ClaimBusinessPage() {
    const { businessId } = useParams<{ businessId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [businessData, setBusinessData] = useState<any>(null);
    const [status, setStatus] = useState<'unclaimed' | 'pending' | 'verified' | null>(null);

    // Form State
    const [phone, setPhone] = useState("");

    useEffect(() => {
        async function loadData() {
            if (!businessId) return;

            // 1. Get Static Data
            const staticData = getBusinessById(businessId);
            if (!staticData) {
                navigate("/404");
                return;
            }
            setBusinessData(staticData);

            // 2. Get DB Status
            try {
                const dbData = await db.businesses.getClaimStatus(businessId);
                if (dbData) {
                    setStatus(dbData.claim_status);
                } else {
                    setStatus('unclaimed');
                }
            } catch (err) {
                console.error(err);
                setStatus('unclaimed');
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [businessId, navigate]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!phone.trim()) {
            toast({
                title: "Phone number required",
                description: "Please enter the phone number listed on this business.",
                variant: "destructive"
            });
            return;
        }

        setVerifying(true);

        // Get the business phone from the listing
        const businessPhone = businessData?.business?.phone || "";

        // Normalize both phone numbers for comparison
        const normalizedInput = normalizePhone(phone);
        const normalizedBusiness = normalizePhone(businessPhone);

        // Simulate a small delay for UX
        await new Promise(resolve => setTimeout(resolve, 500));

        if (normalizedInput === normalizedBusiness && normalizedBusiness.length >= 9) {
            // Phone matches! Redirect to sign-up page
            toast({
                title: "Phone Verified!",
                description: "Redirecting you to complete your sign-up...",
            });

            // Navigate to tradesmen sign-up page
            navigate("/tradesmen", {
                state: {
                    fromClaim: true,
                    businessId: businessId,
                    businessName: businessData?.business?.name
                }
            });
        } else {
            // Phone doesn't match - redirect to contact page
            toast({
                title: "Phone number doesn't match",
                description: "Please contact us directly to verify your claim.",
                variant: "destructive"
            });

            // Navigate to contact page with pre-filled info
            navigate("/contact", {
                state: {
                    subject: `Business Claim Request: ${businessData?.business?.name}`,
                    message: `Hi, I would like to claim my business listing:\n\nBusiness: ${businessData?.business?.name}\nBusiness ID: ${businessId}\n\nThe phone number on the listing doesn't match my current business number. Please help me verify my ownership.`
                }
            });
        }

        setVerifying(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
        );
    }

    // Already Verified/Pending State - show message
    // Otherwise (null or 'unclaimed'), show the claim form
    if (status === 'verified' || status === 'pending') {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center p-4">
                    <div className="w-full max-w-md text-center space-y-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck className="w-8 h-8 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-display font-bold">
                            {status === 'verified' ? 'Already Verified' : 'Verification Pending'}
                        </h1>
                        <p className="text-muted-foreground">
                            {businessData?.business.name} is {status === 'verified' ? 'already verified' : 'currently under review'}.
                        </p>
                        <Button asChild>
                            <Link to={`/business/${businessId}`}>Back to Profile</Link>
                        </Button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // If no business data loaded, show loading or error
    if (!businessData) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Helmet>
                <title>Claim {businessData?.business.name} | Emergency Tradesmen</title>
            </Helmet>
            <Header />

            <main className="flex-1 bg-secondary/30 py-12 px-4">
                <div className="max-w-xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-display font-bold">Claim Your Business</h1>
                        <p className="text-muted-foreground">
                            Verify your ownership by entering the phone number on your listing
                        </p>
                    </div>

                    {/* Business Card Preview */}
                    <div className="bg-card border border-border/50 rounded-xl p-6 flex items-start gap-4 shadow-sm">
                        <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center shrink-0">
                            <Building className="w-6 h-6 text-gold" />
                        </div>
                        <div>
                            <h2 className="font-display text-xl font-bold">{businessData?.business.name}</h2>
                            <p className="text-sm text-muted-foreground">{businessData?.city} • {businessData?.trade}</p>
                            <div className="mt-2 flex items-center gap-2 text-xs text-green-600 bg-green-500/10 px-2 py-1 rounded-full w-fit">
                                <CheckCircle2 className="w-3 h-3" />
                                Ready to claim
                            </div>
                        </div>
                    </div>

                    {/* Phone Verification Form */}
                    <form onSubmit={handleVerify} className="bg-card border border-border/50 rounded-xl p-8 shadow-lg space-y-6 animate-fade-up">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-gold" />
                                    Business Phone Number
                                </Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    required
                                    placeholder="Enter the phone number on your listing"
                                    className="h-12 text-lg"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Enter the exact phone number shown on your business listing to verify ownership.
                                </p>
                            </div>

                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-sm text-blue-400">
                                <p className="font-medium mb-1">📞 How it works:</p>
                                <p>If the phone number matches your listing, you'll be directed to complete your sign-up. If it doesn't match, you can contact us to verify your claim.</p>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gold hover:bg-gold/90 text-gold-foreground h-12 text-lg"
                            disabled={verifying}
                        >
                            {verifying ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                "Verify & Continue"
                            )}
                        </Button>

                        <p className="text-xs text-muted-foreground text-center">
                            Don't have access to this phone number?{" "}
                            <Link to="/contact" className="text-gold hover:underline">
                                Contact us directly
                            </Link>
                        </p>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
}
