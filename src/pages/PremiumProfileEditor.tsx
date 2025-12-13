import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { trades, cities } from "@/lib/trades";
import { getLocationLimit, isDeveloper } from "@/lib/subscriptionService";
import { Switch } from "@/components/ui/switch";
import { Upload, X, Save, Crown, Check, Image as ImageIcon, Building2, MapPin, Briefcase, Globe, Star, EyeOff } from "lucide-react";

interface BusinessData {
    id: string;
    name: string;
    trade: string;
    logo_url: string | null;
    photos: string[];
    premium_description: string | null;
    services_offered: string[];
    whatsapp_number: string | null;
    selected_locations: string[];
    plan_type: string;
    website: string | null;
    hidden_reviews: string[];
    contact_name: string | null;
}

const SERVICE_OPTIONS = [
    "Emergency Callouts",
    "24/7 Availability",
    "Free Quotes",
    "Domestic Work",
    "Commercial Work",
    "Maintenance",
    "Installations",
    "Repairs",
    "Inspections",
    "Certifications"
];

export default function PremiumProfileEditor() {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [business, setBusiness] = useState<BusinessData | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [photoFiles, setPhotoFiles] = useState<File[]>([]);
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
    const [description, setDescription] = useState("");
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [whatsappNumber, setWhatsappNumber] = useState("");
    const [selectedTrade, setSelectedTrade] = useState("");
    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
    const [planType, setPlanType] = useState("basic");
    const [website, setWebsite] = useState("");
    const [hiddenReviews, setHiddenReviews] = useState<string[]>([]);
    const [companyName, setCompanyName] = useState("");
    const [contactName, setContactName] = useState("");

    // Calculate location limit based on plan and developer status
    const locationLimit = getLocationLimit(planType, user?.email);
    const isDevUser = isDeveloper(user?.email);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login?redirect=/premium-profile');
        }
    }, [isAuthenticated, navigate]);

    // Load user's business
    useEffect(() => {
        const loadBusiness = async () => {
            if (!user) return;

            let { data, error } = await supabase
                .from('businesses')
                .select('id, name, trade, logo_url, photos, premium_description, services_offered, coverage_areas, whatsapp_number, selected_locations, plan_type, website, hidden_reviews')
                .eq('owner_id', user.id) // Try owner_id first
                .single();

            if (!data) {
                // Try alternate column if schema changed
                const { data: altData } = await supabase
                    .from('businesses')
                    .select('id, name, trade, logo_url, photos, premium_description, services_offered, coverage_areas, whatsapp_number, selected_locations, plan_type, website, hidden_reviews')
                    .eq('owner_user_id', user.id)
                    .single();
                data = altData;
            }

            // Developer Auto-Create Logic
            const devEmails = ['nicholas.bennett247@gmail.com', 'bennett.b.walter@gmail.com'];
            if (!data && user.email && devEmails.includes(user.email.toLowerCase())) {
                console.log("Developer account missing business. Auto-creating...");
                const businessId = `dev-test-${Date.now()}`;
                const { data: newBusiness, error: createError } = await supabase
                    .from('businesses')
                    .insert({
                        id: businessId,
                        slug: `dev-test-business-${Date.now()}`,
                        owner_user_id: user.id,
                        name: "Developer Test Business",
                        trade: "electrician",
                        city: "London",
                        email: user.email,
                        phone: user.phone || "07700900000",
                        is_premium: true,
                        tier: 'paid',
                        verified: true,
                        hours: '24/7 Emergency Service',
                        is_open_24_hours: true
                    })
                    .select()
                    .single();

                if (newBusiness) {
                    data = newBusiness;
                    toast({
                        title: "Test Business Created",
                        description: "A dummy business profile has been created for testing.",
                    });
                } else if (createError) {
                    console.error("Failed to auto-create business:", createError);
                    toast({
                        title: "Auto-create failed",
                        description: createError.message || "Could not create test business",
                        variant: "destructive"
                    });
                }
            }

            if (!data) {
                // No business found - user needs to contact admin
                setLoading(false);
                return;
            }

            // Ensure data has all required fields
            const businessData: BusinessData = {
                id: data.id,
                name: data.name,
                trade: data.trade || '',
                logo_url: data.logo_url || null,
                photos: data.photos || [],
                premium_description: data.premium_description || null,
                services_offered: data.services_offered || [],
                whatsapp_number: data.whatsapp_number || null,
                selected_locations: data.selected_locations || [],
                plan_type: data.plan_type || 'basic',
                website: data.website || null,
                hidden_reviews: data.hidden_reviews || [],
                contact_name: data.contact_name || null,
            };

            setBusiness(businessData);
            setLogoPreview(businessData.logo_url);
            setPhotoPreviews(businessData.photos);
            setDescription(businessData.premium_description || "");
            setSelectedServices(businessData.services_offered);
            setWhatsappNumber(businessData.whatsapp_number || "");
            setSelectedTrade(businessData.trade);
            setSelectedLocations(businessData.selected_locations);
            setPlanType(businessData.plan_type);
            setWebsite(businessData.website || "");
            setHiddenReviews(businessData.hidden_reviews);
            setCompanyName(businessData.name || "");
            setContactName(businessData.contact_name || "");
            setLoading(false);
        };

        loadBusiness();
    }, [user]);

    const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    }, []);

    const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + photoPreviews.length > 5) {
            toast({
                title: "Too many photos",
                description: "Maximum 5 photos allowed",
                variant: "destructive"
            });
            return;
        }
        setPhotoFiles(prev => [...prev, ...files]);
        setPhotoPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    }, [photoPreviews.length, toast]);

    const removePhoto = (index: number) => {
        setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
        setPhotoFiles(prev => prev.filter((_, i) => i !== index));
    };

    const toggleService = (service: string) => {
        setSelectedServices(prev =>
            prev.includes(service)
                ? prev.filter(s => s !== service)
                : [...prev, service]
        );
    };

    const handleSave = async () => {
        if (!business || !user) return;

        // Validation: Trade is required
        if (!selectedTrade) {
            toast({
                title: "Trade required",
                description: "Please select your trade before saving.",
                variant: "destructive"
            });
            return;
        }

        // Validation: At least one location required
        if (selectedLocations.length === 0) {
            toast({
                title: "Location required",
                description: "Please select at least one service location.",
                variant: "destructive"
            });
            return;
        }

        // Validation: Location limit (unless developer)
        if (!isDevUser && selectedLocations.length > locationLimit) {
            toast({
                title: "Location limit exceeded",
                description: `Your plan allows ${locationLimit} location(s). Please remove some or upgrade.`,
                variant: "destructive"
            });
            return;
        }

        setSaving(true);

        try {
            let finalLogoUrl = business.logo_url;
            const finalPhotoUrls: string[] = [];

            // Upload logo if new one selected
            if (logoFile) {
                const logoPath = `${business.id}/logo-${Date.now()}.${logoFile.name.split('.').pop()}`;
                const { error: uploadError } = await supabase.storage
                    .from('business-assets')
                    .upload(logoPath, logoFile, { upsert: true });

                if (!uploadError) {
                    const { data: urlData } = supabase.storage
                        .from('business-assets')
                        .getPublicUrl(logoPath);
                    finalLogoUrl = urlData.publicUrl;
                }
            }

            // Upload new photos
            for (let i = 0; i < photoFiles.length; i++) {
                const file = photoFiles[i];
                const photoPath = `${business.id}/photos/photo-${Date.now()}-${i}.${file.name.split('.').pop()}`;
                const { error: uploadError } = await supabase.storage
                    .from('business-assets')
                    .upload(photoPath, file);

                if (!uploadError) {
                    const { data: urlData } = supabase.storage
                        .from('business-assets')
                        .getPublicUrl(photoPath);
                    finalPhotoUrls.push(urlData.publicUrl);
                }
            }

            // Combine existing URLs (those that start with http) with new uploads
            const existingUrls = photoPreviews.filter(url => url.startsWith('http'));
            const allPhotoUrls = [...existingUrls, ...finalPhotoUrls];

            // Update business record with all fields including trade and locations
            const { error } = await supabase
                .from('businesses')
                .update({
                    name: companyName,
                    contact_name: contactName || null,
                    trade: selectedTrade,
                    selected_locations: selectedLocations,
                    logo_url: finalLogoUrl,
                    photos: allPhotoUrls,
                    premium_description: description,
                    services_offered: selectedServices,
                    whatsapp_number: whatsappNumber || null,
                    website: website || null,
                    hidden_reviews: hiddenReviews,
                    is_premium: true,
                    tier: 'paid'
                })
                .eq('id', business.id);

            if (error) throw error;

            toast({
                title: "Profile saved!",
                description: "Your premium profile has been updated.",
            });

        } catch (error) {
            console.error('Save error:', error);
            toast({
                title: "Error saving",
                description: "Please try again.",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-background py-20">
                    <div className="container-wide text-center">
                        <p className="text-muted-foreground">Loading your profile...</p>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    if (!business) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-background py-20">
                    <div className="container-wide text-center max-w-lg mx-auto">
                        <Crown className="w-16 h-16 text-gold mx-auto mb-6" />
                        <h1 className="text-3xl font-display text-foreground mb-4">No Business Found</h1>
                        <p className="text-muted-foreground mb-6">
                            Your account isn't linked to a business yet. Please contact us to set up your premium listing.
                        </p>
                        <Button onClick={() => navigate('/pricing')}>View Pricing</Button>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="min-h-screen bg-background py-12">
                <div className="container-wide max-w-4xl">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 rounded-full bg-gold/20 flex items-center justify-center">
                            <Crown className="w-7 h-7 text-gold" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-display text-foreground">Premium Profile Editor</h1>
                            <p className="text-muted-foreground">Customize your listing to stand out</p>
                        </div>
                    </div>

                    <div className="grid gap-8">
                        {/* Company Name */}
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-gold" /> Company Name
                                <Badge variant="destructive" className="ml-2 text-xs">Required</Badge>
                            </h2>
                            <Input
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                placeholder="e.g., Smith's Emergency Plumbing"
                                className="max-w-md"
                            />
                            <p className="text-sm text-muted-foreground mt-2">
                                This is how your business will appear on listings.
                            </p>
                        </div>

                        {/* Contact Person Name */}
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Contact Person Name
                            </h2>
                            <Input
                                value={contactName}
                                onChange={(e) => setContactName(e.target.value)}
                                placeholder="e.g., John Smith"
                                className="max-w-md"
                            />
                            <p className="text-sm text-muted-foreground mt-2">
                                The name of the main contact for this business (optional, for internal use).
                            </p>
                        </div>

                        {/* Trade Selection - Required */}
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-gold" /> Your Trade
                                <Badge variant="destructive" className="ml-2 text-xs">Required</Badge>
                            </h2>
                            <Select value={selectedTrade} onValueChange={setSelectedTrade}>
                                <SelectTrigger className="w-full md:w-1/2">
                                    <SelectValue placeholder="Select your trade..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {trades.map((trade) => (
                                        <SelectItem key={trade.slug} value={trade.slug}>
                                            {trade.icon} {trade.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-sm text-muted-foreground mt-2">
                                This determines which trade category your listing appears in.
                            </p>
                        </div>

                        {/* Location Selection */}
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-gold" /> Service Locations
                                <Badge variant="outline" className="ml-2 text-xs">
                                    {selectedLocations.length}/{isDevUser ? '∞' : locationLimit}
                                </Badge>
                                {isDevUser && <Badge className="bg-purple-500 text-xs">Dev Override</Badge>}
                            </h2>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {selectedLocations.map((loc) => (
                                    <Badge key={loc} variant="secondary" className="px-3 py-1">
                                        {loc}
                                        <button
                                            onClick={() => setSelectedLocations(prev => prev.filter(l => l !== loc))}
                                            className="ml-2 hover:text-red-500"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                            {(selectedLocations.length < locationLimit || isDevUser) && (
                                <Select
                                    value=""
                                    onValueChange={(city) => {
                                        if (!selectedLocations.includes(city)) {
                                            setSelectedLocations(prev => [...prev, city]);
                                        }
                                    }}
                                >
                                    <SelectTrigger className="w-full md:w-1/2">
                                        <SelectValue placeholder="Add a location..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {cities.filter(c => !selectedLocations.includes(c)).map((city) => (
                                            <SelectItem key={city} value={city}>
                                                {city}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            <p className="text-sm text-muted-foreground mt-2">
                                {isDevUser
                                    ? "Developer mode: Unlimited locations"
                                    : planType === 'pro' || planType === 'enterprise'
                                        ? "Pro plan: Up to 3 locations (£99/year)"
                                        : "Basic plan: 1 location (£29/month). Upgrade for more!"
                                }
                            </p>
                        </div>

                        {/* Logo Upload */}
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-gold" /> Company Logo
                            </h2>
                            <div className="flex items-center gap-6">
                                <div className="w-32 h-32 rounded-xl bg-secondary border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <Upload className="w-8 h-8 text-muted-foreground" />
                                    )}
                                </div>
                                <div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        className="hidden"
                                        id="logo-upload"
                                    />
                                    <label htmlFor="logo-upload">
                                        <Button variant="outline" asChild>
                                            <span>Upload Logo</span>
                                        </Button>
                                    </label>
                                    <p className="text-sm text-muted-foreground mt-2">Recommended: 512x512px, PNG or JPG</p>
                                </div>
                            </div>
                        </div>

                        {/* Photo Gallery */}
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-gold" /> Photo Gallery
                                <span className="text-sm font-normal text-muted-foreground ml-auto">{photoPreviews.length}/5 photos</span>
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {photoPreviews.map((url, index) => (
                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                                        <img src={url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => removePhoto(index)}
                                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-4 h-4 text-white" />
                                        </button>
                                    </div>
                                ))}
                                {photoPreviews.length < 5 && (
                                    <label className="aspect-square rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-secondary/50 transition-colors">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handlePhotoUpload}
                                            className="hidden"
                                        />
                                        <Upload className="w-8 h-8 text-muted-foreground" />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h2 className="text-xl font-semibold mb-4">About Your Business</h2>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Tell customers about your experience, qualifications, and what makes you stand out..."
                                rows={5}
                                className="resize-none"
                            />
                            <p className="text-sm text-muted-foreground mt-2">{description.length}/500 characters</p>
                        </div>

                        {/* Services */}
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h2 className="text-xl font-semibold mb-4">Services Offered</h2>
                            <div className="flex flex-wrap gap-2">
                                {SERVICE_OPTIONS.map(service => (
                                    <Badge
                                        key={service}
                                        variant={selectedServices.includes(service) ? "default" : "outline"}
                                        className={`cursor-pointer py-2 px-4 ${selectedServices.includes(service) ? 'bg-gold text-black' : ''}`}
                                        onClick={() => toggleService(service)}
                                    >
                                        {selectedServices.includes(service) && <Check className="w-3 h-3 mr-1" />}
                                        {service}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* WhatsApp Number */}
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                WhatsApp Number
                            </h2>
                            <Input
                                value={whatsappNumber}
                                onChange={(e) => setWhatsappNumber(e.target.value)}
                                placeholder="e.g., 447123456789 (without + or spaces)"
                            />
                            <p className="text-sm text-muted-foreground mt-2">
                                Customers will see a WhatsApp button on your listing to message you directly.
                                Enter your number in international format (e.g., 447123456789 for UK).
                            </p>
                        </div>

                        {/* Website Link */}
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Globe className="w-5 h-5 text-blue-500" /> Website Link
                                <Badge className="bg-gold text-xs">Premium</Badge>
                            </h2>
                            <Input
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                placeholder="https://www.yourwebsite.com"
                                type="url"
                            />
                            <p className="text-sm text-muted-foreground mt-2">
                                Add your website URL to appear on your listing. Premium feature only.
                            </p>
                        </div>

                        {/* Review Visibility */}
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Star className="w-5 h-5 text-yellow-500" /> Review Visibility
                                <Badge className="bg-gold text-xs">Premium</Badge>
                            </h2>
                            <div className="space-y-4">
                                <p className="text-muted-foreground">
                                    As a premium member, you can hide individual reviews from your public listing.
                                    Once you receive reviews, they will appear here with toggles to show/hide each one.
                                </p>
                                {hiddenReviews.length > 0 ? (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <EyeOff className="w-4 h-4" />
                                        <span>{hiddenReviews.length} review(s) currently hidden</span>
                                    </div>
                                ) : (
                                    <p className="text-sm text-green-600">All reviews are visible on your listing.</p>
                                )}
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end">
                            <Button
                                variant="hero"
                                size="lg"
                                onClick={handleSave}
                                disabled={saving}
                                className="min-w-[200px]"
                            >
                                <Save className="w-5 h-5 mr-2" />
                                {saving ? "Saving..." : "Save Profile"}
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
