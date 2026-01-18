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

    const { login, register } = useAuth();
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
