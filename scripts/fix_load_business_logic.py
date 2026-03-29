import os
import re

file_path = os.path.join('..', 'src', 'pages', 'PremiumProfileEditor.tsx')

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update loadBusiness to handle multiple records and pick the latest one
old_load_business = r"const loadBusiness = async \(\) => \{[\s\S]+?        loadBusiness\(\);\n    \}, \[user\]\);"

new_load_business = """    const loadBusiness = async () => {
        if (!user) return;

        // Try to load the user's business from Supabase
        // We pick the most recently created one if multiple exist
        const { data, error } = await supabase
            .from('businesses')
            .select('id, name, trade, logo_url, photos, premium_description, services_offered, whatsapp_number, selected_locations, plan_type, website, hidden_reviews, contact_name')
            .eq('owner_user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1);

        if (error) {
            console.error("Error loading business:", error);
            setLoading(false);
            return;
        }

        let businessData: BusinessData;

        if (data && data.length > 0) {
            // Use the found business
            const d = data[0];
            businessData = {
                id: d.id,
                name: d.name || "",
                trade: d.trade || "plumber",
                logo_url: d.logo_url,
                photos: d.photos || [],
                premium_description: d.premium_description || "",
                services_offered: d.services_offered || [],
                whatsapp_number: d.whatsapp_number || null,
                selected_locations: d.selected_locations || [],
                plan_type: d.plan_type || 'basic',
                website: d.website || null,
                hidden_reviews: d.hidden_reviews || [],
                contact_name: d.contact_name || null
            };
        } else {
            // Auto-create only if NONE exist
            const businessId = `dev-test-${Date.now()}`;
            const { data: newBusiness, error: createError } = await supabase
                .from('businesses')
                .insert({
                    id: businessId,
                    slug: `dev-test-business-${Date.now()}`,
                    owner_user_id: user.id,
                    name: "Your Business",
                    trade: "plumber",
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

            if (createError) {
                console.error("Auto-create failed:", createError);
                toast({
                    title: "Auto-create failed",
                    description: "Could not create business profile. Please contact admin.",
                    variant: "destructive"
                });
                setLoading(false);
                return;
            }

            businessData = {
                id: newBusiness.id,
                name: newBusiness.name || "Your Business",
                trade: newBusiness.trade || "plumber",
                logo_url: newBusiness.logo_url,
                photos: newBusiness.photos || [],
                premium_description: newBusiness.premium_description || "",
                services_offered: newBusiness.services_offered || [],
                whatsapp_number: newBusiness.whatsapp_number || null,
                selected_locations: newBusiness.selected_locations || [],
                plan_type: 'paid',
                website: newBusiness.website || null,
                hidden_reviews: newBusiness.hidden_reviews || [],
                contact_name: newBusiness.contact_name || null
            };
        }

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

    useEffect(() => {
        loadBusiness();
    }, [user]);"""

# Use regex with re.DOTALL to match across lines
try:
    new_content = re.sub(old_load_business, new_load_business, content, flags=re.DOTALL)
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Successfully updated loadBusiness logic in PremiumProfileEditor.tsx")
    else:
        print("ERROR: Could not find loadBusiness block to replace. Check regex.")
except Exception as e:
    print(f"Replacement failed with error: {e}")
