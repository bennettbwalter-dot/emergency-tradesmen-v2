import { Business } from "@/lib/businesses";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { BusinessEnquiryForm } from "@/components/business/BusinessEnquiryForm";

interface ClaimListingModalProps {
  business: Business;
  triggerClassName?: string;
  compact?: boolean;
}

function currentListingUrl(businessId: string) {
  if (typeof window === "undefined") return `/business/${businessId}`;
  return `${window.location.origin}/business/${businessId}`;
}

export function ClaimListingModal({ business, triggerClassName, compact = false }: ClaimListingModalProps) {
  const region: "UK" | "US" = business.country_code === "US" ? "US" : "UK";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size={compact ? "sm" : "default"}
          className={cn("border-border/70 text-muted-foreground hover:text-foreground", triggerClassName)}
        >
          Own this business? Claim this listing
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Claim this listing</DialogTitle>
          <DialogDescription>
            Send a manual claim request for {business.name}. Submitting this form does not give instant access to edit the listing.
          </DialogDescription>
        </DialogHeader>
        <BusinessEnquiryForm
          region={region}
          defaultEnquiryType="Claim free listing"
          prefillBusinessName={business.name}
          prefillListingUrl={currentListingUrl(business.id)}
        />
      </DialogContent>
    </Dialog>
  );
}
