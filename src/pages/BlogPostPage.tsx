import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { format, isValid } from "date-fns";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Calendar, User, ChevronRight, Zap, CheckCircle2, AlertCircle, Sun, Moon, ExternalLink, Phone } from "lucide-react";

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    cover_image: string | null;
    published_at: string;
    created_at: string;
}

function safeUnescape(str: string): string {
    if (!str || typeof str !== 'string') return "";
    return str
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&');
}

function safeFormatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return "March 2026";
    const d = new Date(dateStr);
    if (!isValid(d)) return "March 2026";
    return format(d, 'MMMM d, yyyy');
}

function getImageUrl(path: string | null): string | undefined {
    if (!path) return undefined;
    if (path.startsWith('http')) return path;
    if (path.startsWith('/')) return path;
    return `/${path}`;
}

export default function BlogPostPage() {
    const { slug } = useParams<{ slug: string }>();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isWhiteMode, setIsWhiteMode] = useState(true);

    useEffect(() => {
        async function loadPost() {
            if (!slug) {
                setIsLoading(false);
                return;
            }
            try {
                const { data, error } = await supabase
                    .from('posts')
                    .select('*')
                    .eq('slug', slug)
                    .single();

                if (!error && data) {
                    setPost(data);
                    
                    const isUS = slug.toLowerCase().includes('usa') || slug.toLowerCase().includes('-us');
                    const { data: relatedData } = await supabase
                        .from('posts')
                        .select('id, title, slug, excerpt, cover_image, published_at, created_at')
                        .eq('published', true)
                        .neq('id', data.id)
                        .order('published_at', { ascending: false })
                        .limit(10);

                    if (relatedData) {
                        let filtered = relatedData.filter(p => {
                            const s = p.slug?.toLowerCase() || "";
                            const pIsUS = s.includes('usa') || s.includes('-us');
                            const pIsUK = s.includes('-gb') || s.includes('-uk');
                            return isUS ? (pIsUS || (!pIsUK)) : (pIsUK || (!pIsUS));
                        });

                        if (filtered.length === 0) filtered = relatedData;
                        setRelatedPosts(filtered.slice(0, 3) as BlogPost[]);
                    }
                }
            } catch (err) {
                console.error("Failed to load post:", err);
            } finally {
                setIsLoading(false);
            }
        }
        loadPost();
    }, [slug]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center p-4">
                <h1 className="text-2xl font-display text-gold mb-4 uppercase tracking-widest font-black">Archive Void</h1>
                <Button asChild variant="outline" className="border-gold text-gold hover:bg-gold/10">
                    <Link to="/blog">Return To Index</Link>
                </Button>
            </div>
        );
    }

    const rawContent = (post.content || "").trim();
    const unescaped = safeUnescape(rawContent);
    const displayContent = unescaped
        .replace(/<html[^>]*>|<\/html>|<body[^>]*>|<\/body>|<head[^>]*>[\s\S]*?<\/head>|<meta[^>]*>|<title[^>]*>[\s\S]*?<\/title>|<header[^>]*>[\s\S]*?<\/header>|<\/header>|<footer[^>]*>[\s\S]*?<\/footer>|<\/footer>/gi, '');

    const isUS = slug?.toLowerCase().includes('usa') || slug?.toLowerCase().includes('-us');

    return (
        <div className={`min-h-screen font-sans transition-all duration-700 pb-20 overflow-x-hidden selection:bg-gold/30 selection:text-gold relative ${isWhiteMode ? 'white-mode-luxe text-neutral-900 bg-[#fefefe]' : 'bg-[#0a0a0a] text-neutral-100'}`}>
            <SEO
                title={`${post.title} | ${isUS ? 'Emergency Contractors' : 'Emergency Tradesmen'} Blog`}
                description={post.excerpt}
                canonical={`/blog/${post.slug}`}
                ogType="article"
                ogImage={post.cover_image || undefined}
            />

            {/* Premium Navigation */}
            <nav className={`sticky top-0 z-[100] backdrop-blur-3xl border-b h-20 flex items-center shadow-sm transition-all duration-500 ${isWhiteMode ? 'bg-white/80 border-neutral-100' : 'bg-black/80 border-white/5'}`}>
                <div className="container mx-auto px-6 h-full flex justify-between items-center">
                    <Link
                        to="/blog"
                        className={`flex items-center text-[10px] font-black uppercase tracking-[0.4em] transition-colors ${isWhiteMode ? 'text-neutral-900 hover:text-gold' : 'text-gold hover:text-white'}`}
                    >
                        <ArrowLeft className="w-4 h-4 mr-3" />
                        Archive
                    </Link>
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => setIsWhiteMode(!isWhiteMode)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all ${isWhiteMode ? 'border-neutral-200 bg-neutral-50 text-neutral-600 shadow-sm' : 'border-white/10 bg-white/5 text-gold'}`}
                        >
                            {isWhiteMode ? <><Moon className="w-3 h-3" /> Dark View</> : <><Sun className="w-3 h-3 text-gold" /> Light View</>}
                        </button>
                    </div>
                </div>
            </nav>

            <main className="container-wide w-full mx-auto px-4 sm:px-6 pt-10 md:pt-24 relative z-10">
                {/* 1. ASYMMETRICAL HEADER (9:16 HERO BALANCE) */}
                <header className="relative w-full mb-12 md:mb-24 overflow-visible">
                    {/* MOBILE OVERLAY VIEW */}
                    <div className="md:hidden relative w-full aspect-[4/5] sm:aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-gold/20">
                        {post.cover_image && (
                            <img 
                                src={getImageUrl(post.cover_image)} 
                                alt={post.title} 
                                className="absolute inset-0 w-full h-full object-cover" 
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pt-20" />
                        
                        <div className="absolute bottom-0 left-0 w-full p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="bg-gold text-black px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shadow-lg">2026 ARCHIVE</span>
                                <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Expert Report</span>
                            </div>
                            <h1 className="text-white text-2xl font-display font-black leading-tight italic drop-shadow-md">
                                {post.title}
                            </h1>
                            <div className="flex items-center gap-6 pt-2 border-t border-white/10">
                                <div className="flex items-center gap-2 text-white/70 text-[10px] uppercase font-bold tracking-widest">
                                    <Calendar className="w-3 h-3 text-gold/80" />
                                    {safeFormatDate(post.published_at || post.created_at)}
                                </div>
                                <div className="flex items-center gap-2 text-white/70 text-[10px] uppercase font-bold tracking-widest">
                                    <User className="w-3 h-3 text-gold/80" />
                                    {isUS ? "US Tech" : "UK Tech"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* DESKTOP SIDE-BY-SIDE VIEW */}
                    <div className="hidden md:flex flex-row items-center gap-20 p-16 bg-white/40 dark:bg-black/40 backdrop-blur-sm rounded-[3rem] border border-gold/10 shadow-xl">
                        <div className="header-text-block flex-1">
                            <div className={`flex items-center gap-4 text-[11px] uppercase font-black tracking-[0.3em] mb-10 opacity-70 ${isWhiteMode ? 'text-black' : 'text-gold'}`}>
                                <span className="bg-gold/10 text-gold px-3 py-1 rounded-lg border border-gold/20 font-black whitespace-nowrap">2026 ARCHIVE</span>
                                <ChevronRight className="w-3 h-3 opacity-40 shrink-0" />
                                <span className="text-neutral-500 whitespace-nowrap">EXPERT REPORT</span>
                            </div>
                            <h1 className="font-display text-7xl lg:text-8xl text-gold-gradient drop-shadow-xl text-balance leading-tight">
                                {post.title}
                            </h1>
                            <div className={`flex items-center gap-10 text-[12px] uppercase tracking-widest pt-10 mt-10 border-t transition-colors ${isWhiteMode ? 'border-neutral-100 text-neutral-500' : 'border-white/10 text-neutral-400'}`}>
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-gold/60" />
                                    {safeFormatDate(post.published_at || post.created_at)}
                                </div>
                                <div className="flex items-center gap-3 font-bold">
                                    <User className="w-5 h-5 text-gold/60" />
                                    {isUS ? "US Technical Lead" : "UK Technical Lead"}
                                </div>
                            </div>
                        </div>
                        {post.cover_image && (
                            <div className="header-portrait-img-container shadow-2xl w-[30%] shrink-0 aspect-[9/16] rounded-3xl overflow-hidden ring-1 ring-gold/20">
                                <img 
                                    src={getImageUrl(post.cover_image)} 
                                    alt={post.title} 
                                    className="header-portrait-img w-full h-full object-cover" 
                                />
                            </div>
                        )}
                    </div>
                </header>

                <div className="flex flex-col lg:flex-row gap-12 md:gap-20 relative pt-8 md:pt-12">
                    <article className="flex-1 max-w-4xl relative mx-auto w-full">
                        
                        {/* FIRST FUN FACT (AT THE TOP AS REQUESTED) */}
                        <aside className={`funky-fun-fact !mb-16 md:!mb-24 scale-100 !rotate-0 !translate-x-0 !shadow-[10px_10px_0px_#d7c08a] md:!shadow-[15px_15px_0px_#d7c08a] transition-all w-full md:w-[320px] md:float-right md:ml-8 ${isWhiteMode ? 'bg-white' : '!bg-[#111] !border-gold/30'}`}>
                            <div className="flex items-center gap-4 mb-4 md:mb-6">
                                <Zap className={`w-8 h-8 md:w-10 md:h-10 fill-current ${isWhiteMode ? 'text-black' : 'text-gold'}`} />
                                <h4 className={`m-0 font-black uppercase text-lg md:text-xl tracking-widest leading-none italic ${isWhiteMode ? 'text-black' : 'text-white'}`}>Fun Fact!</h4>
                            </div>
                            <p className={`text-lg md:text-xl leading-relaxed font-black m-0 italic shadow-sm p-6 md:p-8 rounded-xl ring-1 ${isWhiteMode ? 'text-black bg-gold/5 ring-gold/10' : 'text-white bg-gold/10 ring-gold/20'}`}>
                                {isUS ? "In 2026, over 70% of US home emergency contractors are now using remote thermal scoping to detect pipe leaks before they damage your ceiling." 
                                      : "Did you know? In 2026, the UK government launched the 'Improve, Not Move' tax incentive, specifically for energy-efficient emergency repairs."}
                            </p>
                        </aside>

                        <div 
                            className={`prose max-w-none transition-all duration-700 mx-auto w-full
                                ${isWhiteMode ? 'prose-neutral prose-xl sm:prose-2xl md:prose-3xl' : 'prose-invert prose-xl md:prose-2xl'}
                                prose-headings:text-gold prose-headings:font-display prose-headings:font-black prose-headings:tracking-tighter prose-headings:italic
                                prose-p:leading-[1.7] md:prose-p:leading-[1.75] prose-p:mb-8 md:prose-p:mb-12 prose-img:shadow-xl md:prose-img:shadow-2xl prose-img:border-0
                                prose-blockquote:border-l-[8px] md:prose-blockquote:border-l-[12px] prose-blockquote:border-l-gold prose-blockquote:bg-gold/5 prose-blockquote:py-10 md:prose-blockquote:py-16 prose-blockquote:px-8 md:prose-blockquote:px-16 prose-blockquote:rounded-r-2xl md:prose-blockquote:rounded-r-3xl prose-blockquote:not-italic prose-blockquote:text-gold prose-blockquote:text-3xl md:prose-blockquote:text-5xl prose-blockquote:font-display prose-blockquote:font-black
                                [&_ul]:list-disc [&_ul]:pl-8 md:[&_ul]:pl-12 [&_ul]:mb-8 md:[&_ul]:mb-12
                            `}
                            dangerouslySetInnerHTML={{ __html: displayContent }}
                        />

                        {/* BALANCED DO'S & DON'TS GRID */}
                        {!displayContent.includes('split-dos-donts') && (
                            <section className="split-dos-donts border-y border-gold/10 py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                                <div className={`dos-column shadow-sm transition-all p-8 md:p-12 ${isWhiteMode ? 'bg-emerald-50 border-emerald-100' : 'bg-emerald-950/20 border-emerald-900/50'}`}>
                                    <h4 className={`flex items-center gap-4 md:gap-5 font-black uppercase text-xl md:text-2xl mb-8 md:mb-10 ${isWhiteMode ? 'text-emerald-600' : 'text-emerald-400'}`}><CheckCircle2 className="w-6 h-6 md:w-8 md:h-8" /> Safe DIY Checks</h4>
                                    <ul className="list-none p-0 space-y-6 md:space-y-8 flex-1">
                                        <li className="flex flex-col gap-2 md:gap-3">
                                            <span className={`flex items-center gap-3 text-lg md:text-xl font-bold ${isWhiteMode ? 'text-emerald-700' : 'text-white'}`}>✓ Surface Visuals</span>
                                            <p className={`text-base md:text-[17px] m-0 leading-relaxed font-semibold transition-colors ${isWhiteMode ? 'text-neutral-600' : 'text-neutral-300'}`}>Check for moisture spotting and sensor battery life regularly.</p>
                                        </li>
                                    </ul>
                                </div>
                                <div className={`donts-column shadow-sm transition-all p-8 md:p-12 ${isWhiteMode ? 'bg-red-50 border-red-100' : 'bg-red-950/20 border-red-900/50'}`}>
                                    <h4 className={`flex items-center gap-4 md:gap-5 font-black uppercase text-xl md:text-2xl mb-8 md:mb-10 ${isWhiteMode ? 'text-red-600' : 'text-red-400'}`}><AlertCircle className="w-6 h-6 md:w-8 md:h-8" /> Legal Exclusions</h4>
                                    <ul className="list-none p-0 space-y-6 md:space-y-8 flex-1">
                                        <li className="flex flex-col gap-4 md:gap-6">
                                            <span className={`flex items-center gap-3 text-lg md:text-xl font-bold ${isWhiteMode ? 'text-red-700' : 'text-white'}`}>✗ Technical Systems</span>
                                            <div className="flex flex-wrap gap-3 md:gap-4 mt-2">
                                                <a href={isUS ? "https://www.osha.gov/" : "https://www.gassaferegister.co.uk/"} target="_blank" className={`px-4 md:px-5 py-2 md:py-3 rounded-xl text-[10px] md:text-xs font-black flex items-center gap-2 no-underline hover:bg-gold hover:text-black transition-all ${isWhiteMode ? 'bg-neutral-900 text-white' : 'bg-neutral-800 text-white border border-neutral-700'}`}>
                                                    {isUS ? "OSHA" : "GAS SAFE"} <ExternalLink className="w-3 h-3 md:w-4 md:h-4" />
                                                </a>
                                                <a href={isUS ? "https://www.nfpa.org/" : "https://electrical.theiet.org/"} target="_blank" className={`px-4 md:px-5 py-2 md:py-3 rounded-xl text-[10px] md:text-xs font-black flex items-center gap-2 no-underline hover:bg-gold hover:text-black transition-all ${isWhiteMode ? 'bg-neutral-900 text-white' : 'bg-neutral-800 text-white border border-neutral-700'}`}>
                                                    {isUS ? "NEC" : "IET"} REGS <ExternalLink className="w-3 h-3 md:w-4 md:h-4" />
                                                </a>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </section>
                        )}

                        {/* SECOND FUN FACT BOX (AT THE BOTTOM) */}
                        <aside className={`funky-fun-fact !mt-16 md:!mt-24 !border-gold/30 !shadow-none ring-1 ring-gold/10 p-8 md:p-16 text-center transition-all ${isWhiteMode ? '!bg-[#fcfbf7]' : '!bg-[#111]'}`}>
                            <div className="flex items-center justify-center gap-3 md:gap-4 mb-6 md:mb-8">
                                <Zap className="w-8 h-8 md:w-10 md:h-10 text-gold fill-current" />
                                <h4 className={`m-0 font-black uppercase text-2xl md:text-3xl tracking-widest italic tracking-luxury transition-colors ${isWhiteMode ? 'text-neutral-900' : 'text-white'}`}>Global Watch</h4>
                            </div>
                            <p className={`text-xl md:text-2xl leading-relaxed font-bold m-0 italic border-y border-gold/20 py-8 md:py-10 px-4 md:px-6 transition-colors ${isWhiteMode ? 'text-neutral-800' : 'text-neutral-100'}`}>
                                {isUS ? "By late 2026, the US 'Trade-Cloud' initiative will provide technical oversight for over 1 million domestic emergency responses per month." 
                                      : "National Watch: The 2026 'Repair First' law has led to a 20% reduction in UK structural insurance claims through proactive maintenance."}
                            </p>
                        </aside>

                        {/* PREMIUM CTA SECTION (STATIC) */}
                        <div className={`mt-24 md:mt-40 p-8 sm:p-12 md:p-24 rounded-[2rem] md:rounded-[3rem] border border-gold/20 shadow-xl text-center transition-all ${isWhiteMode ? 'bg-white' : 'bg-[#0f0f0f]'}`}>
                            <div className="bg-gold/10 w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto mb-8 md:mb-10 text-gold shadow-inner ring-1 ring-gold/20">
                                <Phone className="w-10 h-10 md:w-12 md:h-12" />
                            </div>
                            <h3 className={`font-display text-4xl sm:text-5xl md:text-7xl font-black mb-6 md:mb-8 italic tracking-tighter drop-shadow-sm transition-colors ${isWhiteMode ? 'text-neutral-900' : 'text-white'}`}>
                                Professional Help?
                            </h3>
                            <p className={`text-lg md:text-2xl mb-10 md:mb-12 max-w-2xl mx-auto font-light leading-relaxed transition-colors ${isWhiteMode ? 'text-neutral-500' : 'text-neutral-300'}`}>
                                Our master-accredited tradesmen are standing by 24/7. Connect instantly to national dispatch center for an immediate 2026-grade response.
                            </p>
                            <button 
                                className="w-full max-w-xl bg-gold text-black font-black px-8 md:px-12 py-5 md:py-7 rounded-full shadow-lg hover:shadow-gold/40 hover:-translate-y-1 transition-all uppercase tracking-[0.2em] md:tracking-[0.3em] text-base md:text-lg border-2 md:border-[4px] border-white flex items-center justify-center gap-4 md:gap-6 mx-auto"
                                onClick={() => window.location.href = `tel:${isUS ? "18005550199" : "08001234567"}`}
                            >
                                <span className="relative flex h-3 w-3 md:h-4 md:w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 md:h-4 md:w-4 bg-red-600"></span>
                                </span>
                                {isUS ? "USA DISPATCH 24/7" : "UK RESPONSE 24/7"}
                            </button>
                        </div>

                        {/* RELATED POSTS (4:3 RATIO PHOTO GRID) */}
                        {relatedPosts.length > 0 && (
                            <footer className={`mt-48 pt-32 border-t ${isWhiteMode ? 'border-neutral-100' : 'border-white/5'}`}>
                                <h2 className="text-center font-display text-5xl font-black italic text-gold/30 mb-24 uppercase tracking-[0.4em]">The Archive</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-stretch">
                                    {relatedPosts.map((rPost, idx) => (
                                        <Link key={rPost.id} to={`/blog/${rPost.slug}`} className="no-underline block group h-full">
                                            <article className={`p-6 pb-12 rounded-2xl shadow-sm transition-all duration-500 hover:-translate-y-3 hover:shadow-xl border border-transparent hover:border-gold/20 h-full flex flex-col ${isWhiteMode ? 'bg-white' : 'bg-black'}`}>
                                                {rPost.cover_image && (
                                                    <div className="aspect-[4/3] overflow-hidden rounded-xl mb-8 bg-neutral-100 shadow-inner relative ring-1 ring-black/5">
                                                        <img 
                                                            src={getImageUrl(rPost.cover_image)} 
                                                            alt={rPost.title} 
                                                            className="w-full h-full object-cover grayscale-0 group-hover:scale-105 transition-transform duration-700" 
                                                        />
                                                    </div>
                                                )}
                                                <h4 className={`text-center font-black uppercase text-[11px] tracking-[0.2em] px-3 leading-tight flex items-center justify-center min-h-[4rem] mt-auto transition-colors ${isWhiteMode ? 'text-neutral-500 group-hover:text-black' : 'text-neutral-400 group-hover:text-gold'}`}>
                                                    {rPost.title}
                                                </h4>
                                            </article>
                                        </Link>
                                    ))}
                                </div>
                            </footer>
                        )}
                    </article>
                </div>
            </main>

            {/* Backdrop Decorative Glows */}
            <div className={`fixed inset-0 pointer-events-none -z-10 transition-opacity duration-1000 ${isWhiteMode ? 'opacity-30' : 'opacity-10'}`}>
                <div className="absolute top-0 right-0 w-[60vw] h-[60vh] bg-gold/10 blur-[200px]" />
                <div className="absolute bottom-0 left-0 w-[40vw] h-[40vh] bg-gold/5 blur-[150px]" />
            </div>
        </div>
    );
}
