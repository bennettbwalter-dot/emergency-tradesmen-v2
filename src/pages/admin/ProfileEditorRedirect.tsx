// Simple wrapper that redirects /premium-profile to admin panel for admins
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function ProfileEditorRedirect() {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
        const isAdmin = user?.email && adminEmail && user.email.toLowerCase() === adminEmail.toLowerCase();

        if (isAdmin) {
            // Redirect admins to the admin panel version
            navigate('/admin/profile-editor', { replace: true });
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
    );
}
