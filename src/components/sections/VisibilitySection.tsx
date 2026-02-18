export function VisibilitySection() {
    return (
        <div className="container-wide pt-12">
            {/* Visibility Into Call-Outs Box for Tradesmen */}
            <div className="max-w-4xl mx-auto mb-16 p-8 rounded-3xl border border-gold/30 bg-gold/5 backdrop-blur-sm shadow-lg overflow-hidden relative group">
                {/* Decorative background glow */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold/10 rounded-full blur-[80px] group-hover:bg-gold/20 transition-colors duration-700" />

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                        <span className="text-gold uppercase tracking-luxury text-xs font-bold mb-2 block">For Tradesmen</span>
                        <h3 className="font-display text-3xl text-foreground mb-4">
                            Get Seen, Get Hired.
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            Stop chasing leads. Join our verified network and get direct calls from customers in your area who need help right now.
                        </p>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <div className="mt-1.5 w-5 h-5 rounded-full border border-gold/40 flex items-center justify-center flex-shrink-0">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                                </div>
                                <p className="text-foreground font-medium">Get seen first with priority ranking in your area</p>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-1.5 w-5 h-5 rounded-full border border-gold/40 flex items-center justify-center flex-shrink-0">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                                </div>
                                <p className="text-foreground font-medium">Build instant trust with a ‘Featured’ badge and reviews</p>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-1.5 w-5 h-5 rounded-full border border-gold/40 flex items-center justify-center flex-shrink-0">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                                </div>
                                <p className="text-foreground font-medium">Receive direct calls, not messages or time-wasters</p>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-1.5 w-5 h-5 rounded-full border border-gold/40 flex items-center justify-center flex-shrink-0">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                                </div>
                                <p className="text-foreground font-medium">Reach customers ready to act, not just browsing</p>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-1.5 w-5 h-5 rounded-full border border-gold/40 flex items-center justify-center flex-shrink-0">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                                </div>
                                <p className="text-foreground font-medium font-bold">No ads to manage. No chasing leads. Just calls.</p>
                            </li>
                        </ul>
                    </div>

                    {/* Showcase Image Area */}
                    <div className="relative aspect-[9/16] rounded-2xl border border-gold/20 bg-gold/5 flex items-center justify-center overflow-hidden hover:border-gold/40 transition-colors duration-500 shadow-lg">
                        <img
                            src="/visibility-showcase.jpg"
                            alt="Visibility showcase"
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                            width="400"
                            height="700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
                    </div>
                </div>
            </div>
        </div>
    );
}
