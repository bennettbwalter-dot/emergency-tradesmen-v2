
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // The supabase-js client automatically parses the hash on the URL
        // and updates the session. We just need to wait and redirect.

        const handleAuth = async () => {
            // Handle error params returned by Supabase (e.g. code exchange failure)
            const params = new URLSearchParams(window.location.search);
            if (params.get('error')) {
                console.error("Auth callback error:", params.get('error_description'));
                navigate("/login?error=auth_callback_failed", { replace: true });
                return;
            }

            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error("Auth callback error:", error);
                navigate("/login?error=auth_callback_failed", { replace: true });
                return;
            }

            if (session) {
                if (window.location.hash) {
                    window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
                }
                const redirect = sessionStorage.getItem('post_auth_redirect') || '/user/dashboard';
                sessionStorage.removeItem('post_auth_redirect');
                navigate(redirect, { replace: true });
            } else {
                if (!window.location.hash && !window.location.search.includes('code=')) {
                    navigate("/", { replace: true });
                }
            }
        };

        handleAuth();

        // Also listen for event just in case
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                if (window.location.hash) {
                    window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
                }
                const redirect = sessionStorage.getItem('post_auth_redirect') || '/user/dashboard';
                sessionStorage.removeItem('post_auth_redirect');
                navigate(redirect, { replace: true });
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Verifying login...</p>
        </div>
    );
};

export default AuthCallback;
