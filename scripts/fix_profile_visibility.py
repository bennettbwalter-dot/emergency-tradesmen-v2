import os

file_path = os.path.join('..', 'src', 'pages', 'PremiumProfileEditor.tsx')

if not os.path.exists(file_path):
    print(f"Error: {file_path} not found")
    exit(1)

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the update block in handleSave
old_update_block = """            const { error } = await supabase
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
                .eq('id', business.id);"""

new_update_block = """            const { error } = await supabase
                .from('businesses')
                .update({
                    name: companyName,
                    contact_name: contactName || null,
                    trade: selectedTrade,
                    city: selectedLocations[0], // Sync city with first location for search compatibility
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
                    verified: true // Auto-verify premium profiles
                })
                .eq('id', business.id);"""

if old_update_block in content:
    content = content.replace(old_update_block, new_update_block)
    print("Successfully updated PremiumProfileEditor.tsx")
else:
    print("Could not find exact update block, trying flexible match...")
    import re
    # Try to find and replace with regex
    pattern = r"(const { error } = await supabase\s+\.from\('businesses'\)\s+\.update\({[^}]+tier: 'paid')\s*}\)"
    replacement = r"\1,\n                    verified: true // Auto-verify premium profiles\n                })"
    
    if re.search(pattern, content, re.DOTALL):
        content = re.sub(pattern, replacement, content, flags=re.DOTALL)
        print("Applied flexible regex update")
    else:
        print("ERROR: Could not find update block to modify")
        exit(1)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("PremiumProfileEditor.tsx updated successfully")
