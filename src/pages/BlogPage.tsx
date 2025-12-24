import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, ArrowRight } from "lucide-react";
import { SEO } from "@/components/SEO";

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
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadPosts() {
            const { data, error } = await supabase
                .from('posts')
                .select('id, title, slug, excerpt, cover_image, published_at, created_at')
                .eq('published', true)
                .order('published_at', { ascending: false });

            if (!error && data) {
                // Add static post if not already present
                const staticPost: BlogPost = {
                    id: 'static-uk-emergency-tradesmen',
                    title: 'UK Emergency Tradesmen: Expert Repairs When You Need Them',
                    slug: 'uk-emergency-tradesmen-expert-repairs',
                    excerpt: 'When disaster hits your home, you need quick help. Issues like burst pipes, electrical faults, or locked doors can be stressful and risky.',
                    cover_image: 'https://images.unsplash.com/photo-1546827209-a218e99fdbe9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3MTI4NzZ8MHwxfHNlYXJjaHwzNXx8dG9vbHN8ZW58MHx8fHwxNzY2NjA4NjgyfDA&ixlib=rb-4.1.0&q=80&w=1080',
                    published_at: new Date().toISOString(),
                    created_at: new Date().toISOString()
                };

                // Filter out if it already exists from DB to obtain unique key
                const uniqueData = data.filter(p => p.slug !== staticPost.slug);
                setPosts([staticPost, ...uniqueData]);
            }
            setIsLoading(false);
        }

        loadPosts();
    }, []);

    return (
        <div className="min-h-screen bg-background">
            <SEO
                title="Trade Tips & Guides | Emergency Tradesmen UK"
                description="Expert advice, guides, and tips for home maintenance, emergency repairs, and finding the right tradesperson."
                canonical="/blog"
            />

            {/* Hero Section */}
            <div className="bg-secondary/30 border-b border-border">
                <div className="container mx-auto px-4 py-16 text-center">
                    <h1 className="text-4xl md:text-5xl font-display text-foreground mb-4">
                        Trade Tips & Guides
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Expert advice for maintaining your home and handling emergencies.
                    </p>
                </div>
            </div>

            {/* Posts Grid */}
            <div className="container mx-auto px-4 py-12">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="h-[400px] bg-secondary/50 animate-pulse rounded-xl" />
                        ))}
                    </div>
                ) : posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post) => (
                            <Card key={post.id} className="flex flex-col h-full hover:shadow-lg transition-shadow border-border/50 bg-card">
                                {/* Cover Image Placeholder/Real */}
                                <div className="aspect-video w-full bg-secondary relative overflow-hidden rounded-t-xl group">
                                    {post.cover_image ? (
                                        <img
                                            src={post.cover_image}
                                            alt={post.title}
                                            loading="lazy"
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-secondary text-muted-foreground">
                                            <span className="text-4xl">📝</span>
                                        </div>
                                    )}
                                </div>

                                <CardHeader className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <CalendarDays className="w-3 h-3" />
                                        <span>
                                            {format(new Date(post.published_at || post.created_at), 'MMMM d, yyyy')}
                                        </span>
                                    </div>
                                    <h2 className="text-xl font-bold font-display line-clamp-2 group-hover:text-primary transition-colors">
                                        <Link to={`/blog/${post.slug}`}>
                                            {post.title}
                                        </Link>
                                    </h2>
                                </CardHeader>

                                <CardContent className="flex-grow">
                                    <p className="text-muted-foreground line-clamp-3 text-sm">
                                        {post.excerpt}
                                    </p>
                                </CardContent>

                                <CardFooter className="pt-0">
                                    <Button asChild variant="ghost" className="w-full justify-between hover:bg-secondary/50">
                                        <Link to={`/blog/${post.slug}`}>
                                            Read Article
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
                            <span className="text-2xl">📭</span>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No articles yet</h3>
                        <p className="text-muted-foreground">Check back soon for updates!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
