import os
import re

def fix_profile_editor():
    path = os.path.join('..', 'src', 'pages', 'PremiumProfileEditor.tsx')
    if not os.path.exists(path):
        print("PremiumProfileEditor.tsx not found")
        return

    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Fix loadBusiness logic
    old_load = """    useEffect(() => {
        const loadBusiness = async () => {
            if (!user) return;

            const { data, error } = await supabase
                .from('businesses')
                .select('id, name, trade, logo_url, photos, premium_description, services_offered, whatsapp_number, selected_locations, plan_type, website, hidden_reviews, contact_name')
                .eq('owner_user_id', user.id)
                .single();

            if (error && error.code === 'PGRST116') {
                // No business found - user needs to contact admin
                setLoading(false);
                return;
            }

            if (data) {
                const businessData: BusinessData = {
                    id: data.id,
                    name: data.name || "",
                    trade: data.trade || "plumber",
                    logo_url: data.logo_url,
                    photos: data.photos || [],
                    premium_description: data.premium_description || "",
                    services_offered: data.services_offered || [],
                    whatsapp_number: data.whatsapp_number || null,
                    selected_locations: data.selected_locations || [],
                    plan_type: data.plan_type || 'basic',
                    website: data.website || null,
                    hidden_reviews: data.hidden_reviews || [],
                    contact_name: data.contact_name || null
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
            }
            setLoading(false);
        };

        loadBusiness();
    }, [user]);"""

    new_load = """    const loadBusiness = async () => {
        if (!user) return;

        // Load the user's business from Supabase
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
            // Auto-create if none exists
            const businessId = `dev-test-${Date.now()}`;
            const { data: newBusiness, error: createError } = await supabase
                .from('businesses')
                .insert({
                    id: businessId,
                    slug: `dev-test-business-${Date.now()}`,
                    owner_user_id: user.id,
                    name: "Your Business Name",
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
                setLoading(false);
                return;
            }

            businessData = {
                id: newBusiness.id,
                name: newBusiness.name || "Your Business Name",
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

    # Replace the whole useEffect block
    # We'll use a safer approach: find the indices of the brackets
    start_tag = "    useEffect(() => {\n        const loadBusiness = async () => {"
    end_tag = "    }, [user]);"
    
    if start_tag in content and end_tag in content:
        start_idx = content.find(start_tag)
        end_idx = content.find(end_tag, start_idx) + len(end_tag)
        content = content[:start_idx] + new_load + content[end_idx:]
        print("Fixed loadBusiness in PremiumProfileEditor.tsx")
    else:
        print("Could not find exact loadBusiness tags in PremiumProfileEditor.tsx")

    # 2. Fix handleSave logic
    # Find the update block
    old_update = """            const { error } = await supabase
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
                })"""
    
    new_update = """            const { error } = await supabase
                .from('businesses')
                .update({
                    name: companyName,
                    contact_name: contactName || null,
                    trade: selectedTrade,
                    city: selectedLocations[0], // Sync city field
                    selected_locations: selectedLocations,
                    logo_url: finalLogoUrl,
                    photos: allPhotoUrls,
                    premium_description: description,
                    services_offered: selectedServices,
                    whatsapp_number: whatsappNumber || null,
                    website: website || null,
                    hidden_reviews: hiddenReviews,
                    is_premium: true,
                    tier: 'paid',
                    verified: true // Auto-verify on save
                })"""
    
    if old_update in content:
        content = content.replace(old_update, new_update)
        print("Fixed handleSave in PremiumProfileEditor.tsx")
    else:
        print("Could not find exact handleSave tags in PremiumProfileEditor.tsx")

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def fix_business_card():
    path = os.path.join('..', 'src', 'components', 'BusinessCard.tsx')
    if not os.path.exists(path):
        print("BusinessCard.tsx not found")
        return

    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Apply Emerald Styling
    # Look for the gold styling and replace it
    pattern = r'isPremium\s\?\s"border-gold shadow-xl shadow-gold/10 bg-gradient-to-br from-gold/5 to-transparent"\s:\s"border-border/50 hover:border-gold/30"'
    replacement = 'isPremium ? "border-emerald-500 shadow-xl shadow-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent" : "border-border/50 hover:border-emerald-500/30"'
    
    if re.search(pattern, content):
        content = re.sub(pattern, replacement, content)
        print("Applied Emerald styling to BusinessCard.tsx")
    else:
        print("Could not find gold styling in BusinessCard.tsx")

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

fix_profile_editor()
fix_business_card()
