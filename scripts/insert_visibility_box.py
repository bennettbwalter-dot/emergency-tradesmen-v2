import os

index_path = r"..\src\pages\Index.tsx"

with open(index_path, "r", encoding="utf-8") as f:
    content = f.read()

# The content to insert
visibility_box = """
              {/* Visibility Into Call-Outs Box for Tradesmen */}
              <div className="max-w-4xl mx-auto mb-16 p-8 rounded-3xl border border-gold/30 bg-gold/5 backdrop-blur-sm shadow-2xl overflow-hidden relative group">
                {/* Decorative background glow */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold/10 rounded-full blur-[80px] group-hover:bg-gold/20 transition-colors duration-700" />
                
                <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
                  <div className="text-left">
                    <h2 className="font-display text-3xl md:text-4xl text-foreground mb-6 leading-tight">
                      Turn <span className="text-gold">Visibility</span> Into <span className="text-gold">Call-Outs</span>
                    </h2>
                    <ul className="space-y-4">
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
                  
                  {/* Empty Placeholder Image Area */}
                  <div className="relative aspect-video rounded-2xl border-2 border-dashed border-gold/20 bg-gold/5 flex items-center justify-center overflow-hidden hover:border-gold/40 transition-colors duration-500 group/placeholder">
                    <div className="text-center p-6">
                      <div className="w-16 h-16 rounded-full border border-gold/20 flex items-center justify-center mx-auto mb-4 bg-gold/5 group-hover/placeholder:scale-110 transition-transform duration-500">
                        <Zap className="w-8 h-8 text-gold animate-pulse" />
                      </div>
                      <p className="text-gold/60 text-sm font-medium uppercase tracking-widest">Image Placeholder</p>
                      <p className="text-muted-foreground/60 text-xs mt-2">Space reserved for showcase visual</p>
                    </div>
                  </div>
                </div>
              </div>
"""

# Insertion point detection
# After line 532 or similar in my previous view
insertion_marker = """              </motion.div>

                <div className="mb-8 -mx-6 md:mx-auto max-w-4xl">"""

if insertion_marker in content:
    content = content.replace(insertion_marker, "              </motion.div>" + visibility_box + """\n                <div className="mb-8 -mx-6 md:mx-auto max-w-4xl">""")
    print("Visibility box inserted into Index.tsx")
else:
    # Fallback search if spacing differs
    print("Insertion marker not found, trying fuzzy match...")
    if "</motion.div>" in content and "<AvailabilityCarousel />" in content:
        content = content.replace("<AvailabilityCarousel />", visibility_box + "\n                  <AvailabilityCarousel />")
        print("Used fallback insertion above AvailabilityCarousel.")
    else:
        print("Could not find suitable insertion point.")
        exit(1)

with open(index_path, "w", encoding="utf-8") as f:
    f.write(content)
