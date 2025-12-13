import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { getBusinessById } from "@/lib/businesses";
import { db } from "@/lib/db";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Building, ShieldCheck, CheckCircle2 } from "lucide-react";
import { AuthModal } from "@/components/AuthModal";

export default function ClaimBusinessPage() {
    const { businessId } = useParams<{ businessId: string }>();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [businessData, setBusinessData] = useState<any>(null);
    const [status, setStatus] = useState<'unclaimed' | 'pending' | 'verified' | null>(null);

    // Form State
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [agreed, setAgreed] = useState(false);

    useEffect(() => {
        if (user) {
            setEmail(user.email || "");
        }
    }, [user]);

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
            setPhone(staticData.business.phone || "");

            // 2. Get DB Status
            try {
                const dbData = await db.businesses.getClaimStatus(businessId);
                if (dbData) {
                    setStatus(dbData.claim_status);

                    // If verified or pending, and not owned by me (which we can't check easily without blocking read, 
                    // but status check is enough for basic UI), maybe redirect?
                    // For now, let's just show status.
                    if (dbData.claim_status === 'verified') {
                        // Already verified
                    }
                } else {
                    setStatus('unclaimed');
                }
            } catch (err) {
                console.error(err);
                // Assume unclaimed if error or not found?
                setStatus('unclaimed');
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [businessId, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agreed) {
            toast({
                title: "Agreement required",
                description: "You must agree to the terms to claim this business.",
                variant: "destructive"
            });
            return;
        }

        if (!businessId) return;

        setSubmitting(true);
        try {
            await db.businesses.claim(businessId, email, phone);

            toast({
                title: "Claim Submitted!",
                description: "We will review your claim and contact you shortly for verification.",
            });

            // Navigate to dashboard or show success state
            navigate("/user/dashboard");
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Claim Failed",
                description: error.message || "Something went wrong. Please try again.",
                variant: "destructive"
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
        );
    }

    // Already Verified/Pending State
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
                            Take control of your profile on Emergency Tradesmen
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

                    {/* Auth Check */}
                    {!isAuthenticated ? (
                        <div className="bg-card border border-gold/20 rounded-xl p-8 text-center space-y-6 shadow-lg">
                            <h3 className="text-xl font-medium">Log in to continue</h3>
                            <p className="text-muted-foreground">
                                You need an account to manage your business profile.
                            </p>
                            <AuthModal
                                defaultTab="register"
                                trigger={
                                    <Button className="w-full bg-gold hover:bg-gold/90 text-gold-foreground">
                                        Create Account or Log In
                                    </Button>
                                }
                            />
                        </div>
                    ) : (
                        /* Claim Form */
                        <form onSubmit={handleSubmit} className="bg-card border border-border/50 rounded-xl p-8 shadow-lg space-y-6 animate-fade-up">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Business Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                        placeholder="contact@business.com"
                                    />
                                    <p className="text-xs text-muted-foreground">We'll send verification details here.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Business Phone</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        required
                                        placeholder="07700 900000"
                                    />
                                    <p className="text-xs text-muted-foreground">Must match the phone number on your profile for verification.</p>
                                </div>

                                <div className="flex items-start space-x-3 pt-4 border-t border-border/50">
                                    <Checkbox
                                        id="terms"
                                        checked={agreed}
                                        onCheckedChange={(c) => setAgreed(c as boolean)}
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                        <Label
                                            htmlFor="terms"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            I verify that I am the owner or authorized representative of this business.
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            By claiming this business, you agree to our <Link to="/terms" className="underline hover:text-gold">Terms of Service</Link>.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gold hover:bg-gold/90 text-gold-foreground h-12 text-lg"
                                disabled={submitting || !agreed}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Submitting Claim...
                                    </>
                                ) : (
                                    "Submit Claim Request"
                                )}
                            </Button>
                        </form>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
