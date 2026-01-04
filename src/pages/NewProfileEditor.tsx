
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { isDeveloper } from "@/lib/subscriptionService";
import { Crown, ShieldCheck, Eye, CheckCircle2, ChevronRight, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Sub-components
import { IdentityTab } from "@/components/profile-editor/IdentityTab";
import { BrandingTab } from "@/components/profile-editor/BrandingTab";
import { ServiceAreaTab } from "@/components/profile-editor/ServiceAreaTab";
import { GalleryTab } from "@/components/profile-editor/GalleryTab";

const DARK_BG = "bg-slate-950";
const GOLD_BG = "bg-[#D4AF37]";

type TabType = "identity" | "branding" | "service-area" | "gallery";

export default function NewProfileEditor() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [searchParams] = useSearchParams();
    const adminOverrideId = searchParams.get('id');

    // States
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [creationError, setCreationError] = useState<string | null>(null);
    const [businessId, setBusinessId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>("identity");
    const [showWelcome, setShowWelcome] = useState(false);

    // Data State
    const [formData, setFormData] = useState({
        name: "",
        contact_name: "",
        trade: "",
        description: "",
        whatsapp: "",
        website: "",
        plan_type: "basic",
        services_offered: [] as string[],
        selected_locations: [] as string[]
    });

    const [files, setFiles] = useState({
        logo: null as File | null,
        header: null as File | null,
        vehicle: null as File | null,
        gallery: [] as File[]
    });

    const [previews, setPreviews] = useState({
        logo: null as string | null,
        header: null as string | null,
        vehicle: null as string | null,
        gallery: [] as string[]
    });

    const isDevUser = isDeveloper(user?.email);
    const isAdminArea = window.location.pathname.startsWith('/admin');
    const isAdmin = user?.email && import.meta.env.VITE_ADMIN_EMAIL && user.email.toLowerCase() === import.meta.env.VITE_ADMIN_EMAIL.toLowerCase();

    // Init Logic
    useEffect(() => {
        if (!authLoading && !isAuthenticated && !isAdminArea) {
            navigate('/login?redirect=/premium-profile');
        }
    }, [authLoading, isAuthenticated, isAdminArea, navigate]);

    const initBusiness = useCallback(async () => {
        if (authLoading || (!user && !isAdminArea)) return;

        try {
            console.log("Initializing Editor...");
            let query = supabase.from('businesses').select('*');

            if (adminOverrideId && (isAdmin || isDevUser || isAdminArea)) {
                query = query.eq('id', adminOverrideId);
            } else if (user) {
                query = query.eq('owner_user_id', user.id);
            } else {
                return;
            }

            const { data, error } = await query.maybeSingle();
            if (error) throw error;

            if (data) {
                mapBusinessData(data);
                // Check if this is a fresh profile to show welcome overlay
                const isFresh = !data.name || data.name === "Your Business Name";
                if (isFresh && !sessionStorage.getItem('welcome_seen')) {
                    setShowWelcome(true);
                    sessionStorage.setItem('welcome_seen', "true");
                }
            } else {
                if (adminOverrideId) {
                    setCreationError("Business ID not found.");
                    setLoading(false);
                    return;
                }
                const newId = `pro-${Date.now()}`;
                const { data: newData, error: createError } = await supabase
                    .from('businesses')
                    .insert({
                        id: newId,
                        slug: `pro-${Date.now()}`,
                        owner_user_id: user?.id,
                        name: "Your Business Name",
                        trade: "plumber",
                        city: "London",
                        email: user?.email,
                        phone: user?.phone || "07700000000",
                        is_premium: true,
                        tier: "paid",
                        verified: true,
                        hours: "24/7",
                        is_open_24_hours: true
                    })
                    .select()
                    .single();

                if (createError) throw createError;
                if (newData) {
                    mapBusinessData(newData);
                    setShowWelcome(true);
                }
            }
        } catch (err: any) {
            console.error(err);
            setCreationError("Failed to load profile: " + (err.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    }, [user, authLoading, adminOverrideId]);

    useEffect(() => { initBusiness(); }, [initBusiness]);

    const mapBusinessData = (data: any) => {
        setBusinessId(data.id);
        setFormData({
            name: data.name || "",
            contact_name: data.contact_name || "",
            trade: data.trade || "plumber",
            description: data.premium_description || "",
            whatsapp: data.whatsapp_number || "",
            website: data.website || "",
            plan_type: data.plan_type || "basic",
            services_offered: data.services_offered || [],
            selected_locations: data.selected_locations || []
        });
        setPreviews({
            logo: data.logo_url,
            header: data.header_image_url,
            vehicle: data.vehicle_image_url,
            gallery: data.photos || []
        });
    };

    const handleFile = (key: 'logo' | 'header' | 'vehicle', e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setFiles(prev => ({ ...prev, [key]: file }));
            setPreviews(prev => ({ ...prev, [key]: URL.createObjectURL(file) }));
        }
    };

    const handleSave = async () => {
        if (!businessId) return;
        setSaving(true);
        try {
            // Upload Images
            const upload = async (file: File, path: string) => {
                const { error } = await supabase.storage.from('business-assets').upload(path, file, { upsert: true });
                if (error) throw error;
                const { data } = supabase.storage.from('business-assets').getPublicUrl(path);
                return data.publicUrl;
            };

            let urls = {
                logo: previews.logo,
                header: previews.header,
                vehicle: previews.vehicle,
                gallery: previews.gallery.filter(url => url.startsWith('http'))
            };

            const ts = Date.now();
            if (files.logo) urls.logo = await upload(files.logo, `${businessId}/logo-${ts}`);
            if (files.header) urls.header = await upload(files.header, `${businessId}/header-${ts}`);
            if (files.vehicle) urls.vehicle = await upload(files.vehicle, `${businessId}/vehicle-${ts}`);

            for (let i = 0; i < files.gallery.length; i++) {
                const url = await upload(files.gallery[i], `${businessId}/gallery-${ts}-${i}`);
                urls.gallery.push(url);
            }

            // Save Data
            const { error } = await supabase.from('businesses').update({
                name: formData.name,
                contact_name: formData.contact_name,
                trade: formData.trade,
                premium_description: formData.description,
                whatsapp_number: formData.whatsapp,
                website: formData.website,
                selected_locations: formData.selected_locations,
                city: formData.selected_locations[0] || 'London',
                services_offered: formData.services_offered,
                logo_url: urls.logo,
                header_image_url: urls.header,
                vehicle_image_url: urls.vehicle,
                photos: urls.gallery,
                updated_at: new Date().toISOString()
            }).eq('id', businessId);

            if (error) throw error;
            toast({ title: "Profile Saved", description: "Your changes are now live!", className: "bg-green-600 text-white border-green-700" });

        } catch (e: any) {
            console.error(e);
            toast({ title: "Error", description: "Failed to save: " + e.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className={`min-h-screen flex items-center justify-center ${DARK_BG}`}><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div></div>;

    if (creationError) return (
        <div className={`min-h-screen flex items-center justify-center p-4 ${DARK_BG}`}>
            <Card className="bg-slate-900 border-red-900 max-w-md w-full">
                <CardContent className="p-6">
                    <h2 className="text-red-500 font-bold mb-2">Error</h2>
                    <p className="text-slate-300 mb-4">{creationError}</p>
                    <Button onClick={() => window.location.reload()} variant="destructive" className="w-full">Retry</Button>
                </CardContent>
            </Card>
        </div>
    );

    const TABS = [
        { id: "identity", label: "Identity" },
        { id: "branding", label: "Branding" },
        { id: "service-area", label: "Service Area" },
        { id: "gallery", label: "Gallery" }
    ];

    const CompletionWidget = () => {
        const checks = [
            !!formData.name,
            !!formData.contact_name && formData.contact_name.length > 0,
            previews.logo !== null,
            previews.header !== null,
            formData.selected_locations.length > 0
        ];
        const completed = checks.filter(Boolean).length;
        const total = checks.length;
        const pct = Math.round((completed / total) * 100);

        return (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex items-center gap-4">
                <div className="relative h-12 w-12 flex items-center justify-center">
                    <svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 36 36">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1e293b" strokeWidth="4" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#D4AF37" strokeWidth="4" strokeDasharray={`${pct}, 100`} />
                    </svg>
                    <span className="absolute text-xs font-bold text-white">{pct}%</span>
                </div>
                <div>
                    <h4 className="text-sm font-bold text-white">Profile Strength</h4>
                    <p className="text-xs text-slate-400">Complete all sections to rank higher.</p>
                </div>
            </div>
        );
    };

    return (
        <div className={`min-h-screen ${DARK_BG} text-slate-100 flex flex-col`}>
            {!isAdminArea && <Header />}

            <main className={`flex-1 container max-w-6xl mx-auto ${isAdminArea ? 'p-4' : 'py-10 px-4'}`}>

                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10 pb-6 border-b border-slate-800">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Badge className={`${GOLD_BG} text-black font-bold px-3`}>
                                <Crown className="w-3 h-3 mr-1" /> PRO
                            </Badge>
                            <Badge variant="outline" className="text-green-400 border-green-900 bg-green-900/10">
                                <ShieldCheck className="w-3 h-3 mr-1" /> Verified Business
                            </Badge>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-white tracking-tight">Profile Editor</h1>
                            <p className="text-slate-400 mt-1">Manage your premium business listing and SEO settings.</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        <CompletionWidget />
                        <div className="flex gap-2">
                            <Button variant="outline" asChild className="h-full border-slate-700 hover:bg-slate-800 text-slate-300">
                                <a href={`/business/${businessId}`} target="_blank" rel="noreferrer"><Eye className="w-4 h-4 mr-2" /> View Live</a>
                            </Button>
                            <Button onClick={handleSave} disabled={saving} className={`${GOLD_BG} hover:bg-yellow-600 text-black font-bold px-8 shadow-lg shadow-yellow-900/20 h-auto`}>
                                {saving ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Sidebar Tabs */}
                    <div className="lg:col-span-3 space-y-2">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-between group ${activeTab === tab.id
                                        ? "bg-slate-800 text-white border-l-4 border-[#D4AF37]"
                                        : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                                    }`}
                            >
                                {tab.label}
                                {activeTab === tab.id && <ChevronRight className="w-4 h-4 text-[#D4AF37]" />}
                            </button>
                        ))}
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-9 min-h-[500px]">
                        <AnimatePresence mode="wait">
                            {activeTab === "identity" && <IdentityTab key="identity" formData={formData} setFormData={setFormData} />}
                            {activeTab === "branding" && <BrandingTab key="branding" previews={previews} handleFile={handleFile} />}
                            {activeTab === "service-area" && <ServiceAreaTab key="service-area" formData={formData} setFormData={setFormData} />}
                            {activeTab === "gallery" && <GalleryTab key="gallery" previews={previews} setPreviews={setPreviews} files={files} setFiles={setFiles} />}
                        </AnimatePresence>
                    </div>
                </div>

            </main>
            {!isAdminArea && <Footer />}

            {/* Welcome Overlay */}
            <AnimatePresence>
                {showWelcome && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-8 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#D4AF37] to-yellow-600" />
                            <div className="mb-6 flex justify-center">
                                <div className="h-16 w-16 bg-[#D4AF37]/20 rounded-full flex items-center justify-center ring-4 ring-[#D4AF37]/10">
                                    <Crown className="w-8 h-8 text-[#D4AF37]" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-white text-center mb-2">Welcome to Pro!</h2>
                            <p className="text-slate-400 text-center mb-8">
                                Your account is now active. Let's set up your profile so you can start getting leads instantly.
                            </p>

                            <div className="space-y-3 mb-8">
                                <div className="flex items-center gap-3 text-slate-300 p-3 bg-slate-950 rounded-lg">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    <span>Upload your business logo</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-300 p-3 bg-slate-950 rounded-lg">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    <span>Select your service areas</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-300 p-3 bg-slate-950 rounded-lg">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    <span>Add portfolio photos</span>
                                </div>
                            </div>

                            <Button onClick={() => setShowWelcome(false)} className="w-full bg-[#D4AF37] hover:bg-yellow-600 text-black font-bold h-12 text-lg">
                                Start Setup
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
