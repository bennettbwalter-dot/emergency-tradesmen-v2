import { CSSProperties, useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Eye, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { BusinessEnquiryForm } from "@/components/business/BusinessEnquiryForm";

type BusinessRegion = "UK" | "US";

type WebsiteStyle = {
  title: string;
  description: string;
  features: string[];
  headline: string;
  subhead: string;
  services: string[];
  trust: string[];
  accent: string;
  accentSoft: string;
  surface: string;
  previewImage: string;
  embedUrl?: string;
};

type WebsiteShowroomProps = {
  region: BusinessRegion;
};

const image = (name: string) => `/images/blog/generated/${name}`;
const DEFAULT_PREVIEW_IMAGE = image("emergency-repair-contractor-improve-not-move-gb.webp");

const showroomProof = [
  "Phone-first layouts",
  "Local service pages",
  "Trust-led enquiry flow",
];

const ukStyles: WebsiteStyle[] = [
  {
    title: "Emergency Plumber Website",
    description: "Built for burst pipes, leaks, blocked toilets, and urgent plumbing callouts.",
    features: ["Call Now first", "Leak and burst pipe service sections", "Local area pages"],
    headline: "Burst pipe? Get help fast.",
    subhead: "Emergency plumbing pages built around fast calls and clear trust.",
    services: ["Leaks", "Blocked toilets", "Burst pipes"],
    trust: ["24/7 calls", "WhatsApp ready", "Local pages"],
    accent: "#2f8cff",
    accentSoft: "rgba(47, 140, 255, 0.18)",
    surface: "#071522",
    previewImage: image("emergency-plumber-london-gb-new.webp"),
    embedUrl: "/showroom-templates/plumber-uk/index.html",
  },
  {
    title: "Emergency Electrician Website",
    description: "Built for power problems, tripped electrics, emergency repairs, and safety-first electrical callouts.",
    features: ["Urgent fault callouts", "Safety-first service copy", "Fast contact flow"],
    headline: "Power problem? We respond.",
    subhead: "High-contrast electrical pages for urgent faults and safe repairs.",
    services: ["Tripped electrics", "Fault finding", "Repairs"],
    trust: ["Fast contact", "Safety copy", "Service pages"],
    accent: "#ffc928",
    accentSoft: "rgba(255, 201, 40, 0.18)",
    surface: "#111007",
    previewImage: image("electrical-emergencies.webp"),
  },
  {
    title: "Emergency Locksmith Website",
    description: "Built for lockouts, broken keys, lock changes, and urgent entry help.",
    features: ["Lockout-focused layout", "Mobile-first Call Now", "Trust and response signals"],
    headline: "Locked out? Get back in.",
    subhead: "Security-led pages for urgent access and lock repairs.",
    services: ["Lockouts", "Broken keys", "Lock changes"],
    trust: ["Mobile-first", "Trust signals", "Clear fees"],
    accent: "#d5a855",
    accentSoft: "rgba(213, 168, 85, 0.2)",
    surface: "#11100d",
    previewImage: image("smart-lock-emergency-gb-new.webp"),
    embedUrl: "/showroom-templates/v0-compute-the-platform-to-build/index-preview.html",
  },
  {
    title: "Emergency Gas Engineer Website",
    description: "Built for boiler breakdowns, heating problems, gas-safe repair enquiries, and urgent heating support.",
    features: ["Boiler repair sections", "Heating emergency pages", "Trust-led layout"],
    headline: "Heating down? Help is close.",
    subhead: "Warm trust-led pages for boiler breakdowns and heating support.",
    services: ["Boiler repairs", "Heating faults", "Urgent callouts"],
    trust: ["Trust blocks", "Repair pages", "Quick enquiry"],
    accent: "#f97316",
    accentSoft: "rgba(249, 115, 22, 0.2)",
    surface: "#190c08",
    previewImage: image("uk-smell-gas-hero.webp"),
  },
  {
    title: "Emergency Drain Specialist Website",
    description: "Built for blocked drains, drain clearance, outdoor drainage problems, and emergency drainage callouts.",
    features: ["Blockage service pages", "Emergency drainage CTA", "Before/after gallery area"],
    headline: "Blocked drains cleared fast.",
    subhead: "Dark teal emergency pages built for urgent drainage searches.",
    services: ["Blocked drains", "Drain clearance", "Outdoor drains"],
    trust: ["Before/after", "Emergency CTA", "Area pages"],
    accent: "#19b7a5",
    accentSoft: "rgba(25, 183, 165, 0.2)",
    surface: "#061817",
    previewImage: image("emergency-drain-cleaning-gb.webp"),
  },
  {
    title: "Emergency Glazier Website",
    description: "Built for broken glass, window damage, boarding-up enquiries, and urgent glass repair work.",
    features: ["Broken glass callouts", "Boarding-up CTA", "Photo gallery section"],
    headline: "Broken glass made safe.",
    subhead: "Clean repair-focused pages for boarding-up and glass replacement.",
    services: ["Broken windows", "Boarding-up", "Glass repair"],
    trust: ["Photo gallery", "Safety copy", "Fast contact"],
    accent: "#7eb6df",
    accentSoft: "rgba(126, 182, 223, 0.2)",
    surface: "#0b1720",
    previewImage: "/blog/uk-broken-window-securing.webp",
  },
  {
    title: "Emergency Roofer Website",
    description: "Built for roof leaks, storm damage, slipped tiles, and urgent roof repair enquiries.",
    features: ["Storm damage sections", "Roof leak landing pages", "Review and trust blocks"],
    headline: "Roof leak? Stop the damage.",
    subhead: "Storm-ready roof repair pages for urgent calls and trust.",
    services: ["Roof leaks", "Storm damage", "Slipped tiles"],
    trust: ["Review blocks", "Leak pages", "Weather-ready"],
    accent: "#ef4444",
    accentSoft: "rgba(239, 68, 68, 0.2)",
    surface: "#160a0a",
    previewImage: image("emergency-roof-repair-gb.webp"),
  },
  {
    title: "Emergency Builder Website",
    description: "Built for urgent property repairs, structural issues, wall damage, and emergency building work.",
    features: ["Repair-focused service pages", "Project gallery", "Quote enquiry flow"],
    headline: "Urgent property repairs.",
    subhead: "Strong practical pages for structural work and repair enquiries.",
    services: ["Wall damage", "Repairs", "Structural work"],
    trust: ["Project gallery", "Quote flow", "Service pages"],
    accent: "#c59b63",
    accentSoft: "rgba(197, 155, 99, 0.22)",
    surface: "#17120c",
    previewImage: image("emergency-repair-contractor-improve-not-move-gb.webp"),
  },
  {
    title: "Water Restoration Website",
    description: "Built for water damage, drying, flood cleanup, damp prevention, and restoration enquiries.",
    features: ["Flood recovery sections", "Drying and restoration pages", "Emergency contact CTA"],
    headline: "Water damage restored.",
    subhead: "Calm credible pages for flood recovery and drying services.",
    services: ["Flood cleanup", "Drying", "Restoration"],
    trust: ["Emergency CTA", "Recovery pages", "Clear steps"],
    accent: "#22c7d5",
    accentSoft: "rgba(34, 199, 213, 0.2)",
    surface: "#07171d",
    previewImage: image("water-leaking-from-ceiling.webp"),
  },
  {
    title: "Breakdown Recovery Website",
    description: "Built for vehicle breakdowns, roadside recovery, towing, and emergency recovery calls.",
    features: ["Roadside recovery CTA", "Location-based service pages", "Mobile-first phone button"],
    headline: "Broken down? Keep moving.",
    subhead: "Roadside pages built around fast phone calls and location coverage.",
    services: ["Roadside recovery", "Towing", "Vehicle help"],
    trust: ["Phone-first", "Location pages", "24/7 response"],
    accent: "#f23b32",
    accentSoft: "rgba(242, 59, 50, 0.2)",
    surface: "#170909",
    previewImage: "/images/blog/auto/uk-car-battery-alternator-tow.webp",
    embedUrl: "/showroom-templates/breakdown-recovery-uk/index.html",
  },
  {
    title: "Air Conditioning Website",
    description: "Built for air conditioning repair, installation, servicing, and urgent cooling support.",
    features: ["Repair and service pages", "Seasonal callout sections", "Clean quote flow"],
    headline: "Cool air, clear contact.",
    subhead: "A bright climate layout for repairs, servicing, and seasonal demand.",
    services: ["AC repairs", "Installation", "Servicing"],
    trust: ["Clean quote flow", "Seasonal pages", "Call button"],
    accent: "#65b7ff",
    accentSoft: "rgba(101, 183, 255, 0.2)",
    surface: "#061521",
    previewImage: image("ac-blowing-warm-air-capacitor-leak-us.webp"),
  },
];

const usStyles: WebsiteStyle[] = [
  { ...ukStyles[0], description: "Built for burst pipes, leaks, clogged toilets, and urgent plumbing calls.", previewImage: image("emergency-plumber-signs-us-new.webp"), embedUrl: undefined },
  { ...ukStyles[1], description: "Built for power problems, tripped breakers, emergency repairs, and safety-first electrical calls.", services: ["Tripped breakers", "Fault finding", "Repairs"], previewImage: image("commercial-electrician-us-new.webp") },
  { ...ukStyles[2], previewImage: image("smart-lock-emergency-us-new.webp") },
  {
    ...ukStyles[3],
    title: "Emergency HVAC Website",
    description: "Built for heating and cooling problems, emergency repairs, and fast comfort calls.",
    headline: "No heat? No cool air?",
    subhead: "A comfort-first HVAC layout for urgent repair calls and seasonal demand.",
    services: ["Heating repair", "Cooling repair", "Emergency service"],
    trust: ["Seasonal CTAs", "City pages", "Fast quote"],
    previewImage: image("emergency-heat-pump-thaw-us.webp"),
  },
  { ...ukStyles[4], description: "Built for blocked drains, drain cleaning, sewer line problems, and emergency drainage calls.", services: ["Blocked drains", "Drain cleaning", "Sewer lines"], previewImage: image("emergency-drain-cleaning-us.webp") },
  { ...ukStyles[5], title: "Emergency Glass Repair Website", description: "Built for broken glass, window damage, board-up requests, and urgent glass repair work.", previewImage: image("home-security-safety.webp") },
  { ...ukStyles[6], description: "Built for roof leaks, storm damage, missing shingles, and urgent roof repair enquiries.", services: ["Roof leaks", "Storm damage", "Missing shingles"], previewImage: image("emergency-roof-repair-us.webp") },
  { ...ukStyles[7], title: "Emergency Builder / Construction Website", description: "Built for urgent property repairs, structural issues, storm damage, and construction enquiries.", services: ["Storm damage", "Repairs", "Construction"], previewImage: image("emergency-repair-contractor-improve-not-move-us.webp") },
  { ...ukStyles[8], description: "Built for water damage, drying, flood cleanup, mold prevention, and restoration enquiries.", previewImage: image("mould-remediation-us.webp") },
  { ...ukStyles[9], title: "Tow Truck / Roadside Recovery Website", description: "Built for breakdowns, towing, roadside help, and emergency recovery calls.", services: ["Towing", "Roadside help", "Vehicle recovery"], trust: ["Phone-first", "City pages", "24/7 response"], previewImage: "/images/blog/auto/uk-car-battery-alternator-tow.webp", embedUrl: undefined },
  { ...ukStyles[10], description: "Built for AC repair, installation, servicing, and urgent cooling support.", services: ["AC repair", "Installation", "Servicing"] },
];

const showroomStyleOrder = [0, 2, 9, 1, 3, 4, 5, 6, 7, 8, 10];
const orderedUkStyles = showroomStyleOrder.map((index) => ukStyles[index]);
const orderedUsStyles = showroomStyleOrder.map((index) => usStyles[index]);

function previewVars(style: WebsiteStyle) {
  return {
    "--style-accent": style.accent,
    "--style-accent-soft": style.accentSoft,
    "--style-surface": style.surface,
  } as CSSProperties;
}

const EMBED_PREVIEW_WIDTH = 960;

function TemplatePreviewImage({ src }: { src: string }) {
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  return (
    <img
      src={currentSrc}
      alt=""
      className="template-photo"
      loading="eager"
      decoding="async"
      onError={() => {
        if (currentSrc !== DEFAULT_PREVIEW_IMAGE) {
          setCurrentSrc(DEFAULT_PREVIEW_IMAGE);
        }
      }}
    />
  );
}

function WebsitePreviewEmbed({ style }: { style: WebsiteStyle }) {
  const screenRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState({ scale: 0.5, height: 900 });
  const isStaticV0Export = style.embedUrl?.includes("v0-compute-the-platform-to-build");

  useEffect(() => {
    const el = screenRef.current;
    if (!el) return;

    const updateFrame = () => {
      const width = el.clientWidth;
      const height = el.clientHeight;
      if (width <= 0 || height <= 0) return;

      const scale = Math.min(1, width / EMBED_PREVIEW_WIDTH);
      setFrame({
        scale,
        height: Math.max(900, Math.ceil(height / scale)),
      });
    };

    updateFrame();
    const resizeObserver = new ResizeObserver(updateFrame);
    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div className="showroom-template showroom-template--embed" style={previewVars(style)}>
      <div className="showroom-browser-bar" aria-hidden="true">
        <span />
        <span />
        <span />
        <strong>{style.title}</strong>
      </div>
      <div ref={screenRef} className="showroom-template-screen showroom-template-screen--embed" tabIndex={0}>
        <iframe
          src={style.embedUrl}
          title={style.title}
          loading="eager"
          sandbox={isStaticV0Export ? "allow-same-origin" : "allow-scripts allow-same-origin"}
          scrolling="yes"
          className="showroom-template-iframe"
          style={{
            width: `${EMBED_PREVIEW_WIDTH}px`,
            height: `${frame.height}px`,
            transform: `scale(${frame.scale})`,
          }}
        />
      </div>
    </div>
  );
}

function WebsitePreview({ style, region }: { style: WebsiteStyle; region: BusinessRegion }) {
  if (style.embedUrl) {
    return <WebsitePreviewEmbed style={style} />;
  }

  const supportCta = region === "UK" ? "WhatsApp" : "Request Quote";
  const shortTitle = style.title.replace(" Website", "");

  return (
    <div className="showroom-template" style={previewVars(style)}>
      <div className="showroom-browser-bar" aria-hidden="true">
        <span />
        <span />
        <span />
        <strong>{shortTitle}</strong>
      </div>
      <div className="showroom-template-screen" tabIndex={0}>
        <TemplatePreviewImage src={style.previewImage} />
        <div className="template-vignette" aria-hidden="true" />
        <div className="template-nav">
          <div className="template-brand">
            <span className="template-mark" />
            <span>{shortTitle}</span>
          </div>
          <span className="template-call">Call 24/7</span>
        </div>
        <div className="template-hero">
          <p className="template-eyebrow">Emergency-ready layout</p>
          <h3>{style.headline}</h3>
          <p>{style.subhead}</p>
          <div className="template-actions">
            <span>Call Now</span>
            <span>{supportCta}</span>
          </div>
        </div>
        <div className="template-service-panel">
          {style.services.map((service) => <span key={service}>{service}</span>)}
        </div>
        <div className="template-trust-row">
          {style.trust.map((item) => (
            <span key={item}><ShieldCheck />{item}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function WebsiteShowroom({ region }: WebsiteShowroomProps) {
  const [selectedStyle, setSelectedStyle] = useState<WebsiteStyle | undefined>();
  const formRef = useRef<HTMLElement>(null);
  const isUS = region === "US";
  const styles = isUS ? orderedUsStyles : orderedUkStyles;
  const brand = isUS ? "EmergencyContractors" : "EmergencyTradesmen";
  const ownerPath = isUS ? "/for-contractors" : "/for-tradesmen";
  const audience = isUS ? "contractors and home service businesses" : "trades businesses";
  const customizeWord = isUS ? "customize" : "customise";
  const title = isUS
    ? "Emergency-Ready Website Showroom for Local Contractors"
    : "Emergency-Ready Website Showroom for Local Tradesmen";

  const chooseStyle = (style: WebsiteStyle) => {
    setSelectedStyle(style);
    window.setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  return (
    <div className="showroom-page min-h-screen bg-background text-foreground">
      <SEO
        title={`${title} | ${brand}`}
        description={`Browse premium emergency-ready website styles for ${audience}.`}
        canonical={`${ownerPath}/website-showroom`}
      />
      <Header />
      <main>
        <section className="showroom-hero">
          <div className="container-wide showroom-hero-grid">
            <div>
              <p className="showroom-pill"><Eye /> Website showroom</p>
              <h1>{title}</h1>
              <p className="showroom-hero-copy">
                Browse premium website styles built for {audience} that need more local emergency calls. Pick a style you like, then enquire and we'll {customizeWord} it with your business name, services, phone number, reviews, photos, and branding.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button className="min-h-12 bg-gold text-black hover:bg-gold-light" onClick={() => document.getElementById("showroom-styles")?.scrollIntoView({ behavior: "smooth" })}>
                  View Website Styles <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button asChild variant="outline" className="min-h-12 border-white/20 bg-white/5 text-white hover:bg-white/10">
                  <Link to={ownerPath}>Main Enquiry Page</Link>
                </Button>
              </div>
              <div className="showroom-proof-row" aria-label="Website showroom highlights">
                {showroomProof.map((item) => (
                  <span key={item}><CheckCircle2 />{item}</span>
                ))}
              </div>
            </div>
            <div className="showroom-hero-previews">
              <WebsitePreview style={styles[0]} region={region} />
              <WebsitePreview style={styles[1]} region={region} />
            </div>
          </div>
        </section>

        <section id="showroom-styles" className="showroom-gallery-section">
          <div className="container-wide px-4">
            <div className="mb-10 max-w-4xl">
              <p className="showroom-kicker">Top 4 first, 11 total website styles</p>
              <h2 className="showroom-heading font-display">Choose an emergency-ready website style</h2>
              <p className="showroom-lede">
                Start with the four strongest conversion layouts, then browse the full showroom. Every preview is built around emergency CTAs, local service pages, trust sections, and a clear enquiry path.
              </p>
            </div>
            <div className="showroom-priority-strip" aria-label="Recommended showroom order">
              {styles.slice(0, 4).map((style, index) => (
                <button key={style.title} type="button" onClick={() => chooseStyle(style)}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{style.title.replace(" Website", "")}</strong>
                </button>
              ))}
            </div>
            <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
              {styles.map((style, index) => (
                <article key={style.title} className="showroom-style-card">
                  <WebsitePreview style={style} region={region} />
                  <div className="showroom-card-body">
                    <p className="showroom-card-meta">{String(index + 1).padStart(2, "0")} / Preview style</p>
                    <h3 className="showroom-card-title">{style.title}</h3>
                    <p className="showroom-card-copy">{style.description}</p>
                    <ul className="showroom-feature-list">
                      {style.features.map((feature) => (
                        <li key={feature}><CheckCircle2 /><span>{feature}</span></li>
                      ))}
                    </ul>
                    <Button className="showroom-cta" onClick={() => chooseStyle(style)}>Enquire About This Style</Button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section ref={formRef} id="showroom-enquiry" className="container-wide px-4 py-16">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 text-center">
              <h2 className="font-display text-4xl font-semibold">
                {selectedStyle ? `Enquire About ${selectedStyle.title}` : "Start a Website Enquiry"}
              </h2>
              <p className="mt-3 text-muted-foreground">This sends an enquiry only. It does not create, publish, or charge for a website.</p>
            </div>
            <BusinessEnquiryForm
              region={region}
              defaultEnquiryType="Get a website built"
              defaultPackage="Not sure yet"
              defaultTradeStyle={selectedStyle?.title}
            />
          </div>
        </section>
      </main>
      <Footer countryCode={isUS ? "US" : "GB"} />
    </div>
  );
}
