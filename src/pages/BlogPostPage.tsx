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

            if (slug === 'uk-emergency-tradesmen-expert-repairs') {
                setPost({
                    id: 'static-uk-emergency-tradesmen',
                    title: 'UK Emergency Tradesmen: Expert Repairs When You Need Them',
                    slug: 'uk-emergency-tradesmen-expert-repairs',
                    excerpt: 'When disaster hits your home, you need quick help. Issues like burst pipes, electrical faults, or locked doors can be stressful and risky.',
                    cover_image: 'https://images.unsplash.com/photo-1546827209-a218e99fdbe9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3MTI4NzZ8MHwxfHNlYXJjaHwzNXx8dG9vbHN8ZW58MHx8fHwxNzY2NjA4NjgyfDA&ixlib=rb-4.1.0&q=80&w=1080',
                    content: `When disaster hits your home, you need quick help. Issues like burst pipes, electrical faults, or locked doors can be stressful and risky. That's where **[emergency tradesmen](https://emergencytradesmen.net/)** come in – they offer urgent help to fix your home.

With _24/7_ service, finding a trusted tradesman is easy. Online platforms help you connect with certified and vetted tradespeople. This ensures you get top-notch repairs when you need them most.

Facing a sudden plumbing or electrical issue? **Emergency home repairs** are just a click away. These services aim to give you peace of mind, knowing help is always ready.

### Key Takeaways

*   Reliable **emergency tradesmen** are available 24/7 to address home emergencies.
*   Online platforms connect you with fully certified and vetted tradespeople near you.
*   Expert repairs are available for various home emergencies, including plumbing and electrical issues.
*   **Urgent home repairs** can be arranged quickly and efficiently.
*   **Emergency tradesmen** provide peace of mind, knowing that help is available at any time.

## When Disaster Strikes: Why You Need Immediate Professional Help

![a close up of a metal sink drain](https://images.unsplash.com/photo-1654440122140-f1fc995ddb34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3MTI4NzZ8MHwxfHNlYXJjaHwxM3x8cGx1bWJlcnxlbnwwfHx8fDE3NjY2MDg0MDR8MA&ixlib=rb-4.1.0&q=80&w=1080)

When disaster hits your home, you need **immediate professional help** to limit the damage. Emergencies like a _burst pipe emergency_ or electrical faults need quick action. This is to stop more harm.

### The Critical Nature of Home Emergencies

Home emergencies are urgent because they can cause a lot of damage if not fixed fast. For example, a burst pipe can flood your home, damaging your stuff. **[Emergency plumbing services](https://emergencytradesmen.net/)** are key to stop leaks and fix any damage.

### The Financial Impact of Delayed Repairs

Waiting to fix things can cost a lot of money. The longer you wait, the more damage and the higher the repair costs. _Urgent home repairs_ are not just about fixing the problem. They also stop more damage that can make repairs even more expensive.

### Safety Concerns During Home Emergencies

Safety is a big worry during home emergencies. Issues like electrical or gas problems can be very dangerous. That's why getting help from **[emergency services UK](https://emergencytradesmen.net/)** is so important. They can help fast and safely.

In short, when disaster hits your home, act fast and get professional help. Whether it's a burst pipe or an electrical problem, _emergency home repairs_ are crucial. They keep your home safe and secure.

## Essential Emergency Tradesmen UK Services Available 24/7

![selective focus photography blue and black Makita power drill](https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3MTI4NzZ8MHwxfHNlYXJjaHw1fHxjb250cmFjdG9yc3xlbnwwfHx8fDE3NjY2MDg0OTN8MA&ixlib=rb-4.1.0&q=80&w=1080)

Emergencies can happen anytime. Having **24/7 tradesmen** services in the UK is a big help. They can fix burst pipes, electrical faults, and unlock doors quickly.

### Emergency Plumbers: Tackling Burst Pipes and Flooding

Emergency plumbers are key for burst pipes and flooding. They act fast to reduce damage and fix your plumbing.

#### What to Do When a Pipe Bursts Before Help Arrives

*   Turn off the main water supply if possible
*   Move valuable items away from the affected area
*   Use buckets or towels to contain the water

To find an **emergency plumber near me**, search online or check local directories.

### [Emergency Electricians](https://emergencytradesmen.net/): Resolving Dangerous Electrical Faults

Electrical faults are dangerous. Emergency electricians are trained to handle them. They fix issues quickly and safely.

#### Power Cut and Electrical Safety Measures

Use flashlights, not candles, during a power cut to avoid fires. If you have electrical problems, call an **emergency electrician near me** for help.

### [Emergency Locksmiths](https://emergencytradesmen.net/): Solutions When You're Locked Out

Being locked out is frustrating. But emergency locksmiths can help fast. They unlock doors and fix or replace locks.

When looking for an **emergency locksmith near me**, check they are licensed and well-reviewed.

### [Emergency Gas Engineers](https://emergencytradesmen.net/): Addressing Gas Leaks and Boiler Failures

Gas leaks and boiler failures need quick action. Emergency gas engineers can safely diagnose and fix these problems.

For **gas engineer near me emergency** services, choose Gas Safe registered professionals.

### Urgent Drain Repairs and Blockage Solutions

Drain blockages can really disrupt things. **Emergency drain repair** services can clear blockages and fix your drainage.

To find **emergency drain repair** services, look for local providers with a good reputation.

## Finding Reliable [Emergency Tradesmen](https://emergencytradesmen.net/) Near Me

Looking for a **reliable emergency tradesman near me** is urgent when emergencies strike at home. You need someone who can act fast and fix problems effectively.

### Online Platforms for Locating Local Emergency Tradesmen

Finding **[local emergency tradesmen](https://emergencytradesmen.net/)** is now simple thanks to the internet. Online platforms and directories link homeowners with skilled tradespeople across the UK. You can search for _emergency plumbers near me_, _emergency electricians near me_, or other experts in your area.

Our smart matching system connects you with nearby tradespeople ready to help. This ensures you get the support you need quickly, without waiting.

### Emergency Services in Major UK Cities

Big UK cities offer 24/7 **emergency tradesmen** services. Whether you're in **London**, **Manchester**, or **Birmingham**, you can find local experts for emergencies.

#### London, Manchester, and Birmingham

In these cities, finding _emergency plumbers_, _emergency electricians_, and other specialists is easy. For example, in London, you can quickly find an _emergency plumber London_ for burst pipes or leaks.

#### Leeds, Bristol, and Other Regions

Even in smaller cities like Leeds and Bristol, emergency tradesmen are plentiful. Whether you need an _emergency locksmith Birmingham_ or an emergency gas engineer elsewhere, these services are available.

### Vetting [Emergency Tradesmen](https://emergencytradesmen.net/): Certifications and Insurance

When choosing an emergency tradesman, check their certifications and insurance. Look for those certified by bodies like Gas Safe or NICEIC. Also, make sure they have insurance to protect you and your property from accidents.

By doing this, you can be sure you're hiring a trustworthy and skilled professional for your emergency needs.

## What to Expect When Calling Emergency Tradesmen

When a home emergency strikes, knowing what to expect from emergency tradesmen can ease your stress. Emergencies like burst pipes or electrical faults are common. Being ready for their response can make a big difference.

### Typical Response Times for Different Emergencies

Emergency tradesmen know how urgent their services are. They usually arrive in under 60 minutes, which is faster than most. The exact time depends on the emergency and where you are.

For example, plumbers for burst pipes or flooding arrive in about 45 minutes to an hour. Electricians for dangerous faults also have a similar quick response. However, during busy times or in remote areas, it might take a bit longer.

### Emergency Call-Out Fees and Pricing Structures

It's important to know the costs when you call an emergency tradesman. The price includes a call-out fee, labour, and parts needed for the fix.

#### Daytime vs Night-time Rates

Emergency tradesmen charge differently for day and night calls. Night calls, from 8 PM to 8 AM, cost more because they're more urgent and inconvenient.

#### Weekend and Holiday Pricing

Calling on weekends or holidays also means higher costs. These times are in high demand, so prices go up.

| Service Time | Typical Cost Range |
| --- | --- |
| Daytime (8 AM - 8 PM) | £80 - £150 |
| Night-time (8 PM - 8 AM) | £120 - £250 |
| Weekends and Holidays | £150 - £300 |

### Quality Guarantees and Follow-Up Services

Good emergency tradesmen offer quality guarantees. If the first fix doesn't work, they'll come back for free. They also provide follow-up services to ensure you're happy.

### The Booking Process: From Call to Completion

Booking an emergency tradesman is easy. You call or book online, tell them about your problem, and get a time for them to arrive. They'll check the issue and give a quote before starting work.

Knowing what to expect from emergency tradesmen helps you handle emergencies better. From how fast they arrive to the costs and guarantees, being informed helps you make the right choices for your home.

## Preparing for [Home Emergencie](https://emergencytradesmen.net/)s: Preventative Measures

Preparing for home emergencies can give you peace of mind. Being ready helps lessen the effects of sudden events. It also makes fixing problems faster.

### Creating an Emergency Contact List of Local Tradesmen

It's vital to have a list of trusted local tradesmen. This list should include plumbers, electricians, locksmiths, and gas engineers. You can find them online or in local directories.

Always check their qualifications and insurance before choosing.

### Regular Maintenance to Prevent Common Emergencies

**Regular maintenance** stops many emergencies before they start. Check your plumbing for leaks, inspect electrical wiring, and service your boiler yearly. Early checks can spot problems before they grow.

Having key tools and supplies ready helps with quick fixes. Keep a toolkit, plumbing tape, and a first-aid kit handy.

### Essential Tools and Supplies for Temporary Fixes

The right tools are crucial for minor emergencies. Make sure your toolkit is full and you know how to use it.

### Insurance Considerations for Emergency Home Repairs

Knowing your home insurance is important. Find out what's covered and what's not, especially for emergency repairs. Some policies may cover temporary homes if you can't stay in yours.

By taking these steps, you can lower the risk and impact of emergencies. This ensures you're ready for any unexpected situation.

## Conclusion: Peace of Mind with Trusted Emergency Services

Having **trusted emergency tradesmen** is key for UK homeowners. They ensure your home emergencies are fixed quickly and well. Whether it's a burst pipe, a faulty boiler, or being locked out, **[Emergency Services UK](https://emergencytradesmen.net/)** are there for you.

We're changing how homeowners find and book quality repair services. With **[emergency tradesmen uk](https://emergencytradesmen.net/)**, your home is in safe hands. They can tackle many emergencies, offering a fast fix to get your home running smoothly again.

Having a reliable emergency tradesman ready to help means peace of mind. It saves you time and stress and prevents more damage. So, find a trusted emergency tradesman today to keep your home safe and sound.

## FAQ

### What is an emergency tradesman?

An emergency tradesman is a professional ready to fix urgent home problems. This includes burst pipes, electrical faults, or gas leaks. They work 24/7.

### How do I find an emergency plumber near me?

To find an emergency plumber, search online for "emergency plumber near me". You can also check local directories and review sites for trusted tradesmen in your area.

### What should I do when a pipe bursts in my home?

If a pipe bursts, first turn off the main water supply if you can. Then, call an emergency plumber right away. This helps prevent more damage and flooding.

### Are emergency tradesmen available 24 hours a day?

Yes, many emergency tradesmen are available 24/7. They're ready to fix **urgent home repairs** and emergencies at any time.

### How quickly can an emergency tradesman arrive?

How fast they arrive depends on the emergency and where you are. But, many aim to get there in 1-2 hours or less for urgent cases.

### What are the typical costs associated with emergency tradesmen services?

Costs vary based on the emergency, the tradesman's rates, and materials needed. Be ready for a call-out fee and possibly higher rates for urgent work.

### How can I ensure the emergency tradesman I hire is reliable and trustworthy?

Choose tradesmen who are certified, insured, and have good reviews. This ensures you're hiring a reliable and trustworthy professional.

### Can I prevent home emergencies with regular maintenance?

Yes, **regular maintenance** can prevent many emergencies. It helps spot and fix issues before they become big problems.

### What should I include in my emergency contact list?

Your emergency list should have local tradesmen like plumbers, electricians, and locksmiths. Also include your utility providers and insurance company.

### Are there any essential tools or supplies I should keep on hand for temporary fixes?

Keep basic tools like a pipe wrench, duct tape, and a first aid kit. They help with temporary fixes until a professional can arrive.`,
                    published_at: new Date().toISOString(),
                    created_at: new Date().toISOString()
                });
                setIsLoading(false);
                return;
            }

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
                        {/* Hero Section - 16:9 Strict */}
                        <div className="relative w-full aspect-video overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
                            {post.cover_image && (
                                <img
                                    src={post.cover_image}
                                    alt={post.title}
                                    className="w-full h-full object-cover"
                                />
                            )}

                            <div className="absolute bottom-0 left-0 w-full z-20 pb-8 md:pb-12">
                                <div className="container mx-auto px-4 max-w-4xl text-center">
                                    <Badge className="mb-4 bg-gold/10 text-gold border-gold/20 hover:bg-gold/20 transition-colors uppercase tracking-widest text-[10px] px-3 py-1">
                                        Expert Guide
                                    </Badge>
                                    <h1 className="text-[28px] md:text-[44px] font-body font-bold leading-[1.2] text-foreground mb-4 text-balance drop-shadow-sm">
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
                                    <div className="font-body text-primary-text space-y-8">
                                        <ReactMarkdown
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
                                                    <p {...props} className="font-normal text-[15px] md:text-[18px] leading-[1.6] md:leading-[1.8] mb-6 text-muted-foreground" />
                                                ),
                                                ul: ({ node, ...props }) => (
                                                    <ul {...props} className="list-disc pl-6 mb-6 space-y-2 font-normal text-[15px] md:text-[18px] leading-[1.6] text-muted-foreground" />
                                                ),
                                                li: ({ node, ...props }) => (
                                                    <li {...props} />
                                                ),
                                                a: ({ node, ...props }) => (
                                                    <a {...props} className="font-semibold text-gold no-underline hover:underline" />
                                                ),
                                                blockquote: ({ node, ...props }) => (
                                                    <blockquote {...props} className="border-l-4 border-gold bg-secondary/30 py-4 px-6 rounded-r-lg italic my-8 text-muted-foreground" />
                                                ),
                                                // STRICT Image Rules: 16:9 aspect ratio, full width, no mid-paragraph placement
                                                img: ({ node, ...props }) => (
                                                    <div className="my-12 w-full">
                                                        <div className="aspect-video w-full overflow-hidden rounded-xl border border-secondary shadow-lg">
                                                            <img
                                                                {...props}
                                                                className="w-full h-full object-cover"
                                                                loading="lazy"
                                                            />
                                                        </div>
                                                        {props.title && (
                                                            <p className="text-center text-sm text-muted-foreground mt-3 italic">
                                                                {props.title}
                                                            </p>
                                                        )}
                                                    </div>
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
                                    <img
                                        src="/et-logo-v2.png"
                                        alt="Emergency Tradesmen Logo"
                                        className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-gold/30 shadow-2xl shadow-gold/20 object-cover"
                                    />
                                    <h3 className="text-[22px] md:text-[32px] font-body font-bold text-foreground mb-4">
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
