import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { format, isValid } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { SEO } from "@/components/SEO";
import { AdSlot } from "@/components/AdSlot";
import { useSimpleTheme } from "@/components/simple-theme";
import { useLocalization } from "@/contexts/LocalizationContext";
import { HomeEmergencyAd } from "@/components/HomeEmergencyAd";
import { LocalErrorBoundary } from "@/components/LocalErrorBoundary";

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    cover_image: string | null;
    published_at: string;
    created_at: string;
}

export default function BlogPage() {
    const { setTheme } = useSimpleTheme();
    const { settings } = useLocalization();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [heroImageError, setHeroImageError] = useState(false);
    const [cardImageErrors, setCardImageErrors] = useState<Set<string>>(new Set());

    const getImageUrl = (path: string | null): string | undefined => {
        if (!path) return undefined;
        if (path.startsWith('http')) return path;
        if (path.startsWith('/')) return path;
        return `/${path}`;
    };

    const handleCardImageError = (postId: string) => {
        setCardImageErrors(prev => new Set(prev).add(postId));
    };

    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const port = typeof window !== 'undefined' ? window.location.port : '';
    const isUSDomain = hostname.includes('emergencycontractors.net') || (hostname === 'localhost' && port === '3001') || (hostname === '127.0.0.1' && port === '3001');
    const countryPrefix = (settings.countryCode === 'US' && !isUSDomain) ? '/us' : '';
    const siteName = isUSDomain ? 'Emergency Contractors' : 'Emergency Tradesmen';

    const regionalizeText = (text: string) => {
        if (!text) return '';
        const cleanText = text.replace(/^#+\s*/, '');
        if (settings.countryCode !== 'US') return cleanText;
        return cleanText
            .replace(/Tradesmen/g, 'Contractors')
            .replace(/tradesmen/g, 'contractors')
            .replace(/Tradesperson/g, 'Contractor')
            .replace(/tradesperson/g, 'contractor')
            .replace(/UK/g, 'US');
    };

    useEffect(() => {
        setTheme('light');
    }, []);

    useEffect(() => {
        async function loadPosts() {
            try {
                const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
                const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

                const url = `${supabaseUrl}/rest/v1/posts?select=id,title,slug,excerpt,cover_image,published_at,created_at&published=eq.true&order=published_at.desc`;

                const response = await fetch(url, {
                    headers: {
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${supabaseKey}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'count=exact'
                    }
                });

                if (!response.ok) {
                    setIsLoading(false);
                    return;
                }

                const data = await response.json();

                if (!data || data.length === 0) {
                    setIsLoading(false);
                    return;
                }

                // Strict Regional Filtering: Only show posts that match the current country code suffix
                const regionalData = data.filter(post => {
                    if (!post) return false;
                    try {
                        const slug = (post.slug || "").toString().toLowerCase();
                        const isUS = slug.endsWith('-us') || slug.endsWith('-usa') || slug.includes('-us-') || slug.includes('-usa-');
                        const isUK = slug.endsWith('-gb') || slug.endsWith('-uk') || slug.includes('-gb-') || slug.includes('-uk-');
                        
                        if (settings.countryCode === 'US') {
                            return isUS || !isUK;
                        } else {
                            return isUK || !isUS;
                        }
                    } catch (err) {
                        return false;
                    }
                });

                // Client-side deduplication as a safety measure (dedupe by title and image)
                const uniquePosts: BlogPost[] = [];
                const seenTitles = new Set();
                const seenImages = new Set();
                for (const post of regionalData) {
                    try {
                        const title = (post.title || "").toString().toLowerCase().trim();
                        const image = post.cover_image;
                        if (!seenTitles.has(title) && (!image || !seenImages.has(image))) {
                            seenTitles.add(title);
                            if (image) seenImages.add(image);
                            uniquePosts.push(post);
                        }
                    } catch (err) {
                        // Silently skip problematic posts
                    }
                }

                setPosts(uniquePosts);
            } catch (err) {
                // Silently handle load errors
            } finally {
                setIsLoading(false);
            }
        }

        loadPosts();
    }, [settings.countryCode]);

    // Featured Post Logic (First post is featured)
    const featuredPost = posts[0];
    const regularPosts = posts.slice(1);

    return (
        <LocalErrorBoundary>
            <div className="min-h-screen bg-background text-foreground selection:bg-gold/30">
            <SEO
                title={`Emergency ${settings.tradeTerm} Blog — Safety Guides & Expert Tips`}
                description={`Expert home safety guides, emergency repair tips, and maintenance advice for UK homeowners. Learn how to handle plumbing, electrical & HVAC emergencies. Read now.`}
                canonical={`${countryPrefix}/blog`}
            />

            {/* "Newspaper" Header Bar */}
            <div className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
                <div className="container mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="text-xl font-display font-bold tracking-tighter hover:text-gold transition-colors">
                            The Dispatch.
                        </Link>
                        <div className="hidden md:flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-muted-foreground border-l border-border/50 pl-4">
                            <span>{format(new Date(), 'EEEE, MMMM do')}</span>
                            <span className="text-gold">•</span>
                            <span>Valid {settings.countryCode}</span>
                        </div>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="container mx-auto px-4 py-20">
                    <div className="animate-pulse space-y-8">
                        <div className="h-[60vh] bg-secondary/30 rounded-xl" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[1, 2, 3].map(i => <div key={i} className="h-64 bg-secondary/20 rounded-lg" />)}
                        </div>
                    </div>
                </div>
            ) : posts.length > 0 ? (
                <>
                    <div className="container mx-auto px-4 pt-10 pb-6">
                        <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight text-foreground">
                            Emergency {settings.tradeTerm} Blog
                        </h1>
                    </div>

                    {/* "Netflix" Hero Section - Featured Post */}
                    {featuredPost && (
                        <div className="relative w-full overflow-hidden group">
                            {/* Mobile: Stacked layout | Desktop: Side-by-side with 9:16 image */}
                            <div className="flex flex-col md:flex-row">
                                {/* Image Section */}
                                <div className="relative w-full md:w-[40%] h-[50vh] md:aspect-auto md:h-[85vh] shrink-0">
                                    {featuredPost.cover_image && !heroImageError ? (
                                        <img
                                            src={getImageUrl(featuredPost.cover_image)}
                                            alt={featuredPost.title}
                                            className="w-full h-full object-cover transition-transform duration-[20s] ease-linear group-hover:scale-105"
                                            loading="eager"
                                            onError={() => setHeroImageError(true)}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-primary/30 via-secondary/40 to-muted flex items-center justify-center">
                                            <span className="text-6xl font-display font-black text-foreground/20">{regionalizeText(featuredPost.title).split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-background/60" />
                                </div>

                                {/* Content Section */}
                                <div className="relative w-full md:w-[60%] md:h-[85vh] flex items-end md:items-center p-6 sm:p-10 md:p-16 lg:p-24">
                                    <div className="max-w-2xl space-y-4 md:space-y-6 animate-fade-up">
                                        <Badge className="bg-gold text-black hover:bg-gold/90 border-none uppercase tracking-widest px-3 py-1 font-bold text-[10px] md:text-sm">
                                            Cover Story
                                        </Badge>
                                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black leading-[1.1] text-foreground drop-shadow-lg text-balance">
                                            <Link to={`${countryPrefix}/blog/${featuredPost.slug}`} className="hover:underline decoration-gold/50 underline-offset-8">
                                                {regionalizeText(featuredPost.title)}
                                            </Link>
                                        </h2>
                                        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl font-light leading-relaxed drop-shadow-md line-clamp-2 md:line-clamp-3">
                                            {featuredPost.excerpt}
                                        </p>

                                        <div className="flex items-center gap-4 pt-2 md:pt-4">
                                            <Button asChild size="lg" className="h-12 md:h-14 px-6 md:px-8 text-base md:text-lg bg-white text-black hover:bg-gold hover:text-black border-none rounded-none transition-all font-bold tracking-tight">
                                                <Link to={`${countryPrefix}/blog/${featuredPost.slug}`}>
                                                    Read Article
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Ad Slot */}
                    <div className="container mx-auto px-4 -mt-8 relative z-20 mb-16">
                        <div className="bg-background/50 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-2xl">
                            <AdSlot slot="AD_SLOT_BLOG_HERO" format="leaderboard" />
                        </div>
                    </div>

                    <div className="container mx-auto px-4 mb-16">
                        <HomeEmergencyAd />
                    </div>

                    {/* "Newspaper" Grid Section */}
                    <div className="container mx-auto px-4 pb-24">
                        <div className="flex items-center justify-between mb-12 border-b-2 border-foreground/10 pb-4">
                            <h2 className="text-3xl font-display font-bold">Latest Dispatches</h2>
                            <span className="text-sm font-mono uppercase tracking-widest text-muted-foreground">Edition {new Date().getFullYear()}.{new Date().getMonth() + 1}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-12">
                            {regularPosts.map((post, index) => {
                                // Dynamic Layout Logic: First 2 posts are large (6 cols), rest are smaller (4 cols)
                                const isLarge = index < 2;
                                const colSpan = isLarge ? "lg:col-span-6" : "lg:col-span-4";

                                return (
                                    <Link
                                        key={post.id}
                                        to={`${countryPrefix}/blog/${post.slug}`}
                                        className={`${colSpan} group flex flex-col gap-4 glass-blog-card hover-lift p-6 rounded-2xl border-none`}
                                    >
                                        <div className="aspect-[16/10] w-full overflow-hidden rounded-md bg-muted/50 relative">
                                            {post.cover_image && !cardImageErrors.has(post.id) ? (
                                                <img
                                                    src={getImageUrl(post.cover_image)}
                                                    alt={regionalizeText(post.title)}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale-[20%] group-hover:grayscale-0"
                                                    onError={() => handleCardImageError(post.id)}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-primary/30 via-secondary/40 to-muted flex items-center justify-center">
                                                    <span className="text-3xl font-display font-black text-foreground/30">{regionalizeText(post.title).split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                                                <span>{(() => {
                                                    const dString = post.published_at || post.created_at;
                                                    const d = Array.isArray(dString) ? new Date(dString[0]) : new Date(dString);
                                                    return isValid(d) ? format(d, 'MMM d') : 'March 2026';
                                                })()}</span>
                                                <span className="w-px h-3 bg-border" />
                                                <span className="text-gold font-bold group-hover:text-gold-dark transition-colors">Briefing</span>
                                            </div>

                                            <h3 className={`font-display font-bold leading-tight group-hover:text-primary transition-colors ${isLarge ? 'text-3xl' : 'text-xl'}`}>
                                                {regionalizeText(post.title)}
                                            </h3>

                                            <p className="text-muted-foreground line-clamp-3 leading-relaxed text-sm">
                                                {post.excerpt}
                                            </p>

                                            <div className="pt-2 flex items-center text-sm font-bold text-foreground group-hover:translate-x-1 transition-transform">
                                                Read Analysis <ArrowRight className="w-4 h-4 ml-2 text-gold" />
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </>
            ) : (
                <div className="min-h-[50vh] flex flex-col items-center justify-center">
                    <h3 className="text-2xl font-display font-bold mb-2">No dispatches found</h3>
                    <p className="text-muted-foreground">Check back for future updates.</p>
                </div>
            )}
        </div>
        </LocalErrorBoundary>
    );
}
