import os
import re

file_path = os.path.join('..', 'src', 'pages', 'PremiumProfileEditor.tsx')

if not os.path.exists(file_path):
    print(f"Error: {file_path} not found")
    exit(1)

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Define the clean handleSave function
clean_handle_save = """    const handleSave = async () => {
        if (!business || !user) return;
        
        // Validation: Location limit (unless developer)
        if (!isDevUser && selectedLocations.length > locationLimit) {
            toast({
                title: "Location limit exceeded",
                description: `Your plan allows ${locationLimit} locations. Please remove some or upgrade.`,
                variant: "destructive"
            });
            return;
        }

        if (selectedLocations.length === 0) {
            toast({
                title: "Location required",
                description: "Please select at least one service location.",
                variant: "destructive"
            });
            return;
        }

        setSaving(true);
        try {
            let finalLogoUrl = business.logo_url;
            const finalPhotoUrls: string[] = [...photoPreviews.filter(url => url.startsWith('http'))];

            // Upload logo if new one selected
            if (logoFile) {
                const fileExt = logoFile.name.split('.').pop();
                const logoPath = `${business.id}/logo-${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('business-assets')
                    .upload(logoPath, logoFile);

                if (!uploadError) {
                    const { data: urlData } = supabase.storage
                        .from('business-assets')
                        .getPublicUrl(logoPath);
                    finalLogoUrl = urlData.publicUrl;
                }
            }

            // Upload new photos
            for (const file of photoFiles) {
                const fileExt = file.name.split('.').pop();
                const photoPath = `${business.id}/photos/photo-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
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

            const { error } = await supabase
                .from('businesses')
                .update({
                    name: companyName,
                    contact_name: contactName || null,
                    trade: selectedTrade,
                    city: selectedLocations[0], // Sync city with first location for search compatibility
                    selected_locations: selectedLocations,
                    logo_url: finalLogoUrl,
                    photos: finalPhotoUrls,
                    premium_description: description,
                    services_offered: selectedServices,
                    whatsapp_number: whatsappNumber || null,
                    website: website || null,
                    hidden_reviews: hiddenReviews,
                    is_premium: true,
                    tier: 'paid',
                    verified: true // Auto-verify premium profiles
                })
                .eq('id', business.id);

            if (error) throw error;

            toast({
                title: "Profile saved successfully",
                description: "Your changes are now live in search results.",
            });
            
            // Re-fetch data to sync state
            const { data } = await supabase.from('businesses').select('*').eq('id', business.id).single();
            if (data) {
                setBusiness(data);
                setPhotoPreviews(data.photos || []);
                setPhotoFiles([]);
            }

        } catch (error: any) {
            print('Save error:', error);
            toast({
                title: "Error saving profile",
                description: error.message || "Please try again.",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };"""

# Use a regex that can find the start and end of handleSave even with corruption in between
# We look for "const handleSave = async () => {" and the matching end "setSaving(false); };"
pattern = r"const handleSave = async \(\) => \{[\s\S]*?setSaving\(false\);\s+\};"

if re.search(pattern, content):
    new_content = re.sub(pattern, clean_handle_save, content)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully repaired handleSave in PremiumProfileEditor.tsx")
else:
    print("ERROR: Could not find handleSave block to replace")
    # Let's try an even more aggressive replacement if needed
    exit(1)
