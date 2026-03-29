import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, User } from "lucide-react";

interface AuthFormProps {
    defaultTab?: "login" | "register";
    onSuccess?: () => void;
    hideHeader?: boolean;
    className?: string;
    mode?: "login" | "register";
    onModeChange?: (mode: "login" | "register") => void;
}

export function AuthForm({
    defaultTab = "login",
    onSuccess,
    className,
    hideHeader = false,
    mode: computedModeProp,
    onModeChange
}: AuthFormProps) {
    const [internalMode, setInternalMode] = useState<"login" | "register">(defaultTab);
    const [isLoading, setIsLoading] = useState(false);

    // Use controlled mode if provided, otherwise internal state
    const mode = computedModeProp || internalMode;

    const handleModeChange = (newMode: "login" | "register") => {
        if (onModeChange) {
            onModeChange(newMode);
        } else {
            setInternalMode(newMode);
        }
    };

    // Form state
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const { login, register, signInWithGoogle } = useAuth();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (mode === "login") {
                await login(email, password);
                toast({
                    title: "Welcome back!",
                    description: "You have successfully logged in.",
                });
            } else {
                await register(name, email, password);
                toast({
                    title: "Account created!",
                    description: "Welcome to Emergency Tradesmen.",
                });
            }
            onSuccess?.();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Something went wrong",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        const newMode = mode === "login" ? "register" : "login";
        handleModeChange(newMode);
        setPassword(""); // Clear password on switch for security
    };

    return (
        <div className={className}>
            {!hideHeader && (
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-display">
                        {mode === "login" ? "Welcome Back" : "Create Account"}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        {mode === "login"
                            ? "Enter your credentials to access your account"
                            : "Join us to save favorites and track your quotes"}
                    </p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "register" && (
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="name"
                                placeholder="John Smith"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="pl-9"
                                required
                            />
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-9"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-9"
                            required
                            minLength={6}
                        />
                    </div>
                    {mode === "login" && (
                        <div className="flex justify-end">
                            <Button variant="link" className="px-0 h-auto text-xs text-muted-foreground">
                                Forgot password?
                            </Button>
                        </div>
                    )}
                </div>

                <Button type="submit" className="w-full bg-gold hover:bg-gold/90 text-gold-foreground" disabled={isLoading}>
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        mode === "login" ? "Sign In" : "Create Account"
                    )}
                </Button>

                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-[#0f172a] px-2 text-gray-400">Or continue with</span>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-white"
                    onClick={async () => {
                        try {
                            await signInWithGoogle();
                        } catch (e: any) {
                            toast({ title: "Error", description: e.message, variant: "destructive" });
                        }
                    }}
                    disabled={isLoading}
                >
                    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                    </svg>
                    Continue with Google
                </Button>



                <div className="text-center text-sm">
                    {mode === "login" ? (
                        <>
                            Don't have an account?{" "}
                            <button
                                type="button"
                                onClick={toggleMode}
                                className="text-gold hover:underline font-medium"
                            >
                                Sign up
                            </button>
                        </>
                    ) : (
                        <>
                            Already have an account?{" "}
                            <button
                                type="button"
                                onClick={toggleMode}
                                className="text-gold hover:underline font-medium"
                            >
                                Sign in
                            </button>
                        </>
                    )}
                </div>
            </form>
        </div>
    );
}
