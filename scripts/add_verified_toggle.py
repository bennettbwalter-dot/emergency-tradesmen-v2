import os

file_path = os.path.join('..', 'src', 'components', 'admin', 'BusinessModal.tsx')

if not os.path.exists(file_path):
    print(f"Error: {file_path} not found")
    exit(1)

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add verified to formData state
old_form_data = """    const [formData, setFormData] = useState({
        id: "",
        name: "",
        slug: "",
        trade: "plumber",
        city: "",
        address: "",
        postcode: "",
        phone: "",
        email: "",
        website: "",
        hours: "Open 24 hours",
        is_open_24_hours: true,
        is_available_now: true,
    });"""

new_form_data = """    const [formData, setFormData] = useState({
        id: "",
        name: "",
        slug: "",
        trade: "plumber",
        city: "",
        address: "",
        postcode: "",
        phone: "",
        email: "",
        website: "",
        hours: "Open 24 hours",
        is_open_24_hours: true,
        is_available_now: true,
        verified: false,
    });"""

content = content.replace(old_form_data, new_form_data)

# 2. Update useEffect to include verified
old_use_effect_set = """            setFormData({
                id: business.id || "",
                name: business.name || "",
                slug: business.slug || "",
                trade: business.trade || "plumber",
                city: business.city || "",
                address: business.address || "",
                postcode: business.postcode || "",
                phone: business.phone || "",
                email: business.email || "",
                website: business.website || "",
                hours: business.hours || "Open 24 hours",
                is_open_24_hours: business.is_open_24_hours ?? true,
                is_available_now: business.is_available_now ?? true,
            });"""

new_use_effect_set = """            setFormData({
                id: business.id || "",
                name: business.name || "",
                slug: business.slug || "",
                trade: business.trade || "plumber",
                city: business.city || "",
                address: business.address || "",
                postcode: business.postcode || "",
                phone: business.phone || "",
                email: business.email || "",
                website: business.website || "",
                hours: business.hours || "Open 24 hours",
                is_open_24_hours: business.is_open_24_hours ?? true,
                is_available_now: business.is_available_now ?? true,
                verified: business.verified ?? false,
            });"""

content = content.replace(old_use_effect_set, new_use_effect_set)

# 3. Add verified checkbox in the form (after is_open_24_hours)
old_checkbox = """            <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    id="is_open_24_hours"
                    name="is_open_24_hours"
                    checked={formData.is_open_24_hours}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300 text-gold focus:ring-gold"
                />
                <Label htmlFor="is_open_24_hours">Open 24 Hours</Label>
            </div>

            <DialogFooter>"""

new_checkbox = """            <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    id="is_open_24_hours"
                    name="is_open_24_hours"
                    checked={formData.is_open_24_hours}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300 text-gold focus:ring-gold"
                />
                <Label htmlFor="is_open_24_hours">Open 24 Hours</Label>
            </div>

            <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    id="verified"
                    name="verified"
                    checked={formData.verified}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                />
                <Label htmlFor="verified">Verified (Appears in search results)</Label>
            </div>

            <DialogFooter>"""

content = content.replace(old_checkbox, new_checkbox)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("BusinessModal.tsx updated successfully with verified toggle")
