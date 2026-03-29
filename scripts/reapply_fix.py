import os

file_path = os.path.join('..', 'src', 'pages', 'PremiumProfileEditor.tsx')

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update the .update() block
old_update = """            const { error } = await supabase
                .from('businesses')
                .update({
                    name: companyName,
                    contact_name: contactName || null,
                    trade: selectedTrade,
                    selected_locations: selectedLocations,
                    logo_url: finalLogoUrl,
                    photos: finalPhotoUrls,
                    premium_description: description,
                    services_offered: selectedServices,
                    whatsapp_number: whatsappNumber || null,
                    website: website || null,
                    hidden_reviews: hiddenReviews,
                    is_premium: true,
                    tier: 'paid'
                })
                .eq('id', business.id);"""

new_update = """            const { error } = await supabase
                .from('businesses')
                .update({
                    name: companyName,
                    contact_name: contactName || null,
                    trade: selectedTrade,
                    city: selectedLocations[0], // Sync city field with first location for search indexing
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
                    verified: true // Automatically verify premium profiles so they appear in search
                })
                .eq('id', business.id);"""

if old_update in content:
    content = content.replace(old_update, new_update)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully re-applied visibility fix to PremiumProfileEditor.tsx")
else:
    print("ERROR: Could not find clean update block to replace")
