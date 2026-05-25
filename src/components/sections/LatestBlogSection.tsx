import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Wrench } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLocalization } from "@/contexts/LocalizationContext";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  published_at: string;
}

const fallbackGuidesByRegion: Record<"US" | "GB", BlogPost[]> = {
  US: [
    {
      id: "fallback-us-water-heater",
      title: "Water Heater Leaking? What to Shut Off First",
      slug: "",
      excerpt: "A fast homeowner checklist for stopping water damage, isolating power or gas, and knowing when to call an emergency contractor.",
      cover_image: "/images/blog/us-water-heater-hero.png",
      published_at: "2026-05-24T00:00:00.000Z",
    },
    {
      id: "fallback-us-storm-board-up",
      title: "Storm Damage Board-Up: What to Do Before Help Arrives",
      slug: "",
      excerpt: "How to protect the property, document damage safely, and keep broken openings secure after severe weather.",
      cover_image: "/images/blog/us-storm-board-up-hero.webp",
      published_at: "2026-05-24T00:00:00.000Z",
    },
    {
      id: "fallback-us-ac-freezing",
      title: "AC Lines Freezing? Warning Signs Before It Fails",
      slug: "",
      excerpt: "What frozen refrigerant lines can mean, what to switch off, and when an emergency HVAC contractor should inspect it.",
      cover_image: "/images/blog/us-ac-freezing-ice-lines-hero.webp",
      published_at: "2026-05-24T00:00:00.000Z",
    },
  ],
  GB: [
    {
      id: "fallback-uk-fuse-box",
      title: "Fuse Box Tripping? The Safe Checks to Make First",
      slug: "",
      excerpt: "A quick guide to isolating the fault, avoiding repeat trips, and deciding when an emergency electrician is needed.",
      cover_image: "/images/blog/uk-fuse-box-tripping-hero.png",
      published_at: "2026-05-24T00:00:00.000Z",
    },
    {
      id: "fallback-uk-radiator-cold",
      title: "Radiator Cold at the Bottom? What It Means",
      slug: "",
      excerpt: "Simple signs that point to trapped air, sludge, or a heating fault before you book urgent help.",
      cover_image: "/images/blog/uk-radiator-cold-hero.png",
      published_at: "2026-05-24T00:00:00.000Z",
    },
    {
      id: "fallback-uk-outside-tap",
      title: "Outside Tap Leaking? Stop the Water Safely",
      slug: "",
      excerpt: "How to isolate an outdoor leak, reduce water damage, and decide whether a plumber needs to attend urgently.",
      cover_image: "/images/blog/uk-outside-tap-leaking-hero.png",
      published_at: "2026-05-24T00:00:00.000Z",
    },
  ],
};

export function LatestBlogSection() {
  const { settings } = useLocalization();
  const [posts, setPosts] = useState<BlogPost[]>([]);

  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  const port = typeof window !== "undefined" ? window.location.port : "";
  const isUSDomain =
    hostname.includes("emergencycontractors.net") ||
    (hostname === "localhost" && port === "3001") ||
    (hostname === "127.0.0.1" && port === "3001");
  const countryPrefix = settings.countryCode === "US" && !isUSDomain ? "/us" : "";

  const regionalizeText = (text: string) => {
    if (!text) return "";
    const cleanText = text.replace(/^#+\s*/, "");
    if (settings.countryCode !== "US") return cleanText;
    return cleanText
      .replace(/Tradesmen/g, "Contractors")
      .replace(/tradesmen/g, "contractors")
      .replace(/Tradesperson/g, "Contractor")
      .replace(/tradesperson/g, "contractor")
      .replace(/UK/g, "US");
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Fetch more posts to allow for regional filtering
      const { data } = await supabase
        .from("posts")
        .select("id, title, slug, excerpt, cover_image, published_at")
        .eq("published", true)
        .order("published_at", { ascending: false })
        .limit(15);

      if (!cancelled && data) {
        const regionalData = data.filter((post) => {
          if (!post) return false;
          try {
            const slug = (post.slug || "").toString().toLowerCase();
            const isUS = slug.endsWith("-us") || slug.endsWith("-usa") || slug.includes("-us-") || slug.includes("-usa-");
            const isUK = slug.endsWith("-gb") || slug.endsWith("-uk") || slug.includes("-gb-") || slug.includes("-uk-");

            if (settings.countryCode === "US") {
              return isUS || !isUK;
            } else {
              return isUK || !isUS;
            }
          } catch (err) {
            return false;
          }
        });

        setPosts(regionalData.slice(0, 3) as BlogPost[]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [settings.countryCode]);

  const resolveImage = (path: string | null): string | undefined => {
    if (!path) return undefined;
    if (path.startsWith("http")) return path;
    let normalized = path.startsWith("/") ? path : `/${path}`;
    if (/\.(png|svg)$/i.test(normalized)) {
      normalized = normalized.replace(/\.(png|svg)$/i, ".webp");
    }
    return normalized;
  };

  const displayPosts = [...posts];
  const fallbackGuides =
    settings.countryCode === "US" ? fallbackGuidesByRegion.US : fallbackGuidesByRegion.GB;

  for (const fallbackGuide of fallbackGuides) {
    if (displayPosts.length >= 3) break;
    if (!displayPosts.some((post) => post.id === fallbackGuide.id || post.title === fallbackGuide.title)) {
      displayPosts.push(fallbackGuide);
    }
  }

  if (displayPosts.length === 0) return null;

  return (
    <section className="landing-dispatch-section container-wide pt-4 pb-4 md:pt-6 md:pb-6">
      <div className="landing-dispatch-heading flex items-end justify-between mb-10">
        <div>
          <p className="text-gold uppercase tracking-luxury text-sm mb-2">The Dispatch</p>
          <h2 className="font-display text-3xl md:text-4xl tracking-wide text-foreground">
            Latest Emergency Guides
          </h2>
        </div>
        <Link
          to={`${countryPrefix}/blog`}
          className="hidden md:inline-flex items-center gap-2 text-sm text-gold hover:text-foreground transition-colors"
        >
          All articles <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="landing-dispatch-grid grid md:grid-cols-3 gap-8">
        {displayPosts.map((post) => {
          const img = resolveImage(post.cover_image);
          const postHref = post.slug ? `${countryPrefix}/blog/${post.slug}` : `${countryPrefix}/blog`;
          return (
            <Link
              key={post.id}
              to={postHref}
              className="landing-dispatch-card group block rounded-xl border border-border/40 bg-card/40 hover:border-gold/40 transition-colors"
            >
              <div className="landing-dispatch-media aspect-[16/9] overflow-hidden bg-muted">
                <div className="landing-dispatch-fallback" aria-hidden="true">
                  <Wrench className="landing-dispatch-fallback-icon" />
                  <span>Emergency Guide</span>
                  <strong>{regionalizeText(post.title).split("?")[0]}</strong>
                  <BookOpen className="landing-dispatch-fallback-mark" />
                </div>
                {img && (
                  <img
                    src={img}
                    alt={regionalizeText(post.title)}
                    loading="lazy"
                    width="640"
                    height="360"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
              </div>
              <div className="p-6">
                <h3 className="font-display text-lg text-foreground group-hover:text-gold transition-colors mb-2 line-clamp-2">
                  {regionalizeText(post.title)}
                </h3>
                {post.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="md:hidden mt-8 text-center">
        <Link
          to={`${countryPrefix}/blog`}
          className="inline-flex items-center gap-2 text-sm text-gold hover:text-foreground transition-colors"
        >
          All articles <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
