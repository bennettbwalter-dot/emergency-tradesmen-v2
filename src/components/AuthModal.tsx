import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";
import { AuthForm } from "@/components/AuthForm";

interface AuthModalProps {
    defaultTab?: "login" | "register";
    trigger?: React.ReactNode;
    onSuccess?: () => void;
}

export function AuthModal({ defaultTab = "login", trigger, onSuccess }: AuthModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || <Button variant="ghost">Sign In</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <AuthForm
                    defaultTab={defaultTab}
                    onSuccess={() => {
                        setIsOpen(false);
                        onSuccess?.();
                    }}
                />
            </DialogContent>
        </Dialog>
    );
}
