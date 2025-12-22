import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CalendarDays, Share2, Clock, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

export default function BlogPostPage() {
    const { slug } = useParams();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadPost() {
            if (!slug) return;

            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('slug', slug)
                .single();

            if (!error && data) {
                setPost(data);
            }
            setIsLoading(false);
        }

        loadPost();
    }, [slug]);

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
                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link to="/blog">Back to Blog</Link>
                </Button>
            </div>
        );
    }

    // Calculate read time
    const wordCount = post.content?.split(/\s+/).length || 0;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    return (
        <div className="min-h-screen bg-background pb-20 selection:bg-gold/20">
            <SEO
                title={`${post.title} | Emergency Tradesmen Blog`}
                description={post.excerpt}
                canonical={`/blog/${post.slug}`}
                ogType="article"
                ogImage={post.cover_image || undefined}
            />

            {/* Navigation Bar */}
            <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link
                        to="/blog"
                        className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors group"
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
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                ) : (
                    <>
                        {/* Hero Section - Full Width */}
                        <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
                            {post.cover_image && (
                                <img
                                    src={post.cover_image}
                                    alt={post.title}
                                    className="w-full h-full object-cover"
                                />
                            )}

                            <div className="absolute bottom-0 left-0 w-full z-20 pb-12 md:pb-20">
                                <div className="container mx-auto px-4 max-w-4xl text-center">
                                    <Badge className="mb-6 bg-gold/10 text-gold border-gold/20 hover:bg-gold/20 transition-colors uppercase tracking-widest text-[10px] px-3 py-1">
                                        Expert Guide
                                    </Badge>
                                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-tight text-foreground mb-6 text-balance drop-shadow-sm">
                                        {post.title}
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

                        {/* Content Layout */}
                        <div className="container mx-auto px-4 py-12 md:py-20">
                            <div className="max-w-[1000px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
                                {/* Main Content Column */}
                                <div className="lg:col-span-12">
                                    <div className="prose prose-lg dark:prose-invert max-w-none 
                                        prose-headings:font-display prose-headings:font-bold prose-headings:text-foreground
                                        prose-h1:text-4xl prose-h1:mb-8
                                        prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:text-gold-gradient
                                        prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                                        prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6
                                        prose-a:text-gold prose-a:no-underline hover:prose-a:underline
                                        prose-blockquote:border-l-gold prose-blockquote:bg-secondary/30 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:italic
                                        prose-strong:text-foreground prose-strong:font-semibold
                                        prose-ul:list-disc prose-ul:pl-6 prose-ul:my-6
                                        prose-li:text-muted-foreground prose-li:mb-2
                                        prose-img:rounded-xl prose-img:shadow-lg prose-img:border prose-img:border-border/50 prose-img:w-full prose-img:aspect-video prose-img:object-cover
                                    ">
                                        <ReactMarkdown
                                            components={{
                                                // Custom image renderer to add better styling
                                                img: ({ node, ...props }) => (
                                                    <div className="my-12">
                                                        <img {...props} className="rounded-xl shadow-2xl border border-secondary" />
                                                        {props.title && (
                                                            <p className="text-center text-sm text-muted-foreground mt-3 italic">
                                                                {props.title}
                                                            </p>
                                                        )}
                                                    </div>
                                                ),
                                                // Custom table renderer
                                                table: ({ node, ...props }) => (
                                                    <div className="overflow-x-auto my-8 border border-border rounded-lg shadow-sm">
                                                        <table {...props} className="w-full text-sm text-left" />
                                                    </div>
                                                ),
                                                thead: ({ node, ...props }) => (
                                                    <thead {...props} className="text-xs uppercase bg-secondary/50 text-muted-foreground" />
                                                ),
                                                th: ({ node, ...props }) => (
                                                    <th {...props} className="px-6 py-3 font-medium tracking-wider" />
                                                ),
                                                td: ({ node, ...props }) => (
                                                    <td {...props} className="px-6 py-4 border-t border-border" />
                                                ),
                                            }}
                                        >
                                            {post.content || ''}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Newsletter / CTA Section */}
                        <div className="container mx-auto px-4 max-w-5xl mb-24">
                            <Card className="relative overflow-hidden border-gold/20 bg-gradient-to-br from-secondary/50 to-background">
                                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-gold/10 rounded-full blur-3xl opacity-50" />
                                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-gold/10 rounded-full blur-3xl opacity-50" />

                                <div className="relative z-10 px-6 py-16 md:px-16 text-center">
                                    <h3 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                                        Don't Wait For An Emergency
                                    </h3>
                                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                                        Connect with verified local experts instantly. Whether it's a burst pipe or a boiler breakdown, we have professionals ready to help 24/7.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <Button size="lg" className="bg-gold hover:bg-gold-dark text-white font-medium px-8 h-12 text-base shadow-lg shadow-gold/20">
                                            <Link to="/">Find a Tradesman Now</Link>
                                            <ChevronRight className="w-4 h-4 ml-2" />
                                        </Button>
                                        <Button size="lg" variant="outline" className="border-border hover:bg-secondary/50 h-12 text-base px-8">
                                            <Link to="/contact">Contact Support</Link>
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </>
                )}
            </article>
        </div>
    );
}
