import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CalendarDays, Share2, Clock } from "lucide-react";

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
                <div className="h-[400px] bg-secondary/30 w-full" />
                <div className="container mx-auto px-4 py-8 max-w-3xl space-y-4">
                    <div className="h-8 bg-secondary rounded w-3/4" />
                    <div className="h-4 bg-secondary rounded w-1/4" />
                    <div className="space-y-2 mt-8">
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
                <h1 className="text-2xl font-bold mb-2">Article Not Found</h1>
                <p className="text-muted-foreground mb-6">The article you are looking for does not exist.</p>
                <Button asChild>
                    <Link to="/blog">Back to Blog</Link>
                </Button>
            </div>
        );
    }

    // Calculate read time (rough estimate: 200 words per minute)
    const wordCount = post.content?.split(/\s+/).length || 0;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    return (
        <div className="min-h-screen bg-background pb-16">
            <SEO
                title={`${post.title} | Emergency Tradesmen Blog`}
                description={post.excerpt}
                canonical={`/blog/${post.slug}`}
                ogType="article"
                ogImage={post.cover_image || undefined}
            />

            {/* Sticky Header */}
            <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Button variant="ghost" size="sm" asChild className="-ml-2">
                        <Link to="/blog">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Blog
                        </Link>
                    </Button>
                    <Button variant="ghost" size="icon">
                        <Share2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Article Header */}
            <article className="container mx-auto px-4 py-8 max-w-3xl">
                <header className="mb-8 space-y-4">
                    {post.cover_image && (
                        <div className="rounded-xl overflow-hidden aspect-video w-full mb-8 border border-border">
                            <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <CalendarDays className="w-4 h-4" />
                            <time dateTime={post.published_at}>
                                {format(new Date(post.published_at || post.created_at), 'MMMM d, yyyy')}
                            </time>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{readTime} min read</span>
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-display font-bold leading-tight text-foreground">
                        {post.title}
                    </h1>
                </header>

                <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-display prose-a:text-primary hover:prose-a:text-primary/80">
                    <ReactMarkdown>{post.content || ''}</ReactMarkdown>
                </div>
            </article>

            {/* CTA */}
            <div className="container mx-auto px-4 max-w-3xl mt-16 pt-8 border-t border-border">
                <div className="bg-secondary/30 rounded-2xl p-8 text-center">
                    <h3 className="text-2xl font-bold font-display mb-2">Need an Emergency Tradesman?</h3>
                    <p className="text-muted-foreground mb-6">
                        We connect you with verified local experts in minutes. Available 24/7.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="w-full sm:w-auto" asChild>
                            <Link to="/">Find a Tradesman</Link>
                        </Button>
                        <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                            <Link to="/contact">Contact Us</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
