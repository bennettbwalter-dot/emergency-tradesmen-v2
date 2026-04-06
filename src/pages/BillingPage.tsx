import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { CreditCard, ShieldAlert, Loader2, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function BillingPage() {
    const { user, isLocked, isLoading: isAuthLoading } = useAuth();
    const { toast } = useToast();
    const [isSubLoading, setIsSubLoading] = useState(true);
    const [isPortalLoading, setIsPortalLoading] = useState(false);
    const [subscription, setSubscription] = useState<any>(null);

    useEffect(() => {
        const failsafe = setTimeout(() => setIsSubLoading(false), 3000);
        if (!user) return;

        async function fetchSubscription() {
            try {
                const { data, error } = await supabase
                    .from("subscriptions")
                    .select("*")
                    .eq("user_id", user?.id)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    console.error("Error fetching subscription:", error);
                } else if (data) {
                    setSubscription(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsSubLoading(false);
            }
        }

        fetchSubscription();

        // Check for return status in URL
        const params = new URLSearchParams(window.location.search);
        if (params.get('billing_updated') === 'true') {
            toast({
                title: "Subscription Updated",
                description: "Your billing preferences were successfully saved via the Stripe Portal.",
            });
            // Clean up URL
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, [user, toast]);

    const handleManageBilling = async () => {
        setIsPortalLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("No active session");

            // Assuming Edge Function named 'create-portal-session'
            const { data, error } = await supabase.functions.invoke('create-portal-session', {
                headers: {
                    Authorization: `Bearer ${session.access_token}`
                }
            });

            if (error) throw error;
            if (data?.url) {
                window.location.href = data.url;
            } else {
                throw new Error("Invalid portal response");
            }
        } catch (error: any) {
            console.error("Portal error:", error);
            if (error.message?.includes('No Stripe customer')) {
                toast({
                    title: "No subscription found",
                    description: "You don't have an active subscription yet. Visit our pricing page to get started.",
                    variant: "default"
                });
                window.location.href = '/pricing';
            } else {
                toast({
                    title: "Error connecting to Stripe",
                    description: "We couldn't open the billing portal. Please contact support.",
                    variant: "destructive"
                });
            }
        } finally {
            setIsPortalLoading(false);
        }
    };

    if (isAuthLoading || (user && isSubLoading)) {
        return <div className="flex justify-center items-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    if (!isAuthLoading && !user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <ShieldAlert className="w-12 h-12 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Authentication Required</h2>
                <p className="text-muted-foreground text-center">You must be logged in to manage your billing settings.</p>
                <Button onClick={() => window.location.href = '/login'}>Sign In</Button>
            </div>
        );
    }

    const planName = subscription?.plan ? subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1) : 'Free';
    const isCancelled = subscription?.status === 'canceled' || subscription?.status === 'cancelled';
    const endsAt = subscription?.subscription_expires_at || subscription?.subscription_ends_at;

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
            <p className="text-muted-foreground text-lg">
                Manage your plan, update payment methods, and view your billing history.
            </p>

            {isLocked && (
                <div className="bg-destructive/10 border border-destructive rounded-lg p-4 flex items-start gap-3">
                    <ShieldAlert className="text-destructive w-6 h-6 shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-destructive">Account Locked: Payment Failed</h3>
                        <p className="text-sm mt-1 mb-3">
                            We were unable to process your recent subscription payments. Access to premium features has been suspended until a valid payment method is provided.
                        </p>
                        <Button variant="destructive" size="sm" onClick={handleManageBilling} disabled={isPortalLoading}>
                            {isPortalLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Update Payment Details In Stripe
                        </Button>
                    </div>
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-primary" />
                            <CardTitle>Current Plan</CardTitle>
                        </div>
                        <CardDescription>Your current subscription tier</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-extrabold text-foreground mb-2">
                            {planName}
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground mt-4">
                            <div className="flex justify-between">
                                <span>Status:</span>
                                <span className="font-medium capitalize text-foreground">
                                    {isLocked ? 'Locked' : subscription?.status || 'Active'}
                                </span>
                            </div>
                            {endsAt && (
                                <div className="flex justify-between">
                                    <span>{isCancelled ? 'Ends On:' : 'Renews On:'}</span>
                                    <span className="font-medium text-foreground">
                                        {new Date(endsAt).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                            {subscription?.cancel_at_period_end && !isCancelled && !isLocked && (
                                <div className="mt-4 pt-4 border-t border-border/50 text-amber-600 dark:text-amber-500 font-medium">
                                    Your subscription is scheduled to be cancelled at the end of the billing period.
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button 
                            className="w-full" 
                            size="lg" 
                            onClick={handleManageBilling} 
                            disabled={isPortalLoading}
                        >
                            {isPortalLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            {planName === 'Free' ? "Upgrade Plan" : (subscription?.cancel_at_period_end ? "Reactivate Subscription" : "Manage Subscription")}
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="bg-muted/30">
                    <CardHeader>
                        <CardTitle>Stripe Customer Portal</CardTitle>
                        <CardDescription>Securely managed by Stripe</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-4">
                        <p>
                            Clicking the manage button will redirect you to your secure Stripe billing portal where you can:
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Upgrade or downgrade your subscription tier</li>
                            <li>Update your credit card and billing details</li>
                            <li>Cancel your subscription</li>
                            <li>Download previous PDF invoices and receipts</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
