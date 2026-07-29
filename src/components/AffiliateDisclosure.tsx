import { cn } from "@/lib/utils";

/**
 * Mandatory FTC/ASA affiliate disclosure line.
 * Place visibly near any affiliate link or sponsored placement.
 */
export function AffiliateDisclosure({ className }: { className?: string }) {
    return (
        <p className={cn("text-[11px] text-muted-foreground/70 leading-snug", className)}>
            Affiliate disclosure: this is an affiliate placement  -  we may earn a commission if you
            buy through this link, at no extra cost to you. See our{" "}
            <a href="/privacy" className="underline hover:text-foreground">privacy policy</a> for details.
        </p>
    );
}
