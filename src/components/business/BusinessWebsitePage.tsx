import { useRef, useState } from "react";
import { ArrowRight, CheckCircle2, ExternalLink, Gift, GitBranch, Globe2, PhoneCall, Server, ShieldCheck, Sparkles, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { BusinessEnquiryForm } from "@/components/business/BusinessEnquiryForm";

type Region = "UK" | "US";
type PackageName = "Free website build with Pro Yearly" | "Free website build with Agency / Multi-Location" | "Not sure yet";
type EnquiryType = "Claim free listing" | "Upgrade listing" | "Get a website built";

type BusinessWebsitePageProps = {
  region: Region;
};

const freeWebsiteIncludes = [
  "Business name, trade, location, phone number, and opening hours",
  "Services, emergency call-to-action, and contact form",
  "Logo, image, and website colours when available",
  "Local service area and trust sections shaped around urgent customer intent",
  "No upfront website build fee when you join Pro Yearly or Agency / Multi-Location",
];

const growthPackageIncludes = [
  "Pro directory listing",
  "Better visibility",
  "Priority placement",
  "More trust with customers",
  "Professional website included at no extra cost",
];

const githubTemplates = [
  {
    name: "Calm Water Systems",
    repo: "bennettbwalter-dot/calm-water-systems",
    sourceUrl: "https://github.com/bennettbwalter-dot/calm-water-systems",
    bestFor: "Plumbers, drainage, water damage, heating, and calm emergency repair offers",
  },
  {
    name: "Redline Recovery Site",
    repo: "bennettbwalter-dot/redline-recovery-site",
    sourceUrl: "https://github.com/bennettbwalter-dot/redline-recovery-site",
    bestFor: "Breakdown recovery, roadside help, urgent dispatch, and high-response trades",
  },
  {
    name: "v0 Compute Platform",
    repo: "bennettbwalter-dot/v0-compute-the-platform-to-build",
    sourceUrl: "https://github.com/bennettbwalter-dot/v0-compute-the-platform-to-build",
    bestFor: "Locksmiths, security, access, technical services, and premium emergency pages",
  },
  {
    name: "Roofing4Women",
    repo: "static showroom template",
    sourceUrl: "/showroom-templates/roofing4women/index.html",
    bestFor: "Roofers, women-led trades, values-led service businesses, and clean blue-and-white roofing sites",
    linkLabel: "View template preview",
  },
  {
    name: "Halvorsen & Co. Master Builder",
    repo: "static showroom template",
    sourceUrl: "/showroom-templates/builder-halvorsen/index.html",
    bestFor: "Builders, remodelers, commercial contractors, and project-led construction businesses",
    linkLabel: "View template preview",
  },
  {
    name: "Aurora Climate HVAC",
    repo: "bennettbwalter-dot/v0-hvac-website-design",
    sourceUrl: "/showroom-templates/hvac-aurora/index.html",
    bestFor: "HVAC, air conditioning, heating, comfort plans, and seasonal service businesses",
    linkLabel: "View template preview",
  },
];

export function BusinessWebsitePage({ region }: BusinessWebsitePageProps) {
  const [enquiryType, setEnquiryType] = useState<EnquiryType>("Get a website built");
  const [selectedPackage, setSelectedPackage] = useState<PackageName>("Not sure yet");
  const [selectedTradeStyle, setSelectedTradeStyle] = useState("");
  const formRef = useRef<HTMLElement>(null);
  const isUS = region === "US";
  const brand = isUS ? "EmergencyContractors" : "EmergencyTradesmen";
  const ownerPath = isUS ? "/for-contractors" : "/for-tradesmen";
  const showroomPath = `${ownerPath}/website-showroom`;
  const audience = isUS ? "local contractors" : "local tradesmen";
  const serviceAudience = isUS ? "contractors and home service businesses" : "local trades and home service businesses";
  const title = isUS ? "Emergency-Ready Websites for Local Contractors" : "Emergency-Ready Websites for Local Tradesmen";

  const scrollToForm = (type: EnquiryType, packageName: PackageName = "Not sure yet", templateName = "") => {
    setEnquiryType(type);
    setSelectedPackage(packageName);
    setSelectedTradeStyle(templateName);
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
                The free website offer uses one of the approved templates already provided, then we customise it with your business name, trade, location, phone number, services, images, emergency CTA, contact form, hours, and colours where needed.
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

        {/* The one funnel spine: Claim → Verified badge → Pro upgrade */}
        <section className="container-wide px-4 pt-12">
          <div className="rounded-2xl border border-gold/25 bg-gold/5 p-6 md:p-8">
            <p className="business-owner-kicker">How {brand} works for {audience}</p>
            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <div className="business-owner-feature">
                <span className="font-mono text-xs font-black uppercase tracking-widest text-gold">Step 1</span>
                <h2>Claim your free listing</h2>
                <p>Already listed? Claim it free, keep your phone number and details accurate, and start taking direct calls.</p>
                <Button asChild variant="outline" className="mt-3 w-fit">
                  <Link to="/claim-your-business">Claim free listing</Link>
                </Button>
              </div>
              <div className="business-owner-feature">
                <span className="font-mono text-xs font-black uppercase tracking-widest text-gold">Step 2</span>
                <h2>Get the claimed badge</h2>
                <p>Claims are reviewed manually. Approved profiles show a claimed badge customers can actually trust.</p>
              </div>
              <div className="business-owner-feature">
                <span className="font-mono text-xs font-black uppercase tracking-widest text-gold">Step 3</span>
                <h2>Upgrade to Pro</h2>
                <p>Priority placement, richer profile, and the free website build on Pro Yearly or Agency plans.</p>
                <Button asChild className="mt-3 w-fit bg-gold text-black hover:bg-gold-light">
                  <Link to="/pricing">View Pro plans</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="container-wide px-4 py-12">
          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-6 md:flex md:items-center md:justify-between md:gap-8">
            <div className="flex gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-500/15">
                <Gift className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="business-owner-kicker">Free website bonus</p>
                <h2 className="font-display text-2xl font-bold md:text-3xl">
                  Sign up to Pro Yearly or Agency / Multi-Location and we'll build your emergency-ready website completely free.
                </h2>
                <p className="mt-2 text-muted-foreground">
                  We use one of the approved templates you already provided, then customise it for the business. No random design, no starting from zero.
                </p>
              </div>
            </div>
            <Button asChild className="mt-5 shrink-0 bg-gold text-black hover:bg-gold-light md:mt-0">
              <Link to="/pricing">View Pro Plans</Link>
            </Button>
          </div>
        </section>

        <section className="container-wide px-4 py-16">
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { title: "Phone-first design", copy: "Call Now and contact options are visible from the first screen.", Icon: PhoneCall },
              { title: isUS ? "Cities and states" : "Towns and cities", copy: "Pages can be structured around your services and local coverage.", Icon: Globe2 },
              { title: "Launch support", copy: "We agree the launch, hosting, and upkeep details with you before anything goes live.", Icon: Server },
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
            <div className="mb-10 max-w-4xl">
              <p className="business-owner-kicker">Included template build</p>
              <h2 className="font-display text-4xl md:text-5xl font-bold">Your emergency-ready website starts from one of the approved templates</h2>
              <p className="mt-4 text-muted-foreground">
                Sign up to Pro Yearly or Agency / Multi-Location and we will customise one of the GitHub templates below completely free. This keeps the offer fast, professional, and scalable.
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
              <article className="business-package-card">
                <h3>What we customise</h3>
                <p className="business-package-copy">
                  We do not rebuild the website from scratch each time. We take the closest approved template and swap in the business details that matter.
                </p>
                <ul>
                  {freeWebsiteIncludes.map((item) => (
                    <li key={item}><CheckCircle2 />{item}</li>
                  ))}
                </ul>
                <div className="mt-auto flex flex-col gap-3 sm:flex-row">
                  <Button asChild className="bg-gold text-black hover:bg-gold-light">
                    <Link to="/pricing">View Pro Yearly</Link>
                  </Button>
                  <Button variant="outline" onClick={() => scrollToForm("Get a website built", "Free website build with Pro Yearly", "Not sure yet - choose the best GitHub template")}>
                    Ask About the Free Build
                  </Button>
                </div>
              </article>

              <article className="business-package-card border-emerald-500/30 bg-emerald-500/10">
                <h3>No setup-price menu</h3>
                <p className="business-package-copy">
                  The offer is simple: join one of the higher-value plans and the website build is included as part of your visibility package.
                </p>
                <ul>
                  {growthPackageIncludes.map((item) => (
                    <li key={item}><CheckCircle2 />{item}</li>
                  ))}
                </ul>
                <Button className="mt-auto bg-emerald-500 text-white hover:bg-emerald-600" onClick={() => scrollToForm("Claim free listing")}>
                  Claim Your Listing First
                </Button>
              </article>
            </div>
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {githubTemplates.map((template) => (
                <article key={template.name} className="business-package-card">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="business-owner-kicker">GitHub template</p>
                      <h3>{template.name}</h3>
                    </div>
                    <GitBranch className="h-5 w-5 shrink-0 text-gold" />
                  </div>
                  <p className="business-package-copy">{template.bestFor}</p>
                  <ul>
                    <li><CheckCircle2 />Source repo: {template.repo}</li>
                    <li><CheckCircle2 />Customised with business details, services, CTA, form, hours, and colours</li>
                    <li><CheckCircle2 />Used for Pro Yearly and Agency / Multi-Location free builds</li>
                  </ul>
                  <div className="mt-auto flex flex-col gap-3">
                    <Button
                      className="w-full bg-gold text-black hover:bg-gold-light"
                      onClick={() => scrollToForm("Get a website built", "Free website build with Pro Yearly", template.name)}
                    >
                      Use {template.name}
                    </Button>
                    <a
                      href={template.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-gold hover:underline"
                    >
                      {template.linkLabel || "View GitHub repo"} <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
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
              { title: "Template", copy: "We choose the closest approved template as the starting point.", Icon: Sparkles },
              { title: "Customise", copy: "We swap in business details, services, local proof, images, colours, and emergency calls-to-action.", Icon: Wrench },
              { title: "Launch", copy: "We get the site ready around your details, service area, and preferred customer contact route.", Icon: ShieldCheck },
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
                {enquiryType === "Claim free listing"
                  ? "Submit a Claim Request"
                  : selectedPackage === "Not sure yet"
                    ? "Ask About the Free Website Build"
                    : selectedPackage}
              </h2>
              <p className="mt-3 text-muted-foreground">This starts a manual enquiry. No payment is taken here.</p>
            </div>
            <BusinessEnquiryForm
              region={region}
              defaultEnquiryType={enquiryType}
              defaultPackage={selectedPackage}
              defaultTradeStyle={selectedTradeStyle}
            />
          </div>
        </section>
      </main>
      <Footer countryCode={isUS ? "US" : "GB"} />
    </div>
  );
}
