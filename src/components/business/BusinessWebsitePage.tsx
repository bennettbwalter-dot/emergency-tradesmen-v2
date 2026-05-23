import { useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Globe2, PhoneCall, Server, ShieldCheck, Sparkles, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { BusinessEnquiryForm } from "@/components/business/BusinessEnquiryForm";

type Region = "UK" | "US";
type PackageName = "Starter Website" | "Growth Website" | "Emergency Lead Website" | "Not sure yet";
type EnquiryType = "Claim free listing" | "Upgrade listing" | "Get a website built";

type BusinessWebsitePageProps = {
  region: Region;
};

const packages: Array<{
  name: PackageName;
  ukPrice: string;
  usPrice: string;
  description: string;
  includes: string[];
}> = [
  {
    name: "Starter Website",
    ukPrice: "From \u00a3699 setup + \u00a349/mo",
    usPrice: "Pricing available on request",
    description: "Clean, professional, phone-first website, fast to launch.",
    includes: ["1-3 page website", "Mobile-first design", "Call Now button", "Emergency service section", "Contact form", "Basic SEO setup", "Hosting and care plan"],
  },
  {
    name: "Growth Website",
    ukPrice: "From \u00a31,200 setup + \u00a389/mo",
    usPrice: "Pricing available on request",
    description: "Stronger local presence, service pages, reviews, and areas covered.",
    includes: ["Everything in Starter", "5-page website", "Service pages", "Areas covered section", "Reviews section", "Photo gallery", "Google Business Profile checklist"],
  },
  {
    name: "Emergency Lead Website",
    ukPrice: "From \u00a31,800 setup + \u00a3149/mo",
    usPrice: "Pricing available on request",
    description: "Full local lead-generation system with emergency landing pages and area pages.",
    includes: ["Everything in Growth", "Emergency landing pages", "Local area pages", "Lead capture form", "Call tracking-ready layout", "Review request flow", "Monthly content update"],
  },
];

export function BusinessWebsitePage({ region }: BusinessWebsitePageProps) {
  const [enquiryType, setEnquiryType] = useState<EnquiryType>("Get a website built");
  const [selectedPackage, setSelectedPackage] = useState<PackageName>("Not sure yet");
  const formRef = useRef<HTMLElement>(null);
  const isUS = region === "US";
  const brand = isUS ? "EmergencyContractors" : "EmergencyTradesmen";
  const ownerPath = isUS ? "/for-contractors" : "/for-tradesmen";
  const showroomPath = `${ownerPath}/website-showroom`;
  const audience = isUS ? "local contractors" : "local tradesmen";
  const serviceAudience = isUS ? "contractors and home service businesses" : "local trades and home service businesses";
  const title = isUS ? "Emergency-Ready Websites for Local Contractors" : "Emergency-Ready Websites for Local Tradesmen";

  const scrollToForm = (type: EnquiryType, packageName: PackageName = "Not sure yet") => {
    setEnquiryType(type);
    setSelectedPackage(packageName);
    window.setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title={`${title} | ${brand}`}
        description={`Phone-first websites built for ${serviceAudience} who need more local emergency calls.`}
        canonical={ownerPath}
      />
      <Header />
      <main>
        <section className="business-owner-hero">
          <div className="container-wide business-owner-hero-grid">
            <div>
              <p className="business-owner-kicker">Done-for-you websites</p>
              <h1>{title}</h1>
              <p className="business-owner-lede">
                Phone-first websites built for {serviceAudience} who need more phone calls, not just a pretty homepage.
              </p>
              <p className="business-owner-copy">
                Most websites look fine but do not help when someone needs urgent help. These websites are built around emergency intent, fast trust, direct contact, hosting, care, and manual follow-up.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button className="min-h-12 bg-gold text-black hover:bg-gold-light" onClick={() => scrollToForm("Get a website built")}>
                  Get a Website Built <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" className="min-h-12" onClick={() => scrollToForm("Claim free listing")}>
                  Claim Your Listing
                </Button>
                <Button asChild variant="ghost" className="min-h-12">
                  <Link to={showroomPath}>View Website Showroom</Link>
                </Button>
              </div>
            </div>
            <div className="business-owner-panel">
              <div className="business-owner-browser">
                <img src={isUS ? "/images/blog/generated/emergency-contractor-us-new.webp" : "/tradesman-hero-v2.webp"} alt="" />
                <div>
                  <span>Call Now</span>
                  <strong>Emergency-ready layout</strong>
                  <p>Service pages, trust sections, hosting, care, and enquiry capture.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container-wide px-4 py-16">
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { title: "Phone-first design", copy: "Call Now and contact options are visible from the first screen.", Icon: PhoneCall },
              { title: isUS ? "Cities and states" : "Towns and cities", copy: "Pages can be structured around your services and local coverage.", Icon: Globe2 },
              { title: "Hosting and care", copy: "Monthly care covers hosting, maintenance, small edits, and support.", Icon: Server },
            ].map(({ title: itemTitle, copy, Icon }) => (
              <div key={itemTitle} className="business-owner-feature">
                <Icon className="h-6 w-6 text-gold" />
                <h2>{itemTitle}</h2>
                <p>{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="business-packages-section">
          <div className="container-wide px-4">
            <div className="mb-10 max-w-3xl">
              <p className="business-owner-kicker">Website packages</p>
              <h2 className="font-display text-4xl md:text-5xl font-bold">Built, hosted, and looked after for you</h2>
              <p className="mt-4 text-muted-foreground">Choose a starting point. We follow up manually before anything is built or charged.</p>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              {packages.map((pkg) => (
                <article key={pkg.name} className="business-package-card">
                  <h3>{pkg.name}</h3>
                  <p className="business-package-price">{isUS ? pkg.usPrice : pkg.ukPrice}</p>
                  <p className="business-package-copy">{pkg.description}</p>
                  <ul>
                    {pkg.includes.map((item) => (
                      <li key={item}><CheckCircle2 />{item}</li>
                    ))}
                  </ul>
                  <Button className="mt-auto w-full bg-gold text-black hover:bg-gold-light" onClick={() => scrollToForm("Get a website built", pkg.name)}>
                    Enquire About {pkg.name.replace(" Website", "")}
                  </Button>
                </article>
              ))}
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Monthly care covers hosting, maintenance, small edits, and support. Larger redesigns, paid ads, and ongoing SEO campaigns are quoted separately.
            </p>
          </div>
        </section>

        <section id="claim" className="container-wide px-4 py-16">
          <div className="business-claim-band">
            <div>
              <p className="business-owner-kicker">Already listed?</p>
              <h2>Claim your business listing</h2>
              <p>
                If your business is already listed on {brand}, submit a claim request. Claims are reviewed manually before any listing changes are made.
              </p>
            </div>
            <Button className="bg-gold text-black hover:bg-gold-light" onClick={() => scrollToForm("Claim free listing")}>
              Claim My Listing
            </Button>
          </div>
        </section>

        <section className="container-wide px-4 pb-16">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: "Design", copy: "A premium emergency-ready website style matched to your trade.", Icon: Sparkles },
              { title: "Build", copy: "We write, structure, and assemble the pages around calls and enquiries.", Icon: Wrench },
              { title: "Launch", copy: "Hosting, support, care, and small edits are included in the monthly plan.", Icon: ShieldCheck },
            ].map(({ title: itemTitle, copy, Icon }) => (
              <div key={itemTitle} className="business-owner-feature">
                <Icon className="h-6 w-6 text-gold" />
                <h2>{itemTitle}</h2>
                <p>{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section ref={formRef} id="get-website" className="container-wide px-4 py-16">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 text-center">
              <h2 className="font-display text-4xl font-semibold">
                {enquiryType === "Claim free listing" ? "Submit a Claim Request" : `Enquire About ${selectedPackage}`}
              </h2>
              <p className="mt-3 text-muted-foreground">This starts a manual enquiry. No payment is taken here.</p>
            </div>
            <BusinessEnquiryForm region={region} defaultEnquiryType={enquiryType} defaultPackage={selectedPackage} />
          </div>
        </section>
      </main>
      <Footer countryCode={isUS ? "US" : "GB"} />
    </div>
  );
}
