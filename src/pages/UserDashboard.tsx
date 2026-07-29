import { useState, useEffect } from "react";
import { Navigate, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Heart, History, Settings, Loader2, MapPin, Calendar, Clock, Phone, Mail, Zap, Crown, ShieldCheck, Globe, CheckCircle, FileText, MessageCircle, MousePointerClick, PhoneCall } from "lucide-react";
import { getFavorites, getQuoteHistory, removeFavorite, User as UserType } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { getPostcodeLabel, getPostcodePlaceholder } from "@/lib/siteConfig";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ChatSystem } from "@/components/ChatSystem";
import { supabase } from "@/lib/supabase";
import { SEO } from "@/components/SEO";
import { fetchQuotesByBusiness, type Quote } from "@/lib/quoteService";
import { getLeadMetrics, type LeadMetrics } from "@/lib/leadTracking";

export default function UserDashboard() {
    const { user, isAuthenticated, isLoading, updateUser } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const defaultTab = searchParams.get("tab") || "profile";
    const { toast } = useToast();

    // Availability & Premium State
    const [isAvailable, setIsAvailable] = useState(false);
    const [businessProfile, setBusinessProfile] = useState<any>(null);
    const [isPremium, setIsPremium] = useState(false);

    useEffect(() => {
        if (user) {
            checkAvailability();
            checkPremiumStatus();
        }
    }, [user]);

    async function checkPremiumStatus() {
        // Import dynamically to avoid circular dependencies if any
        const { hasAccess } = await import("@/lib/subscriptionService");
        const premium = await hasAccess('professional');
        setIsPremium(premium);
    }

    async function checkAvailability() {
        const { data: businesses } = await supabase
            .from('businesses')
            .select('*')
            .or(`owner_user_id.eq.${user?.id},owner_id.eq.${user?.id}`);

        const data = businesses?.[0];

        if (data) {
            setBusinessProfile(data);
            // Strict logic: explicit flag OR recent ping logic
            const lastPing = data.last_available_ping ? new Date(data.last_available_ping) : null;
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            const isLive = !!data.is_available_now || (!!lastPing && lastPing > oneHourAgo);
            setIsAvailable(isLive);
        }
    }

    async function toggleAvailability() {
        if (!businessProfile) return;

        const newStatus = !isAvailable;
        const pingTime = newStatus ? new Date().toISOString() : null; // Only update ping if going online

        setIsAvailable(newStatus); // Optimistic update

        const updateData: any = {
            is_available_now: newStatus
        };

        if (newStatus) {
            updateData.last_available_ping = pingTime;
        }

        const { error } = await supabase
            .from('businesses')
            .update(updateData)
            .eq('id', businessProfile.id);

        if (error) {
            console.error('Error updating availability', error);
            setIsAvailable(!newStatus); // Revert
            toast({ title: "Error", description: "Could not update status", variant: "destructive" });
        } else {
            toast({
                title: newStatus ? "You are LIVE!" : "You are offline",
                description: newStatus ? "Customers can see you are available now." : "Your availability badge is hidden.",
                // Green for live, Red/Default for offline
                className: newStatus ? "border-green-500 bg-green-500/10 text-green-900 dark:text-green-100" : ""
            });
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login?redirect=/user/dashboard" replace />;
    }

    return (
        <>
            <SEO title="My Dashboard" noIndex />
            <Header />
            <main className="min-h-screen bg-background py-12">
                <div className="container max-w-5xl">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Sidebar / User Info */}
                        <Card className="w-full md:w-80 shrink-0">
                            <CardHeader className="text-center">
                                <div className="mx-auto mb-4 w-24 h-24 relative">
                                    <Avatar className="w-24 h-24 border-2 border-gold/20">
                                        <AvatarImage src={user.avatar} />
                                        <AvatarFallback className="text-2xl bg-gold/10 text-gold">
                                            {user.name.split(" ").map(n => n[0]).join("").substring(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>
                                    {/* Availability Status Dot on Avatar */}
                                    {isAvailable && (
                                        <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full animate-pulse" title="You are Online" />
                                    )}
                                </div>
                                <CardTitle>{user.name}</CardTitle>
                                <CardDescription>{user.email}</CardDescription>

                                {/* Availability Toggle Button */}
                                {businessProfile && (
                                    <div className="mt-4 p-3 bg-secondary/30 rounded-lg border border-border">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium">Availability</span>
                                            <div
                                                className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors duration-300 ${isAvailable ? 'bg-green-500' : 'bg-slate-300'}`}
                                                onClick={toggleAvailability}
                                            >
                                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${isAvailable ? 'translate-x-5' : 'translate-x-0'}`} />
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground text-left">
                                            {isAvailable ? "You are visible as 'Reviewing Quotes'" : "Set to 'Offline'"}
                                        </p>
                                    </div>
                                )}

                                {/* Upgrade Button / Premium Controls */}
                                <div className="mt-4">
                                    {isPremium ? (
                                        <div className="space-y-2">
                                            <Badge className="w-full justify-center py-1 bg-gradient-to-r from-gold to-yellow-500 text-black border-none">
                                                <Zap className="w-3 h-3 mr-1 fill-current" /> Premium Active
                                            </Badge>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full border-gold text-gold hover:bg-gold hover:text-white"
                                                onClick={() => window.location.href = '/premium-profile'}
                                            >
                                                Edit Premium Profile
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full border-gold text-gold hover:bg-gold hover:text-white"
                                            onClick={() => window.location.href = '/pricing'}
                                        >
                                            <Zap className="w-4 h-4 mr-2" />
                                            Upgrade Business
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4 text-sm">
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <Phone className="w-4 h-4" />
                                        <span>{user.phone || "No phone added"}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <MapPin className="w-4 h-4" />
                                        <span>{user.postcode || "No postcode added"}</span>
                                    </div>
                                    <div className="pt-4 border-t border-border/50">
                                        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Member Since</p>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gold" />
                                            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Main Content */}
                        <div className="flex-1 w-full space-y-6">
                            {isPremium && (
                                <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-gold/20 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                        <Crown className="w-16 h-16 text-gold" />
                                    </div>
                                    <h2 className="text-xl font-bold text-white mb-1">Thank you for being a Pro member!</h2>
                                    <p className="text-slate-400 text-sm max-w-md">We're glad to have you in the family. Your professional profile is active and helping customers find you.</p>
                                </div>
                            )}

                            <Tabs value={defaultTab} onValueChange={(tab) => navigate(`?tab=${tab}`, { replace: true })} className="w-full">
                                <TabsList className={`grid w-full ${isPremium ? "grid-cols-3 md:grid-cols-6" : "grid-cols-3 md:grid-cols-5"} mb-8`}>
                                    <TabsTrigger value="profile"><User className="w-4 h-4 mr-2" />Profile</TabsTrigger>
                                    <TabsTrigger value="location"><MapPin className="w-4 h-4 mr-2" />Location</TabsTrigger>
                                    <TabsTrigger value="vetting"><ShieldCheck className="w-4 h-4 mr-2" />Vetting</TabsTrigger>
                                    {isPremium && <TabsTrigger value="leads"><FileText className="w-4 h-4 mr-2" />Leads</TabsTrigger>}
                                    <TabsTrigger value="favorites"><Heart className="w-4 h-4 mr-2" />Favorites</TabsTrigger>
                                    <TabsTrigger value="settings"><Settings className="w-4 h-4 mr-2" />Settings</TabsTrigger>
                                </TabsList>

                                <TabsContent value="profile" className="space-y-6 animate-fade-up">
                                    <ProfileTab user={user} onUpdate={updateUser} />
                                </TabsContent>



                                <TabsContent value="location" className="animate-fade-up">
                                    <LocationTab user={user} business={businessProfile} />
                                </TabsContent>
                                
                                <TabsContent value="vetting" className="animate-fade-up">
                                    <VettingTab />
                                </TabsContent>

                                {isPremium && (
                                    <TabsContent value="leads" className="animate-fade-up">
                                        <LeadsTab business={businessProfile} />
                                    </TabsContent>
                                )}

                                <TabsContent value="favorites" className="animate-fade-up">
                                    <FavoritesTab />
                                </TabsContent>

                                <TabsContent value="settings" className="animate-fade-up">
                                    <SettingsTab isPremium={isPremium} />
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

function LeadsTab({ business }: { business: { id: string; name: string } | null }) {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [metrics, setMetrics] = useState<LeadMetrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!business?.id) {
            setLoading(false);
            return;
        }

        Promise.all([fetchQuotesByBusiness(business.id), getLeadMetrics(business.id)])
            .then(([nextQuotes, nextMetrics]) => {
                setQuotes(nextQuotes);
                setMetrics(nextMetrics);
            })
            .finally(() => setLoading(false));
    }, [business?.id]);

    if (!business) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Set up your Pro listing</CardTitle>
                    <CardDescription>Finish your business profile to start receiving and measuring customer leads.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button className="bg-gold text-gold-foreground hover:bg-gold/90" onClick={() => window.location.href = "/premium-profile"}>
                        Open Profile Editor
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (loading) {
        return <div className="flex justify-center py-14"><Loader2 className="h-7 w-7 animate-spin text-gold" /></div>;
    }

    const totalActions = (metrics?.call_click || 0) + (metrics?.whatsapp_click || 0) + (metrics?.website_click || 0);

    return (
        <div className="space-y-6">
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Pro lead report</p>
                <h2 className="mt-1 font-display text-3xl font-bold">Customer activity for {business.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">Last 30 days. Quote requests contain customer contact details. Contact actions record intent, not completed calls.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: "Quote requests", value: quotes.length, Icon: FileText },
                    { label: "Call clicks", value: metrics?.call_click || 0, Icon: PhoneCall },
                    { label: "WhatsApp clicks", value: metrics?.whatsapp_click || 0, Icon: MessageCircle },
                    { label: "Website clicks", value: metrics?.website_click || 0, Icon: MousePointerClick },
                ].map(({ label, value, Icon }) => (
                    <Card key={label} className="border-gold/15 bg-card/70">
                        <CardContent className="flex items-center justify-between p-5">
                            <div><p className="text-2xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>
                            <Icon className="h-5 w-5 text-gold" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-border/80">
                <CardHeader>
                    <CardTitle>Recent quote requests</CardTitle>
                    <CardDescription>{totalActions} tracked contact action{totalActions === 1 ? "" : "s"} alongside these requests.</CardDescription>
                </CardHeader>
                <CardContent>
                    {quotes.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-border px-5 py-8 text-center text-sm text-muted-foreground">Quote requests from your Pro profile will appear here.</p>
                    ) : (
                        <div className="space-y-3">
                            {quotes.slice(0, 10).map((quote) => (
                                <article key={quote.id} className="rounded-xl border border-border bg-secondary/15 p-4">
                                    <div className="flex flex-col justify-between gap-2 sm:flex-row">
                                        <div><p className="font-semibold">{quote.customerName}</p><p className="text-sm text-muted-foreground">{quote.customerPhone} · {quote.customerEmail}</p></div>
                                        <Badge variant="outline" className="h-fit w-fit">{quote.urgency}</Badge>
                                    </div>
                                    <p className="mt-3 text-sm leading-relaxed text-foreground/85">{quote.details}</p>
                                    <p className="mt-3 text-xs text-muted-foreground">Received {new Date(quote.createdAt).toLocaleString()}</p>
                                </article>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function ProfileTab({ user, onUpdate }: { user: UserType; onUpdate: (data: Partial<UserType>) => void }) {
    const [name, setName] = useState(user.name);
    const [phone, setPhone] = useState(user.phone || "");
    const [postcode, setPostcode] = useState(user.postcode || "");
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));

        onUpdate({ name, phone, postcode });
        setIsSaving(false);

        toast({
            title: "Profile updated",
            description: "Your changes have been saved successfully.",
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your contact details and address</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                value={user.email}
                                disabled
                                className="bg-secondary/30"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+44 7123 456789"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="postcode">Default {getPostcodeLabel()}</Label>
                            <Input
                                id="postcode"
                                value={postcode}
                                onChange={(e) => setPostcode(e.target.value)}
                                placeholder={getPostcodePlaceholder()}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={isSaving} className="bg-gold hover:bg-gold/90 text-gold-foreground">
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

function FavoritesTab() {
    const [favorites, setFavorites] = useState(getFavorites());
    const { toast } = useToast();

    const handleRemove = (id: string, name: string) => {
        removeFavorite(id);
        setFavorites(getFavorites());
        toast({
            title: "Removed favorite",
            description: `${name} has been removed from your list.`
        });
    };

    if (favorites.length === 0) {
        return (
            <div className="p-12 text-center text-muted-foreground bg-card rounded-lg border border-border/50">
                <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No favorites yet</h3>
                <p>Save businesses to your favorites list for quick access later.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4">
            {favorites.map((fav) => (
                <Card key={fav.id} className="overflow-hidden">
                    <div className="p-6 flex flex-col md:flex-row justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="border-gold/30 text-gold bg-gold/5">
                                    {fav.tradeName}
                                </Badge>
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> {fav.city}
                                </span>
                            </div>
                            <h3 className="text-xl font-display font-medium mb-1">{fav.businessName}</h3>
                            <p className="text-sm text-muted-foreground">Saved on {new Date(fav.savedAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" onClick={() => handleRemove(fav.businessId, fav.businessName)}>
                                Remove
                            </Button>
                            <Button asChild className="bg-gold hover:bg-gold/90 text-gold-foreground">
                                <a href={`/${fav.tradeName.toLowerCase().replace(/\s+/g, '-')}/${fav.city.toLowerCase()}`}>
                                    View Business
                                </a>
                            </Button>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}

function LocationTab({ user, business }: { user: UserType; business: any }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gold" />
                    Service Location
                </CardTitle>
                <CardDescription>Manage where you provide your services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="p-4 bg-secondary/20 rounded-xl border border-border/50">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                            <Globe className="w-6 h-6 text-gold" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Primary Service Area</p>
                            <p className="text-lg font-bold">{user.postcode || "Not Set"}</p>
                        </div>
                    </div>
                    {business ? (
                        <div className="pt-4 border-t border-border/50">
                            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2 font-bold">Business Coverage</p>
                            <p className="text-sm">Your business <strong>{business.name}</strong> is currently listed for emergency services in this region.</p>
                            <Button variant="link" className="p-0 h-auto text-gold mt-2" onClick={() => window.location.href = '/premium-profile'}>
                                Edit Service Area in Profile Editor →
                            </Button>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground mt-2 italic">Register your business to set up a specific coverage radius.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function VettingTab() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    Vetting & Verification
                </CardTitle>
                <CardDescription>Your current standing and verification status</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                        <CheckCircle className="w-5 h-5 text-emerald-500 mt-1 shrink-0" />
                        <div>
                            <p className="font-bold text-foreground">Account Reviewed</p>
                            <p className="text-sm text-muted-foreground">Your account is active and eligible to receive leads.</p>
                        </div>
                    </div>
                    
                    <div className="pt-4">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Standard Requirements</h4>
                        <ul className="space-y-3">
                            {[
                                "Identity Verification (Govt. ID)",
                                "Public Liability Insurance Proof",
                                "Trade Certification Audit",
                                "Background Screening Completed"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm">
                                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <Button variant="outline" className="w-full mt-4" onClick={() => window.location.href = '/vetting-process'}>
                        View Full Vetting Policy
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}



function SettingsTab({ isPremium }: { isPremium: boolean }) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isChanging, setIsChanging] = useState(false);
    const { toast } = useToast();

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (newPassword.length < 6) {
            toast({
                title: "Password too short",
                description: "Password must be at least 6 characters.",
                variant: "destructive"
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            toast({
                title: "Passwords don't match",
                description: "Please make sure both passwords are the same.",
                variant: "destructive"
            });
            return;
        }

        setIsChanging(true);

        try {
            // Import supabase directly for auth operations
            const { supabase } = await import("@/lib/supabase");

            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) {
                throw error;
            }

            toast({
                title: "Password updated",
                description: "Your password has been changed successfully."
            });

            // Clear form
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            toast({
                title: "Error changing password",
                description: error.message || "Please try again later.",
                variant: "destructive"
            });
        } finally {
            setIsChanging(false);
        }
    };

    return (
        <div className="space-y-6">
            {isPremium && (
                <Card className="border-gold/20 bg-gold/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-gold" />
                            Business Profile
                        </CardTitle>
                        <CardDescription>
                            Your Pro subscription is active. Manage your business listing and SEO settings.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            className="bg-gold hover:bg-gold/90 text-gold-foreground"
                            onClick={() => window.location.href = '/premium-profile'}
                        >
                            Open Profile Editor
                        </Button>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-gold" />
                        Change Password
                    </CardTitle>
                    <CardDescription>
                        Update your password to keep your account secure.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button
                                type="submit"
                                disabled={isChanging}
                                className="bg-gold hover:bg-gold/90 text-gold-foreground"
                            >
                                {isChanging ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Update Password
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                        Manage how you receive updates and alerts.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">
                        Email notification preferences coming soon.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
