
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share2, Link as LinkIcon, Facebook, MessageCircle, Twitter } from "lucide-react";
import { toast } from "sonner";

interface ShareMenuProps {
    businessName: string;
    city: string;
    url?: string;
}

export function ShareMenu({ businessName, city, url }: ShareMenuProps) {
    const shareUrl = url || window.location.href;
    const shareText = `Check out ${businessName}, a top-rated ${city} tradesperson on Emergency Tradesmen.`;
    const shareTitle = `${businessName} - Emergency Tradesmen`;

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: shareTitle,
                    text: shareText,
                    url: shareUrl,
                });
                toast.success("Shared successfully!");
            } catch (error) {
                if ((error as Error).name !== "AbortError") {
                    console.error("Error sharing:", error);
                    toast.error("Could not share. Try copying the link.");
                }
            }
        } else {
            // Fallback for browsers without native share (shouldn't happen with the hidden logic below, but good for safety)
            copyToClipboard();
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
    };

    const shareToWhatsApp = () => {
        const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`;
        window.open(waUrl, "_blank");
    };

    const shareToFacebook = () => {
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(fbUrl, "_blank");
    };

    const shareToTwitter = () => {
        const twUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(twUrl, "_blank");
    };

    // If native share is supported (mostly mobile), we can prioritize that button action
    // BUT to be safe and allow options on desktop, we use a Dropdown.
    // We can make the main button trigger native share on mobile if we wanted, 
    // but a menu is consistent. Let's provide a "Native Share" option in the menu if supported, 
    // or just use the menu for specific actions which is often better for "copy link".

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full gap-2 border-gold/30 hover:bg-gold/5 hover:text-gold transition-colors">
                    <Share2 className="w-4 h-4" />
                    Share Business
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={copyToClipboard} className="cursor-pointer gap-2">
                    <LinkIcon className="w-4 h-4" />
                    Copy Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={shareToWhatsApp} className="cursor-pointer gap-2">
                    <MessageCircle className="w-4 h-4 text-green-500" />
                    Share via WhatsApp
                </DropdownMenuItem>
                <DropdownMenuItem onClick={shareToFacebook} className="cursor-pointer gap-2">
                    <Facebook className="w-4 h-4 text-blue-600" />
                    Share on Facebook
                </DropdownMenuItem>
                <DropdownMenuItem onClick={shareToTwitter} className="cursor-pointer gap-2">
                    <Twitter className="w-4 h-4 text-sky-500" />
                    Share on X
                </DropdownMenuItem>
                {typeof navigator !== 'undefined' && navigator.share && (
                    <DropdownMenuItem onClick={handleNativeShare} className="cursor-pointer gap-2">
                        <Share2 className="w-4 h-4" />
                        More Options...
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
