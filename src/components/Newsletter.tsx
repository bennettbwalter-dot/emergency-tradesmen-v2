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
            const { data, error } = await supabase.functions.invoke('newsletter-subscribe', {
                body: { email },
            });

            if (error) throw error;
            if (data?.error) throw new Error(data.error);

            toast.success(data.message || "Thanks for subscribing!");
            setEmail("");
        } catch (error) {
            console.error("Subscription error:", error);
            toast.error(error instanceof Error ? error.message : "Failed to subscribe. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full">
            <h4 className="font-display text-lg tracking-wide text-foreground mb-4">
                Subscribe to our Newsletter
            </h4>
            <p className="text-muted-foreground text-sm mb-4">
                Get the latest updates and tips for your home.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-background/50"
                    disabled={isLoading}
                />
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gold hover:bg-gold-light text-primary font-semibold"
                >
                    {isLoading ? "Subscribing..." : "Subscribe"}
                </Button>
            </form>
        </div>
    );
}
