
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function AuthRedirectHandler() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // If we have an access token in the URL (OAuth callback)
        if (location.hash && location.hash.includes('access_token')) {
            // Once Supabase processes it and sets the user as authenticated
            if (isAuthenticated) {
                // Clear the hash and go to dashboard
                navigate('/user/dashboard', { replace: true });
            }
        }
    }, [isAuthenticated, location.hash, navigate]);

    return null;
}
