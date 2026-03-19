import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, ArrowRight } from "lucide-react";
import { SEO } from "@/components/SEO";
import { AdSlot } from "@/components/AdSlot";
import { useSimpleTheme } from "@/components/simple-theme";
import { useLocalization } from "@/contexts/LocalizationContext";
import { HomeEmergencyAd } from "@/components/HomeEmergencyAd";

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
            const { data, error } = await supabase
                .from('posts')
                .select('id, title, slug, excerpt, cover_image, published_at, created_at')
                .eq('published', true)
                .order('published_at', { ascending: false });

            if (error || !data) {
                setIsLoading(false);
                return;
            }

            // Strict Regional Filtering: Only show posts that match the current country code suffix
            const regionalData = data.filter(post => {
                const slug = post.slug.toLowerCase();
                // Determine if it has a suffix
                const isUS = slug.endsWith('-us') || slug.endsWith('-usa') || slug.includes('-us-') || slug.includes('-usa-');
                const isUK = slug.endsWith('-gb') || slug.endsWith('-uk') || slug.includes('-gb-') || slug.includes('-uk-');
                
                if (settings.countryCode === 'US') {
                    // Show US posts OR posts with NO suffix (Assume shared)
                    return isUS || !isUK;
                } else {
                    // Show UK posts OR posts with NO suffix
                    return isUK || !isUS;
                }
            });

            // Client-side deduplication as a safety measure (dedupe by title and image)
            const uniquePosts = [];
            const seenTitles = new Set();
            const seenImages = new Set();
            for (const post of regionalData) {
                const title = post.title.toLowerCase().trim();
                const image = post.cover_image;
                if (!seenTitles.has(title) && (!image || !seenImages.has(image))) {
                    seenTitles.add(title);
                    if (image) seenImages.add(image);
                    uniquePosts.push(post);
                }
            }

            setPosts(uniquePosts);
            setIsLoading(false);
        }

        loadPosts();
    }, [settings.countryCode]);

    // Featured Post Logic (First post is featured)
    const featuredPost = posts[0];
    const regularPosts = posts.slice(1);

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-gold/30">
            <SEO
                title={regionalizeText(`The Dispatch | ${siteName}`)}
                description={regionalizeText("Critical briefing: Expert advice, safety guides, and maintenance tips for homeowners.")}
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
                    {/* "Netflix" Hero Section - Featured Post */}
                    {featuredPost && (
                        <div className="relative w-full h-[85vh] overflow-hidden group">
                            {/* Background Image */}
                            <div className="absolute inset-0">
                                {featuredPost.cover_image && (
                                    <img
                                        src={featuredPost.cover_image}
                                        alt={featuredPost.title}
                                        className="w-full h-full object-cover transition-transform duration-[20s] ease-linear group-hover:scale-110"
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
                                <div className="absolute inset-0 bg-gradient-to-r from-background via-black/50 to-transparent" />
                            </div>

                            {/* Content Overlay */}
                            <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 lg:p-24 z-10">
                                <div className="max-w-4xl space-y-6 animate-fade-up">
                                    <Badge className="bg-gold text-black hover:bg-gold/90 border-none uppercase tracking-widest px-3 py-1 font-bold">
                                        Cover Story
                                    </Badge>
                                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-black leading-[1.1] text-white drop-shadow-lg text-balance">
                                        <Link to={`${countryPrefix}/blog/${featuredPost.slug}`} className="hover:underline decoration-gold/50 underline-offset-8">
                                            {regionalizeText(featuredPost.title)}
                                        </Link>
                                    </h1>
                                    <p className="text-lg md:text-2xl text-white/90 max-w-2xl font-light leading-relaxed drop-shadow-md line-clamp-3">
                                        {featuredPost.excerpt}
                                    </p>

                                    <div className="flex items-center gap-4 pt-4">
                                        <Button asChild size="lg" className="h-14 px-8 text-lg bg-white text-black hover:bg-gold hover:text-black border-none rounded-none transition-all font-bold tracking-tight">
                                            <Link to={`${countryPrefix}/blog/${featuredPost.slug}`}>
                                                Read Article
                                            </Link>
                                        </Button>
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
                                        className={`${colSpan} group flex flex-col gap-4 border-b border-border/30 pb-8`}
                                    >
                                        <div className="aspect-[16/10] w-full overflow-hidden rounded-md bg-secondary/20 relative">
                                            {post.cover_image && (
                                                <img
                                                    src={post.cover_image}
                                                    alt={regionalizeText(post.title)}
                                                    loading="lazy"
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale-[20%] group-hover:grayscale-0"
                                                />
                                            )}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                                                <span>{format(new Date(post.published_at || post.created_at), 'MMM d')}</span>
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
    );
}
