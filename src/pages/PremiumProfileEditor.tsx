import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Upload, X, Save, Crown, Check, Image as ImageIcon, Building2 } from "lucide-react";

interface BusinessData {
    id: string;
    name: string;
    logo_url: string | null;
    photos: string[];
    premium_description: string | null;
    services_offered: string[];
    coverage_areas: string[];
    whatsapp_number: string | null;
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
    const [coverageAreas, setCoverageAreas] = useState("");
    const [whatsappNumber, setWhatsappNumber] = useState("");

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

            const { data, error } = await supabase
                .from('businesses')
                .select('id, name, logo_url, photos, premium_description, services_offered, coverage_areas, whatsapp_number')
                .eq('owner_user_id', user.id)
                .single();

            if (error) {
                // No business found - user needs to contact admin
                setLoading(false);
                return;
            }

            setBusiness(data);
            setLogoPreview(data.logo_url);
            setPhotoPreviews(data.photos || []);
            setDescription(data.premium_description || "");
            setSelectedServices(data.services_offered || []);
            setCoverageAreas((data.coverage_areas || []).join(", "));
            setWhatsappNumber(data.whatsapp_number || "");
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

            // Update business record
            const { error } = await supabase
                .from('businesses')
                .update({
                    logo_url: finalLogoUrl,
                    photos: allPhotoUrls,
                    premium_description: description,
                    services_offered: selectedServices,
                    coverage_areas: coverageAreas.split(',').map(a => a.trim()).filter(Boolean),
                    whatsapp_number: whatsappNumber || null,
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

                        {/* Coverage Areas */}
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h2 className="text-xl font-semibold mb-4">Coverage Areas</h2>
                            <Input
                                value={coverageAreas}
                                onChange={(e) => setCoverageAreas(e.target.value)}
                                placeholder="e.g., London, Manchester, Birmingham (comma separated)"
                            />
                            <p className="text-sm text-muted-foreground mt-2">Enter the cities/areas you serve, separated by commas</p>
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
