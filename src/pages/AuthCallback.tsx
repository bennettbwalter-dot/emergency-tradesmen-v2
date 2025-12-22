
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
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error("Auth callback error:", error);
                navigate("/login?error=auth_callback_failed", { replace: true });
                return;
            }

            if (session) {
                // Successful login
                // Explicitly clear hash from history before navigating
                if (window.location.hash) {
                    window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
                }
                navigate("/user/dashboard", { replace: true });
            } else {
                // No session found yet, maybe check hash manualy? 
                // Or wait for onAuthStateChange (which AuthContext does).
                // For now, if no hash and no session, go home.
                if (!window.location.hash) {
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
                navigate("/user/dashboard", { replace: true });
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
