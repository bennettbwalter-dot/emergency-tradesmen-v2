import os

pricing_path = r"..\src\pages\PricingPage.tsx"

with open(pricing_path, "r", encoding="utf-8") as f:
    content = f.read()

new_section = """
                    <div className="max-w-3xl mx-auto mb-16 text-center bg-card/50 border border-gold/20 p-8 rounded-2xl backdrop-blur-sm">
                        <p className="text-gold uppercase tracking-widest text-sm font-bold mb-4">for Tradesmen</p>
                        <h2 className="text-3xl font-display mb-6">Why Join Emergency Tradesmen?</h2>
                        <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                            <p>
                                When emergencies happen, customers don’t shop around — they call the first trusted tradesperson they see.
                            </p>
                            <p>
                                Emergency Tradesmen puts your business front and centre at the exact moment people need help, turning urgent searches into real call-outs.
                            </p>
                        </div>
                    </div>
"""

# Insert after the hero text
insertion_point = """                        <p className="text-xl text-muted-foreground">
                            Get priority ranking, enhanced trust signals, and 3x more leads.
                        </p>
                    </div>"""

if insertion_point in content:
    content = content.replace(insertion_point, insertion_point + new_section)
    print("New section inserted.")
else:
    print("Insertion point not found.")
    exit(1)

with open(pricing_path, "w", encoding="utf-8") as f:
    f.write(content)

print("PricingPage updated with 'for Tradesmen' section.")
