import os

file_path = os.path.join('..', 'src', 'components', 'BusinessCard.tsx')

if not os.path.exists(file_path):
    print(f"Error: {file_path} not found")
    exit(1)

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update isPaid/isPremium logic
old_is_paid = "  const isPaid = business.is_premium || business.tier === 'paid' || (business.priority_score && business.priority_score > 0);"
new_is_paid = """  const isPremium = business.is_premium || business.tier === 'paid';
  const isPaid = isPremium || (business.priority_score && business.priority_score > 0);"""

content = content.replace(old_is_paid, new_is_paid)

# 2. Update Card Container for Green Glow (Premium)
old_card_classes = """  <div
  className={`group relative bg-card rounded-lg border hover:shadow-2xl hover:shadow-gold/20 hover:-translate-y-1 transition-[shadow,border-color,transform] duration-300 overflow-hidden h-full flex flex-col ${isPaid
  ? "border-gold shadow-xl shadow-gold/10 bg-gradient-to-br from-card via-card to-gold/5 ring-1 ring-gold/20"
  : "border-border/50 hover:border-gold/30"
  }`}
  >"""

# Using Emerald (Green) for Premium, Gold for Paid, Border for Standard
new_card_classes = """  <div
  className={`group relative bg-card rounded-lg border hover:shadow-2xl transition-[shadow,border-color,transform] duration-300 overflow-hidden h-full flex flex-col ${
    isPremium 
      ? "border-emerald-500/50 shadow-xl shadow-emerald-500/20 bg-gradient-to-br from-card via-card to-emerald-500/5 ring-1 ring-emerald-500/20 hover:-translate-y-1 hover:shadow-emerald-500/40" 
      : isPaid
        ? "border-gold shadow-xl shadow-gold/10 bg-gradient-to-br from-card via-card to-gold/5 ring-1 ring-gold/20 hover:-translate-y-1 hover:shadow-gold/20"
        : "border-border/50 hover:border-gold/30 hover:-translate-y-1"
  }`}
  >"""

content = content.replace(old_card_classes, new_card_classes)

# 3. Add Photo Placeholder/Display at the top for Premium
# We'll insert it before the rank badge area if it's premium
old_rank_badge = """  {/* Rank badge / Featured Badge */}
  <div className={`absolute top-4 left-4 z-10 rounded-full flex items-center justify-center ${isPaid"""

new_rank_badge = """  {/* Premium Background Photo */}
  {isPremium && business.photos && business.photos.length > 0 && (
    <div className="h-40 w-full relative overflow-hidden">
      <img 
        src={typeof business.photos[0] === 'string' ? business.photos[0] : (business.photos[0] as any).url} 
        alt={business.name} 
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
    </div>
  )}

  {/* Rank badge / Featured Badge */}
  <div className={`absolute top-4 left-4 z-10 rounded-full flex items-center justify-center ${isPremium ? "px-3 h-7 bg-emerald-500 text-white font-bold text-xs uppercase tracking-wide shadow-lg shadow-emerald-500/20" : isPaid"""

content = content.replace(old_rank_badge, new_rank_badge)

# Update the featured text/icon for premium
old_featured_inner = """  {isPaid ? (
  <span className="flex items-center gap-1">
  <Zap className="w-3 h-3 fill-black" />
  Featured
  </span>"""

new_featured_inner = """  {isPremium ? (
  <span className="flex items-center gap-1">
  <ShieldCheck className="w-3 h-3" />
  Approved
  </span>
  ) : isPaid ? (
  <span className="flex items-center gap-1">
  <Zap className="w-3 h-3 fill-black" />
  Featured
  </span>"""

content = content.replace(old_featured_inner, new_featured_inner)

# 4. Update the name section to include the Logo
old_name_section = """  <div className="p-6 pt-16 flex-1 flex flex-col">
  {/* Business name - Fixed height for alignment */}
  <div className="h-[3.5rem] mb-3 pr-4 flex items-start">
  <h3 className="font-display text-xl tracking-wide text-foreground leading-tight line-clamp-2">
  <Link to={`/business/${business.id}`} className="hover:text-gold transition-colors">
  {business.name}
  </Link>
  </h3>
  </div>"""

# If premium, we adjust pt-16 to pt-6 if there's a photo, and add logo
new_name_section = """  <div className={`p-6 ${isPremium && business.photos?.length ? 'pt-4' : 'pt-16'} flex-1 flex flex-col`}>
  {/* Business name & Logo */}
  <div className="h-[4.5rem] mb-3 pr-4 flex items-start gap-4">
  {isPremium && business.logo_url && (
    <div className="w-12 h-12 rounded-lg border border-border overflow-hidden flex-shrink-0 bg-white shadow-sm">
      <img src={business.logo_url} alt={`${business.name} logo`} className="w-full h-full object-contain" />
    </div>
  )}
  <div className="flex-1">
  <h3 className="font-display text-xl tracking-wide text-foreground leading-tight line-clamp-2">
  <Link to={`/business/${business.id}`} className={`transition-colors ${isPremium ? 'hover:text-emerald-500' : 'hover:text-gold'}`}>
  {business.name}
  </Link>
  </h3>
  {isPremium && (
    <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">
      <ShieldCheck className="w-3 h-3" />
      Verified Partner
    </div>
  )}
  </div>
  </div>"""

content = content.replace(old_name_section, new_name_section)

# 5. Fix the action buttons for premium
old_call_now = 'className="w-full bg-gradient-to-r from-gold to-yellow-500 hover:from-yellow-400 hover:to-gold text-black font-bold border-0 h-11"'
new_call_now = 'className={`w-full font-bold border-0 h-11 ${isPremium ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" : "bg-gradient-to-r from-gold to-yellow-500 hover:from-yellow-400 hover:to-gold text-black uppercase"}`}'

content = content.replace(old_call_now, new_call_now)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully updated BusinessCard.tsx for Premium prototype")
