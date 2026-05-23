import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Region = "UK" | "US";
type EnquiryType = "Claim free listing" | "Upgrade listing" | "Get a website built";
type PackageName = "Starter Website" | "Growth Website" | "Emergency Lead Website" | "Not sure yet";

type BusinessEnquiryFormProps = {
  region: Region;
  defaultEnquiryType?: EnquiryType;
  defaultPackage?: PackageName;
  defaultTradeStyle?: string;
  prefillBusinessName?: string;
  prefillListingUrl?: string;
  onSuccess?: () => void;
};

export function BusinessEnquiryForm({
  region,
  defaultEnquiryType = "Get a website built",
  defaultPackage = "Not sure yet",
  defaultTradeStyle = "",
  prefillBusinessName = "",
  prefillListingUrl = "",
  onSuccess,
}: BusinessEnquiryFormProps) {
  const representativeCopy = region === "US"
    ? "I confirm I am the owner, employee, or authorized representative of this business."
    : "I confirm I am the owner, employee, or authorised representative of this business.";
  const [enquiryType, setEnquiryType] = useState<EnquiryType>(defaultEnquiryType);
  const [interestedPackage, setInterestedPackage] = useState<PackageName>(defaultPackage);
  const [selectedTradeStyle, setSelectedTradeStyle] = useState(defaultTradeStyle);
  const [businessName, setBusinessName] = useState(prefillBusinessName);
  const [listingUrl, setListingUrl] = useState(prefillListingUrl);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    setEnquiryType(defaultEnquiryType);
  }, [defaultEnquiryType]);

  useEffect(() => {
    setInterestedPackage(defaultPackage);
  }, [defaultPackage]);

  useEffect(() => {
    setSelectedTradeStyle(defaultTradeStyle);
  }, [defaultTradeStyle]);

  useEffect(() => {
    setBusinessName(prefillBusinessName);
  }, [prefillBusinessName]);

  useEffect(() => {
    setListingUrl(prefillListingUrl);
  }, [prefillListingUrl]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (String(form.get("website_url_confirm") || "")) {
      setStatus("success");
      onSuccess?.();
      return;
    }

    setStatus("submitting");
    setError("");

    const payload = {
      region,
      business_name: String(form.get("business_name") || "").trim(),
      owner_name: String(form.get("owner_name") || "").trim(),
      email: String(form.get("email") || "").trim(),
      phone: String(form.get("phone") || "").trim(),
      website: String(form.get("website") || "").trim(),
      listing_url: listingUrl,
      enquiry_type: enquiryType,
      interested_package: enquiryType === "Get a website built" ? interestedPackage : undefined,
      selected_trade_style: selectedTradeStyle,
      message: String(form.get("message") || "").trim(),
      consent_given: true,
      authorized_representative_confirmed: enquiryType === "Claim free listing" ? form.get("authorized_representative_confirmed") === "on" : false,
      website_url_confirm: "",
    };

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (supabaseUrl && anonKey && !supabaseUrl.includes("placeholder")) {
        const response = await fetch(`${supabaseUrl}/functions/v1/submit-business-enquiry`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${anonKey}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok && response.status !== 404) {
          throw new Error("Submission failed");
        }
      }

      setStatus("success");
      onSuccess?.();
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again or email emergencytradesmen@outlook.com.");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-emerald-500" />
        <h3 className="font-display text-2xl font-bold">Enquiry received</h3>
        <p className="mt-2 text-muted-foreground">Thanks. We'll review your details and get back to you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="business-enquiry-form">
      <input type="hidden" name="website_url_confirm" tabIndex={-1} autoComplete="off" className="hidden" />
      <input type="hidden" name="selected_trade_style" value={selectedTradeStyle} />
      <input type="hidden" name="listing_url" value={listingUrl} />

      <div>
        <Label htmlFor="business_name">Business name</Label>
        <Input id="business_name" name="business_name" value={businessName} onChange={(event) => setBusinessName(event.target.value)} required minLength={2} maxLength={200} />
      </div>
      <div>
        <Label htmlFor="owner_name">Owner name</Label>
        <Input id="owner_name" name="owner_name" required minLength={2} maxLength={100} />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" type="tel" required minLength={5} maxLength={30} />
      </div>
      <div>
        <Label htmlFor="website">Website</Label>
        <Input id="website" name="website" type="url" placeholder="https://example.com" />
      </div>
      <div>
        <Label htmlFor="enquiry_type">Enquiry type</Label>
        <select id="enquiry_type" value={enquiryType} onChange={(event) => setEnquiryType(event.target.value as EnquiryType)} className="h-10 w-full rounded-sm border border-input bg-background px-3 text-sm">
          <option>Claim free listing</option>
          <option>Upgrade listing</option>
          <option>Get a website built</option>
        </select>
      </div>
      {enquiryType === "Get a website built" && (
        <div>
          <Label htmlFor="interested_package">Interested package</Label>
          <select id="interested_package" value={interestedPackage} onChange={(event) => setInterestedPackage(event.target.value as PackageName)} className="h-10 w-full rounded-sm border border-input bg-background px-3 text-sm">
            <option>Starter Website</option>
            <option>Growth Website</option>
            <option>Emergency Lead Website</option>
            <option>Not sure yet</option>
          </select>
        </div>
      )}
      {selectedTradeStyle && (
        <div>
          <Label htmlFor="selected_style_display">Selected website style</Label>
          <Input id="selected_style_display" value={selectedTradeStyle} onChange={(event) => setSelectedTradeStyle(event.target.value)} />
        </div>
      )}
      {listingUrl && (
        <div>
          <Label htmlFor="listing_url_display">Listing URL</Label>
          <Input id="listing_url_display" value={listingUrl} onChange={(event) => setListingUrl(event.target.value)} />
        </div>
      )}
      <div className="business-form-wide">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" rows={5} maxLength={2000} />
      </div>
      {enquiryType === "Claim free listing" && (
        <div className="business-form-wide rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Claim requests are reviewed manually before any listing changes are made.</p>
          <p className="mt-1">Submitting this form does not give instant access to edit the listing.</p>
          <label className="mt-3 flex items-start gap-3">
            <input type="checkbox" name="authorized_representative_confirmed" required className="mt-1" />
            <span>{representativeCopy}</span>
          </label>
        </div>
      )}
      <label className="business-form-wide flex items-start gap-3 text-sm text-muted-foreground">
        <input type="checkbox" name="consent" required className="mt-1" />
        <span>I agree to be contacted about my enquiry. See <a href="/privacy" className="text-gold underline">Privacy Policy</a>.</span>
      </label>
      {status === "error" && <p className="business-form-wide text-sm text-destructive">{error}</p>}
      <Button type="submit" className="business-form-wide h-12 bg-gold text-black hover:bg-gold-light" disabled={status === "submitting"}>
        {status === "submitting" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Send Enquiry
      </Button>
    </form>
  );
}
