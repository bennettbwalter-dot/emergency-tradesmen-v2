import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export function Newsletter() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        try {
            // 1. Try to save to local database (Always do this for reliability)
            const { error: dbError } = await supabase
                .from('newsletter_subscriptions')
                .insert([{ email }]);

            // If it's a duplicate, we can still try the edge function or just treat it as success
            if (dbError && dbError.code !== '23505') { // '23505' is unique_violation
                console.warn("Database storage failed:", dbError);
            }

            // 2. Try to invoke edge function (If it fails, we already have the data in DB)
            try {
                const { error: funcError } = await supabase.functions.invoke('newsletter-subscribe', {
                    body: { email },
                });

                if (funcError) {
                    console.warn("Edge function failed, but database record likely saved:", funcError);
                }
            } catch (fErr) {
                console.warn("Edge function catch error:", fErr);
            }

            toast.success("Thanks for subscribing!");
            setEmail("");
        } catch (error) {
            console.error("Subscription error:", error);
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full">
            <h4 className="font-display text-lg tracking-wide text-white mb-4">
                Subscribe to our Newsletter
            </h4>
            <p className="text-white/60 text-sm mb-4">
                Get the latest updates and tips for your home.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    disabled={isLoading}
                />
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gold hover:bg-gold-light text-black font-semibold"
                >
                    {isLoading ? "Subscribing..." : "Subscribe"}
                </Button>
            </form>
        </div>
    );
}
