import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
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

  if (posts.length === 0) return null;

  const resolveImage = (path: string | null): string | undefined => {
    if (!path) return undefined;
    if (path.startsWith("http")) return path;
    let normalized = path.startsWith("/") ? path : `/${path}`;
    if (/\.(png|svg)$/i.test(normalized)) {
      normalized = normalized.replace(/\.(png|svg)$/i, ".webp");
    }
    return normalized;
  };

  return (
    <section className="container-wide py-16">
      <div className="flex items-end justify-between mb-10">
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

      <div className="grid md:grid-cols-3 gap-8">
        {posts.map((post) => {
          const img = resolveImage(post.cover_image);
          return (
            <Link
              key={post.id}
              to={`${countryPrefix}/blog/${post.slug}`}
              className="group block rounded-xl border border-border/40 bg-card/40 hover:border-gold/40 transition-colors overflow-hidden"
            >
              {img && (
                <div className="aspect-[16/9] overflow-hidden bg-muted">
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
                </div>
              )}
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
