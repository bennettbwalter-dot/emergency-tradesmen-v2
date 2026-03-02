import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SEO } from "@/components/SEO";
import { AdSlot } from "@/components/AdSlot";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CalendarDays, Share2, Clock, ChevronRight, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSimpleTheme } from "@/components/simple-theme";
import { useLocalization } from "@/contexts/LocalizationContext";
import { Info, ExternalLink, ShieldCheck, MapPin } from "lucide-react";
import { HomeEmergencyAd } from "@/components/HomeEmergencyAd";
import { GlossaryBox } from "@/components/GlossaryBox";
import { ChecklistBox } from "@/components/ChecklistBox";

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    cover_image: string | null;
    published_at: string;
    created_at: string;
    howToSteps?: {
        name: string;
        text: string;
        image?: string;
    }[];
}

export default function BlogPostPage() {
    const { setTheme } = useSimpleTheme();
    const { settings } = useLocalization();
    const { slug } = useParams();
    const routerNavigate = useNavigate();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showStickyBar, setShowStickyBar] = useState(false);
    const [debugInfo, setDebugInfo] = useState<any>({}); // For troubleshooting 404s

    const regionalizeText = (text: string) => {
        if (!text || settings.countryCode !== 'US') return text;
        return text
            .replace(/[\u2705]/g, '')
            .replace(/boilers/gi, 'furnaces')
            .replace(/Tradesmen/g, 'Contractors')
            .replace(/tradesmen/g, 'contractors')
            .replace(/Tradesman/g, 'Contractor')
            .replace(/tradesman/g, 'contractor')
            .replace(/Tradesperson/g, 'Contractor')
            .replace(/tradesperson/g, 'contractor')
            .replace(/Tradespeople/g, 'Contractors')
            .replace(/tradespeople/g, 'contractors')
            .replace(/UK/g, 'US')
            .replace(/bank holiday/gi, 'public holiday')
            .replace(/breakdown recovery/gi, 'tow truck')
            .replace(/postcode/gi, 'zip code')
            .replace(/boiler/gi, 'HVAC / furnace')
            .replace(/Gas Safe/g, 'State Licensed')
            .replace(/NICEIC/g, 'Certified Electrician')
            .replace(/MLA/g, 'Certified Locksmith')
            .replace(/emergency services UK/gi, 'US emergency services')
            .replace(/UK's fastest/gi, 'USA\'s fastest')
            .replace(/nationwide/gi, 'coast-to-coast');
    };

    const AIOverviewBox = ({ content }: { content: string }) => (
        <div className="my-8 relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-gold/40 to-amber-500/40 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-secondary/30 border-2 border-gold/30 rounded-xl p-6 md:p-8 backdrop-blur-sm overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                    <Info className="w-12 h-12 text-gold" />
                </div>
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-gold/10 rounded-lg">
                        <ShieldCheck className="w-5 h-5 text-gold" />
                    </div>
                    <span className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-bold text-gold/80">
                        Direct Answer / AI Overview
                    </span>
                </div>
                <p className="text-lg md:text-xl font-medium text-foreground leading-relaxed italic border-l-4 border-gold pl-6">
                    {content}
                </p>
            </div>
        </div>
    );

    const ReferencesSection = () => {
        const isUK = settings.countryCode === 'GB';
        return (
            <div className="mt-16 pt-16 border-t border-border/50">
                <div className="bg-secondary/40 rounded-2xl p-8 border-2 border-gold/20 backdrop-blur-sm shadow-xl shadow-gold/5">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Info className="w-5 h-5 text-gold" />
                        References & Official Assistance
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                        <div className="space-y-4">
                            <h4 className="font-semibold text-foreground uppercase tracking-wider text-xs">Official Standards</h4>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3 group">
                                    <div className="p-1 bg-gold/10 rounded group-hover:bg-gold/20 transition-colors mt-0.5">
                                        <ShieldCheck className="w-3.5 h-3.5 text-gold" />
                                    </div>
                                    <Link to="/vetting-process" className="text-muted-foreground hover:text-gold transition-colors">
                                        Our Vetting Standards (Rules & Regs)
                                    </Link>
                                </li>
                                <li className="flex items-start gap-3 group">
                                    <div className="p-1 bg-gold/10 rounded group-hover:bg-gold/20 transition-colors mt-0.5">
                                        <ExternalLink className="w-3.5 h-3.5 text-gold" />
                                    </div>
                                    <a href={isUK ? "https://www.gassaferegister.co.uk/" : "https://www.iapmo.org/"} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-gold transition-colors">
                                        {isUK ? "Gas Safe Register (Official)" : "Uniform Plumbing Code (Official)"}
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-semibold text-foreground uppercase tracking-wider text-xs">Platform Links</h4>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3 group">
                                    <div className="p-1 bg-gold/10 rounded group-hover:bg-gold/20 transition-colors mt-0.5">
                                        <MapPin className="w-3.5 h-3.5 text-gold" />
                                    </div>
                                    <Link to={isUK ? "/" : "/us"} className="text-muted-foreground hover:text-gold transition-colors">
                                        Emergency Tradesmen Home
                                    </Link>
                                </li>
                                <li className="flex items-start gap-3 group">
                                    <div className="p-1 bg-gold/10 rounded group-hover:bg-gold/20 transition-colors mt-0.5">
                                        <ChevronRight className="w-3.5 h-3.5 text-gold" />
                                    </div>
                                    <Link to="/contact" className="text-muted-foreground hover:text-gold transition-colors">
                                        Contact Support Team
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    useEffect(() => {
        setTheme('light');
        const handleScroll = () => {
            if (window.scrollY > 400) {
                setShowStickyBar(true);
            } else {
                setShowStickyBar(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        async function loadPost() {
            if (!slug) return;
            setIsLoading(true);

            // Handle malformed US slugs (redirect to US blog index)
            if (slug.toLowerCase() === 'us' || slug.toLowerCase() === 'usa') {
                routerNavigate('/us/blog', { replace: true });
                return;
            }


            // 1. Try regionalized slug first (e.g. "my-post-us")
            const regionSuffix = settings.countryCode === 'US' ? '-us' : '-gb';

            // Critical fix: strip existing suffixes to avoid double-suffixing (e.g. slug-us-us)
            const baseSlug = slug.replace(/-us$|-gb$/, '');
            const regionalSlug = `${baseSlug}${regionSuffix}`;

            const debug = {
                originalSlug: slug,
                countryCode: settings.countryCode,
                regionalSlug,
                baseSlug,
                regionSuffix,
                attempts: [] as string[]
            };

            // Try fetching: 1) Regional slug, 2) Exact slug
            const { data: posts, error } = await supabase
                .from('posts')
                .select('*')
                .eq('published', true)
                .or(`slug.eq.${regionalSlug},slug.eq.${slug}`);

            debug.attempts.push('Exact/Regional: ' + (posts ? posts.length : 0) + ' matches ' + (error ? 'Error: ' + JSON.stringify(error) : ''));

            if (!error && posts && posts.length > 0) {
                // Prefer regional match if available
                const regionalMatch = posts.find(p => p.slug === regionalSlug);
                setPost(regionalMatch || posts[0]);
                setIsLoading(false);
                return;
            }

            // 3. Fallback: Fuzzy search / alternative region handling
            // If we are in US but only have -gb version, or vice versa, we might want to show something?
            // Actually, some posts have completely different names per region (e.g. "flat-battery-alternator-gb" vs "click-vs-crank-us")
            // So we try to find a post that 'starts with' the base of the current slug (stripping potential existing suffix)

            // Try to find ANY post that starts with this base slug
            const { data: fuzzyData, error: fuzzyError } = await supabase
                .from('posts')
                .select('*')
                .eq('published', true)
                .ilike('slug', `${baseSlug}%`)
                .limit(5); // Get a few candidates

            debug.attempts.push('Fuzzy: ' + (fuzzyData ? fuzzyData.map(p => p.slug).join(', ') : 'None') + (fuzzyError ? ' Error: ' + JSON.stringify(fuzzyError) : ''));

            if (!fuzzyError && fuzzyData && fuzzyData.length > 0) {
                // Logic: 
                // 1. Look for one ending in current region suffix
                // 2. Look for one with NO suffix (neutral)
                // 3. Fallback to whatever we found (e.g. showing UK post to US user is better than 404)

                const exactRegionMatch = fuzzyData.find(p => p.slug.endsWith(regionSuffix));
                const neutralMatch = fuzzyData.find(p => !p.slug.endsWith('-us') && !p.slug.endsWith('-gb'));

                const bestMatch = exactRegionMatch || neutralMatch || fuzzyData[0];

                console.log(`Fuzzy match found. Requested: ${slug}, Served: ${bestMatch.slug}`);
                setPost(bestMatch);
                setIsLoading(false);
                return;
            }

            // 4. Not found
            console.log(`Post not found for slug: ${slug} (tried ${regionalSlug} and fuzzy ${baseSlug}%)`);
            setPost(null);
            setDebugInfo(debug);
            setIsLoading(false);
        }

        loadPost();
    }, [slug, settings.countryCode]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background animate-pulse">
                <div className="h-[60vh] bg-secondary/30 w-full" />
                <div className="container mx-auto px-4 py-12 max-w-4xl space-y-8">
                    <div className="h-12 bg-secondary rounded w-3/4 mx-auto" />
                    <div className="h-4 bg-secondary rounded w-1/4 mx-auto" />
                    <div className="space-y-4 mt-12">
                        <div className="h-4 bg-secondary rounded w-full" />
                        <div className="h-4 bg-secondary rounded w-full" />
                        <div className="h-4 bg-secondary rounded w-5/6" />
                    </div>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
                <h1 className="text-3xl font-display font-bold mb-4">Article Not Found</h1>
                <p className="text-muted-foreground mb-8">The article you are looking for does not exist.</p>
                {Object.keys(debugInfo).length > 0 && (
                    <div className="bg-secondary/30 p-4 rounded-lg text-left text-xs font-mono mb-8 max-w-lg overflow-auto border border-border w-full">
                        <p className="mb-2 font-bold text-red-400">Debug Information:</p>
                        <pre className="whitespace-pre-wrap break-all">{JSON.stringify(debugInfo, null, 2)}</pre>
                    </div>
                )}
                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link to="/blog">Back to Blog</Link>
                </Button>
            </div>
        );
    }

    // Calculate read time
    const wordCount = post.content?.split(/\s+/).length || 0;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    const countryPrefix = settings.countryCode === 'GB' ? '' : '/us';

    return (
        <div className="min-h-screen bg-background pb-20 selection:bg-gold/20">
            {/* Structured Data Construction */}
            {(() => {
                const baseUrl = "https://emergencytradesmen.net";
                const postUrl = `${baseUrl}/blog/${post.slug}`;
                const imageUrl = post.cover_image || `${baseUrl}/og-image.jpg`;

                // 1. BreadcrumbList Schema
                const breadcrumbSchema = {
                    "@context": "https://schema.org",
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        {
                            "@type": "ListItem",
                            "position": 1,
                            "name": "Home",
                            "item": `${baseUrl}${settings.countryCode === 'GB' ? '' : '/us'}`
                        },
                        {
                            "@type": "ListItem",
                            "position": 2,
                            "name": "Blog",
                            "item": `${baseUrl}${settings.countryCode === 'GB' ? '' : '/us'}/blog`
                        },
                        {
                            "@type": "ListItem",
                            "position": 3,
                            "name": post.title,
                            "item": postUrl
                        }
                    ]
                };

                // 2. BlogPosting Schema
                const articleSchema = {
                    "@context": "https://schema.org",
                    "@type": "BlogPosting",
                    "mainEntityOfPage": {
                        "@type": "WebPage",
                        "@id": postUrl
                    },
                    "headline": post.title,
                    "description": post.excerpt,
                    "image": imageUrl,
                    "author": {
                        "@type": "Organization",
                        "name": regionalizeText("Emergency Tradesmen UK"),
                        "url": baseUrl,
                        "logo": `${baseUrl}/et-logo-v2.png`
                    },
                    "publisher": {
                        "@type": "Organization",
                        "name": regionalizeText("Emergency Tradesmen UK"),
                        "logo": {
                            "@type": "ImageObject",
                            "url": `${baseUrl}/et-logo-v2.png`
                        }
                    },
                    "datePublished": post.published_at,
                    "dateModified": post.published_at,
                    "isAccessibleForFree": "true",
                    "keywords": [
                        ...post.title.split(' ').filter(w => w.length > 3),
                        post.slug.includes('carbon-monoxide') ? "Carbon Monoxide Safety, CO Poisoning Symptoms, Gas Safe Register, Emergency Plumber, HVAC Safety, Boiler Repair" : "",
                        "emergency tradesmen",
                        "home advice",
                        "DIY tips",
                        "UK trades"
                    ].filter(Boolean).join(', ')
                };

                // 3. HowTo Schema (Conditional)
                const howToSchema = post.howToSteps ? {
                    "@context": "https://schema.org",
                    "@type": "HowTo",
                    "name": post.title,
                    "description": post.excerpt,
                    "image": imageUrl,
                    "step": post.howToSteps.map((step, index) => ({
                        "@type": "HowToStep",
                        "position": index + 1,
                        "name": regionalizeText(step.name),
                        "text": regionalizeText(step.text),
                        "image": step.image ? `${baseUrl}${step.image}` : undefined,
                        "url": `${postUrl}#step-${index + 1}`
                    }))
                } : null;

                // 4. FAQ Schema (Parsing Markdown)
                const faqMatch = post.content ? [...post.content.matchAll(/### (?:FAQ|Frequently Asked Questions)\n\n([\s\S]*?)(?=\n\n##|$)/gi)] : [];
                let faqSchema = null;
                if (faqMatch.length > 0) {
                    const faqContent = faqMatch[0][1];
                    const questions = [...faqContent.matchAll(/\*\*Q: (.*?)\*\*\n\*\*A: (.*?)\*\*/g)];
                    if (questions.length > 0) {
                        faqSchema = {
                            "@context": "https://schema.org",
                            "@type": "FAQPage",
                            "mainEntity": questions.map(q => ({
                                "@type": "Question",
                                "name": q[1],
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": q[2]
                                }
                            }))
                        };
                    }
                }

                const jsonLdSchemas = [breadcrumbSchema, articleSchema, howToSchema, faqSchema].filter(Boolean);

                return (
                    <SEO
                        title={`${regionalizeText(post.title)} | ${regionalizeText("Emergency Tradesmen UK")} Blog`}
                        description={regionalizeText(post.excerpt) || ""}
                        canonical={`${settings.countryCode === 'GB' ? '' : '/us'}/blog/${post.slug}`}
                        ogType="article"
                        ogImage={post.cover_image || undefined}
                        jsonLd={jsonLdSchemas}
                        keywords={[
                            post.slug.replace(/-/g, ' '),
                            `${post.title.toLowerCase()} near me`,
                            `${post.title.toLowerCase()} UK`,
                            `${post.title.toLowerCase()} USA`,
                            `emergency ${post.slug.split('-')[0]} advice`,
                            `${post.slug.replace(/-/g, ' ')} what to do`,
                            `${post.slug.replace(/-/g, ' ')} help`,
                        ]}
                        locale={settings.countryCode === 'GB' ? 'en_GB' : 'en_US'}
                        alternates={[
                            { lang: 'en-GB', href: `https://emergencytradesmen.net/blog/${post.slug}` },
                            { lang: 'en-US', href: `https://emergencytradesmen.net/us/blog/${post.slug}` },
                            { lang: 'x-default', href: `https://emergencytradesmen.net/blog/${post.slug}` }
                        ]
                        }
                    />
                );
            })()}

            {/* Navigation Bar */}
            <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link
                        to={`${settings.countryCode === 'GB' ? '' : '/us'}/blog`}
                        className="flex items-center text-sm font-medium text-foreground/80 hover:text-primary transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                        Back to Insights
                    </Link>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-gold transition-colors">
                        <Share2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <article>
                {post.content.trim().startsWith('<') ? (
                    <div dangerouslySetInnerHTML={{ __html: regionalizeText(post.content) }} />
                ) : (
                    <>
                        {/* Hero Section - 16:9 Strict */}
                        <div className="relative w-full aspect-video overflow-hidden bg-secondary/30">
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
                            {post.cover_image && (
                                <img
                                    src={post.cover_image}
                                    alt={post.title}
                                    className="w-full h-full object-contain relative z-0"
                                    fetchPriority="high"
                                    loading="eager"
                                />
                            )}

                            <div className="absolute bottom-0 left-0 w-full z-20 pb-8 md:pb-12">
                                <div className="container mx-auto px-4 max-w-4xl text-center">
                                    <Badge className="mb-4 bg-gold/10 text-gold border-gold/20 hover:bg-gold/20 transition-colors uppercase tracking-widest text-[10px] px-3 py-1">
                                        Expert Guide
                                    </Badge>
                                    <h1 className="text-[28px] md:text-[44px] font-body font-bold leading-[1.2] text-foreground mb-4 text-balance drop-shadow-sm">
                                        {regionalizeText(post.title)}
                                    </h1>
                                    <div className="flex items-center justify-center gap-6 text-sm md:text-base text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <CalendarDays className="w-4 h-4 text-gold" />
                                            <time dateTime={post.published_at}>
                                                {format(new Date(post.published_at || post.created_at), 'MMMM d, yyyy')}
                                            </time>
                                        </div>
                                        <div className="w-1 h-1 rounded-full bg-gold/50" />
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-gold" />
                                            <span>{readTime} min read</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Ad Slot 1: Between hero and content */}
                        <div className="container mx-auto px-4 max-w-4xl py-4">
                            <AdSlot slot="AD_SLOT_BLOG_TOP" format="leaderboard" />
                        </div>

                        {/* Content Layout */}
                        <div className="container mx-auto px-4 py-12 md:py-20">
                            <div className="max-w-[1000px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
                                {/* Main Content Column */}
                                <div className="lg:col-span-12">
                                    <div className="font-body text-foreground space-y-8">
                                        {/* Structured Content Processing Pipeline */}
                                        {(() => {
                                            let content = post.content;
                                            const structuredElements = [];

                                            // 1. Detect and Extract Glossaries
                                            const glossaryMatches = Array.from(content.matchAll(/## (?:[\d.]+\s+)?(Glossary of.*?|.*?Glossary)\n+([\s\S]*?)(?=\n+##|$)/gi));
                                            glossaryMatches.forEach(match => {
                                                const title = regionalizeText(match[1]);
                                                const glossaryLines = match[2].trim().split('\n');
                                                const items = glossaryLines.map(line => {
                                                    const itemMatch = line.match(/^(?:\d+\.\s+)?(?:\*\*)?(.+?)(?::\*\*|\*\*:\s*|:\s*)\s*(.*)$/);
                                                    if (itemMatch) {
                                                        return { term: regionalizeText(itemMatch[1]), definition: regionalizeText(itemMatch[2]) };
                                                    }
                                                    return null;
                                                }).filter((i): i is { term: string; definition: string } => i !== null);

                                                if (items.length > 0) {
                                                    structuredElements.push({
                                                        type: 'glossary',
                                                        title,
                                                        items,
                                                        original: match[0]
                                                    });
                                                }
                                            });

                                            // 2. Detect and Extract Checklists / Appendices / References
                                            const checklistMatches = Array.from(content.matchAll(/## (?:[\d.]+\s+)?(Checklist:.*?|Steps to.*?|Appendix:.*?|Appendix|Reference Block|References|.*?Checklist)\n+([\s\S]*?)(?=\n+##|$)/gi));
                                            checklistMatches.forEach(match => {
                                                const title = regionalizeText(match[1]);
                                                const checklistLines = match[2].trim().split('\n')
                                                    .map(l => l.trim())
                                                    .filter(l => l.length > 0 && (/^\d+\./.test(l) || /^-\s/.test(l)));

                                                if (checklistLines.length > 0) {
                                                    structuredElements.push({
                                                        type: 'checklist',
                                                        title,
                                                        items: checklistLines.map(l => regionalizeText(l.replace(/^- /, '1. '))),
                                                        original: match[0]
                                                    });
                                                }
                                            });

                                            // Remove extracted elements from main content to avoid duplication
                                            let processedMarkdown = content;
                                            structuredElements.forEach(el => {
                                                processedMarkdown = processedMarkdown.replace(el.original, '');
                                            });

                                            // Handle AI Overview removal (if it's just the first paragraph)
                                            const lines = processedMarkdown.split('\n\n');
                                            const firstParagraph = lines[0];
                                            const isSnippet = firstParagraph && firstParagraph.length > 50 && firstParagraph.length < 500 && !firstParagraph.includes('##');
                                            if (isSnippet) {
                                                const cleanedSnippet = firstParagraph.replace(/\*\*/g, '').replace(/_/g, '');
                                                processedMarkdown = lines.slice(1).join('\n\n');
                                                // We'll render the AI Overview separately below
                                            }

                                            return (
                                                <>
                                                    {isSnippet && <AIOverviewBox content={regionalizeText(firstParagraph.replace(/\*\*/g, '').replace(/_/g, ''))} />}

                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            h1: ({ node, ...props }) => (
                                                                <h1 {...props} className="font-bold text-[28px] md:text-[44px] leading-[1.2] mb-6 text-foreground" />
                                                            ),
                                                            h2: ({ node, ...props }) => (
                                                                <h2 {...props} className="font-semibold text-[22px] md:text-[32px] leading-[1.3] mt-12 mb-6 text-foreground" />
                                                            ),
                                                            h3: ({ node, ...props }) => (
                                                                <h3 {...props} className="font-medium text-[18px] md:text-[24px] leading-[1.3] mt-8 mb-4 text-foreground" />
                                                            ),
                                                            p: ({ node, ...props }) => (
                                                                <p {...props} className="font-normal text-[15px] md:text-[18px] leading-[1.6] md:leading-[1.8] mb-6 text-foreground/90" />
                                                            ),
                                                            ul: ({ node, ...props }) => (
                                                                <ul {...props} className="list-disc pl-6 mb-6 space-y-2 font-normal text-[15px] md:text-[18px] leading-[1.6] text-foreground/90" />
                                                            ),
                                                            li: ({ node, ...props }) => (
                                                                <li {...props} />
                                                            ),
                                                            a: ({ node, ...props }) => {
                                                                const isInternal = props.href?.includes('emergencytradesmen.net');
                                                                return (
                                                                    <a
                                                                        {...props}
                                                                        className={`font-semibold text-gold no-underline hover:underline ${isInternal ? 'decoration-gold/30 underline-offset-4' : ''}`}
                                                                    >
                                                                        {props.children}
                                                                        {isInternal && <ChevronRight className="inline-block w-4 h-4 ml-0.5" />}
                                                                    </a>
                                                                );
                                                            },
                                                            blockquote: ({ node, ...props }) => (
                                                                <blockquote {...props} className="border-l-4 border-gold bg-secondary/30 py-4 px-6 rounded-r-lg italic my-8 text-foreground" />
                                                            ),
                                                            img: ({ node, alt, ...props }) => (
                                                                <figure className="my-12 md:my-16 w-full">
                                                                    <div className="w-full max-h-[800px] overflow-hidden rounded-xl border border-secondary shadow-lg bg-secondary/30">
                                                                        <img
                                                                            {...props}
                                                                            alt={alt}
                                                                            className="w-full h-auto max-h-[800px] object-contain mx-auto block"
                                                                            loading="lazy"
                                                                        />
                                                                    </div>
                                                                    {alt && (
                                                                        <figcaption className="mt-3 text-center text-sm text-foreground/70 italic">
                                                                            {alt}
                                                                        </figcaption>
                                                                    )}
                                                                </figure>
                                                            ),
                                                            table: ({ node, ...props }) => (
                                                                <div className="overflow-x-auto my-8 border border-border rounded-lg shadow-sm">
                                                                    <table {...props} className="w-full text-sm text-left font-body" />
                                                                </div>
                                                            ),
                                                            thead: ({ node, ...props }) => (
                                                                <thead {...props} className="text-xs uppercase bg-secondary/50 text-muted-foreground font-semibold" />
                                                            ),
                                                            th: ({ node, ...props }) => (
                                                                <th {...props} className="px-6 py-3 tracking-wider" />
                                                            ),
                                                            td: ({ node, ...props }) => (
                                                                <td {...props} className="px-6 py-4 border-t border-border" />
                                                            ),
                                                        }}
                                                    >
                                                        {regionalizeText(processedMarkdown)}
                                                    </ReactMarkdown>

                                                    {/* Render Structured Elements at the end of content area or where detected? 
                                                        Actually, the user wants them site-wide where they appear. 
                                                        Rendering them here (after main text) is a safe default if they were 'extracted'.
                                                    */}
                                                    {structuredElements.map((el, i) => (
                                                        <React.Fragment key={i}>
                                                            {el.type === 'glossary' && <GlossaryBox title={el.title} items={el.items as any} />}
                                                            {el.type === 'checklist' && <ChecklistBox title={el.title} items={el.items as any} />}
                                                        </React.Fragment>
                                                    ))}
                                                </>
                                            );
                                        })()}

                                        <div className="mt-12 pt-12 border-t border-border/30">
                                            <HomeEmergencyAd />
                                        </div>

                                        <ReferencesSection />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Ad Slot 2: After article, before CTA */}
                        <div className="container mx-auto px-4 max-w-4xl py-6">
                            <AdSlot slot="AD_SLOT_BLOG_BOTTOM" format="rectangle" />
                        </div>

                        {/* Internal Links Section — Hub & Spoke SEO (Master SEO Prompt Phase 3) */}
                        {(() => {
                            const slugTradeMap: Record<string, { trade: string; tradeSlug: string; ukCities: string[]; usCities: string[] }> = {
                                'electrical-fire-causes-prevention': {
                                    trade: 'Electrician', tradeSlug: 'electrician',
                                    ukCities: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool', 'Bristol'],
                                    usCities: ['Dallas', 'Houston', 'Chicago', 'Phoenix', 'Miami', 'Los Angeles']
                                },
                                'frozen-condensate-pipe-fix': {
                                    trade: settings.countryCode === 'GB' ? 'Gas Engineer' : 'HVAC Contractor', tradeSlug: 'gas-engineer',
                                    ukCities: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Sheffield', 'Newcastle-upon-Tyne'],
                                    usCities: ['Chicago', 'Denver', 'Minneapolis', 'Boston', 'Detroit', 'Cleveland']
                                },
                                'water-leaking-through-ceiling': {
                                    trade: 'Plumber', tradeSlug: 'plumber',
                                    ukCities: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool', 'Bristol'],
                                    usCities: ['Dallas', 'Houston', 'Chicago', 'Phoenix', 'Miami', 'Los Angeles']
                                },
                                'no-power-but-neighbours-have-power': {
                                    trade: 'Electrician', tradeSlug: 'electrician',
                                    ukCities: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool', 'Bristol'],
                                    usCities: ['Dallas', 'Houston', 'Chicago', 'Phoenix', 'Miami', 'Los Angeles']
                                },
                                'locked-out-at-night': {
                                    trade: 'Locksmith', tradeSlug: 'locksmith',
                                    ukCities: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool', 'Bristol'],
                                    usCities: ['Dallas', 'Houston', 'Chicago', 'Phoenix', 'Miami', 'Los Angeles']
                                },
                                'boiler-losing-pressure': {
                                    trade: settings.countryCode === 'GB' ? 'Gas Engineer' : 'HVAC Contractor', tradeSlug: 'gas-engineer',
                                    ukCities: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Sheffield', 'Newcastle-upon-Tyne'],
                                    usCities: ['Chicago', 'Denver', 'Minneapolis', 'Boston', 'Detroit', 'Cleveland']
                                },
                                'sewage-smell-in-house': {
                                    trade: 'Drain Specialist', tradeSlug: 'drain-specialist',
                                    ukCities: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool', 'Bristol'],
                                    usCities: ['Dallas', 'Houston', 'Chicago', 'Phoenix', 'Miami', 'Los Angeles']
                                },
                                'emergency-boarding-up-guide': {
                                    trade: 'Glazier', tradeSlug: 'glazier',
                                    ukCities: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool', 'Bristol'],
                                    usCities: ['Dallas', 'Houston', 'Chicago', 'Phoenix', 'Miami', 'Los Angeles']
                                },
                                'emergency-roof-leak-tarping': {
                                    trade: 'Roofer', tradeSlug: 'roofer',
                                    ukCities: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool', 'Bristol'],
                                    usCities: ['Dallas', 'Houston', 'Chicago', 'Phoenix', 'Miami', 'Los Angeles']
                                },
                                'structural-cracks-foundation-repair': {
                                    trade: 'Builder', tradeSlug: 'builder',
                                    ukCities: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool', 'Bristol'],
                                    usCities: ['Dallas', 'Houston', 'Chicago', 'Phoenix', 'Miami', 'Los Angeles']
                                },
                                'structural-cracks-subsidence-survey': {
                                    trade: 'Builder', tradeSlug: 'builder',
                                    ukCities: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool', 'Bristol'],
                                    usCities: ['Dallas', 'Houston', 'Chicago', 'Phoenix', 'Miami', 'Los Angeles']
                                },
                                'emergency-storm-damage-repair': {
                                    trade: 'Roofer', tradeSlug: 'roofer',
                                    ukCities: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool', 'Bristol'],
                                    usCities: ['Dallas', 'Houston', 'Chicago', 'Phoenix', 'Miami', 'Los Angeles']
                                },
                                'car-wont-start-guide': {
                                    trade: 'Breakdown Recovery', tradeSlug: 'breakdown',
                                    ukCities: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool', 'Bristol'],
                                    usCities: ['Dallas', 'Houston', 'Chicago', 'Phoenix', 'Miami', 'Los Angeles']
                                },
                                'cracks-in-walls-guide': {
                                    trade: 'Builder', tradeSlug: 'builder',
                                    ukCities: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool', 'Bristol'],
                                    usCities: ['Dallas', 'Houston', 'Chicago', 'Phoenix', 'Miami', 'Los Angeles']
                                },
                                'water-damage-restoration-guide': {
                                    trade: 'Water Restoration', tradeSlug: 'water-restoration',
                                    ukCities: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool', 'Bristol'],
                                    usCities: ['Dallas', 'Houston', 'Chicago', 'Phoenix', 'Miami', 'Los Angeles']
                                },
                                'ac-blowing-warm-air': {
                                    trade: settings.countryCode === 'GB' ? 'Gas Engineer' : 'HVAC Contractor', tradeSlug: settings.countryCode === 'GB' ? 'gas-engineer' : 'hvac',
                                    ukCities: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool', 'Bristol'],
                                    usCities: ['Dallas', 'Houston', 'Phoenix', 'Miami', 'Los Angeles', 'Las Vegas']
                                },
                                'uk-emergency-tradesmen-expert-repairs': {
                                    trade: 'Plumber', tradeSlug: 'plumber',
                                    ukCities: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool', 'Bristol'],
                                    usCities: ['Dallas', 'Houston', 'Chicago', 'Phoenix', 'Miami', 'Los Angeles']
                                },
                                'spring-thaw-pipe-burst-prevention': {
                                    trade: 'Plumber', tradeSlug: 'plumber',
                                    ukCities: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool', 'Bristol'],
                                    usCities: ['Dallas', 'Houston', 'Chicago', 'Phoenix', 'Miami', 'Los Angeles']
                                }
                            };


                            const baseSlug = post.slug.replace(/-us$|-gb$/, '');
                            const tradeData = (post.slug ? slugTradeMap[post.slug] : null) || (baseSlug ? slugTradeMap[baseSlug] : null);
                            if (!tradeData) return null;

                            const isUK = settings.countryCode === 'GB';
                            const cities = isUK ? tradeData.ukCities : tradeData.usCities;
                            const prefix = isUK ? '' : '/us';

                            return (
                                <div className="container mx-auto px-4 max-w-4xl py-8">
                                    <div className="border-2 border-gold/20 rounded-xl p-6 bg-secondary/40 backdrop-blur-sm shadow-xl shadow-gold/5">
                                        <h3 className="text-lg font-semibold text-foreground mb-4">
                                            Search for an Emergency {tradeData.trade} Near You
                                        </h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {cities.map(city => (
                                                <Link
                                                    key={city}
                                                    to={`${prefix}/emergency-${tradeData.tradeSlug}/${city.toLowerCase().replace(/\s+/g, '-')}`}
                                                    className="text-sm text-primary hover:text-gold hover:underline transition-colors py-1"
                                                >
                                                    Emergency {tradeData.trade} {city} →
                                                </Link>
                                            ))}
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-border/30">
                                            <Link
                                                to={isUK ? '/locations' : '/us/locations'}
                                                className="text-sm font-medium text-gold hover:text-gold-dark transition-colors"
                                            >
                                                View all locations →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Newsletter / CTA Section */}
                        <div className="container mx-auto px-4 max-w-5xl mb-24">
                            <Card className="relative overflow-hidden border-gold/20 bg-gradient-to-br from-secondary/50 to-background">
                                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-gold/10 rounded-full blur-3xl opacity-50" />
                                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-gold/10 rounded-full blur-3xl opacity-50" />

                                <div className="relative z-10 px-6 py-16 md:px-16 text-center">
                                    <img
                                        src="/et-logo-v2.png"
                                        alt="Emergency Tradesmen Logo"
                                        className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-gold/30 shadow-2xl shadow-gold/20 object-cover"
                                    />
                                    <h3 className="text-[22px] md:text-[32px] font-body font-bold text-foreground mb-4">
                                        Don't Wait For An Emergency
                                    </h3>
                                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                                        {regionalizeText("Connect with verified local experts instantly. Whether it's a burst pipe or a boiler breakdown, we have professionals ready to help 24/7.")}
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <Button size="lg" className="bg-gold hover:bg-gold-dark text-white font-medium px-8 h-12 text-base shadow-lg shadow-gold/20">
                                            <Link to={settings.countryCode === 'GB' ? '/' : '/us'}>Find a {settings.countryCode === 'GB' ? 'Tradesman' : 'Contractor'} Now</Link>
                                            <ChevronRight className="w-4 h-4 ml-2" />
                                        </Button>
                                        <Button size="lg" variant="outline" className="border-border hover:bg-secondary/50 h-12 text-base px-8">
                                            <Link to="/contact">Contact Support Team</Link>
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </>
                )}
            </article>

            {/* Sticky Emergency Bar */}
            <div className={`fixed bottom-0 left-0 right-0 z-50 p-4 transition-all duration-500 transform ${showStickyBar ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
                <div className="container mx-auto max-w-4xl">
                    <div className="bg-black/80 backdrop-blur-xl border border-gold/30 rounded-2xl p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gold/10 rounded-lg">
                                <Phone className="w-5 h-5 text-gold animate-pulse" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white leading-none">Emergency? Don't Wait.</p>
                                <p className="text-[11px] text-muted-foreground mt-1 uppercase tracking-wider">Verified {settings.countryCode === 'GB' ? 'Tradesmen' : 'Contractors'} ready 24/7</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <Button asChild variant="outline" size="sm" className="flex-1 sm:flex-none border-gold/30 text-gold hover:bg-gold/10 h-10 px-6 rounded-xl text-sm font-bold tracking-tight">
                                <Link to={settings.countryCode === 'GB' ? '/' : '/us'}>
                                    Find Expert
                                </Link>
                            </Button>
                            <Button asChild size="sm" className="flex-1 sm:flex-none bg-gold hover:bg-gold-dark text-black h-10 px-6 rounded-xl text-sm font-bold shadow-lg shadow-gold/20">
                                <Link to="/contact">
                                    Call Now
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
