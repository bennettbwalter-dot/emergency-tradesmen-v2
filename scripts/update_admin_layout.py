import os

file_path = os.path.join('..', 'src', 'components', 'admin', 'AdminLayout.tsx')

if not os.path.exists(file_path):
    print(f"Error: {file_path} not found")
    exit(1)

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update imports
old_imports = """    LayoutDashboard,
    Building2,
    Star,
    Users,
    Image,
    FileText,
    LogOut,
    Menu,
    X
} from "lucide-react";"""

new_imports = """    LayoutDashboard,
    Building2,
    Star,
    Users,
    Image,
    FileText,
    LogOut,
    Menu,
    X,
    Calendar,
    Settings,
    Download,
    Edit3
} from "lucide-react";"""

content = content.replace(old_imports, new_imports)

# 2. Update navItems
old_nav = """    const navItems = [
        { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
        { path: "/admin/businesses", icon: Building2, label: "Businesses" },
        { path: "/admin/subscriptions", icon: FileText, label: "Subscriptions" },
        { path: "/admin/quotes", icon: FileText, label: "Quotes" },
        { path: "/admin/reviews", icon: Star, label: "Reviews" },
        { path: "/admin/photos", icon: Image, label: "Photos" },
        { path: "/admin/users", icon: Users, label: "Users" },
    ];"""

new_nav = """    const navItems = [
        { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
        { path: "/admin/businesses", icon: Building2, label: "Businesses" },
        { path: "/admin/profile-editor", icon: Edit3, label: "Profile Editor" },
        { path: "/admin/availability", icon: Calendar, label: "Availability" },
        { path: "/admin/subscriptions", icon: FileText, label: "Subscriptions" },
        { path: "/admin/quotes", icon: FileText, label: "Quotes" },
        { path: "/admin/reviews", icon: Star, label: "Reviews" },
        { path: "/admin/photos", icon: Image, label: "Photos" },
        { path: "/admin/export", icon: Download, label: "Data Export" },
    ];"""

content = content.replace(old_nav, new_nav)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully updated AdminLayout.tsx")
