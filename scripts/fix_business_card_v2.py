import os
import re

file_path = os.path.join('..', 'src', 'components', 'BusinessCard.tsx')

if not os.path.exists(file_path):
    print(f"Error: {file_path} not found")
    exit(1)

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Define isPremium properly
old_line = " const isPaid = business.is_premium || business.tier === 'paid' || (business.priority_score && business.priority_score > 0);"
new_line = """ const isPremium = business.is_premium || business.tier === 'paid';
 const isPaid = isPremium || (business.priority_score && business.priority_score > 0);"""

if old_line in content:
    content = content.replace(old_line, new_line)
else:
    print("Could not find exact isPaid line, trying fallback...")
    content = re.sub(r'const isPaid = business\.is_premium \|\| business\.tier === \'paid\' \|\| \(business\.priority_score && business\.priority_score > 0\);', new_line, content)

# 2. Fix the Card classes
pattern_card = r'<div\s+className={`group relative bg-card rounded-lg border hover:shadow-2xl hover:shadow-gold/20 hover:-translate-y-1 transition-\[shadow,border-color,transform\] duration-300 overflow-hidden h-full flex flex-col \${isPaid\s+\? "border-gold shadow-xl shadow-gold/10 bg-gradient-to-br from-card via-card to-gold/5 ring-1 ring-gold/20"\s+: "border-border/50 hover:border-gold/30"\s+}`}\s+>'

replacement_card = """<div
  className={`group relative bg-card rounded-lg border hover:shadow-2xl transition-[shadow,border-color,transform] duration-300 overflow-hidden h-full flex flex-col ${
    isPremium 
      ? "border-emerald-500/50 shadow-xl shadow-emerald-500/20 bg-gradient-to-br from-card via-card to-emerald-500/5 ring-1 ring-emerald-500/20 hover:-translate-y-1 hover:shadow-emerald-500/40" 
      : isPaid
        ? "border-gold shadow-xl shadow-gold/10 bg-gradient-to-br from-card via-card to-gold/5 ring-1 ring-gold/20 hover:-translate-y-1 hover:shadow-gold/20"
        : "border-border/50 hover:border-gold/30 hover:-translate-y-1"
  }`}
  >"""

content = re.sub(pattern_card, replacement_card, content, flags=re.DOTALL)

# 3. Add Photo and Rank logic (Premium Emerald)
replacement_badging = """{/* Premium Background Photo */}
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

content = re.sub(r'{\/\* Rank badge \/ Featured Badge \*\/}\n\s+<div className={`absolute top-4 left-4 z-10 rounded-full flex items-center justify-center \${isPaid', replacement_badging, content)

# 4. Featured/Approved text
old_featured = """ {isPaid ? (
 <span className="flex items-center gap-1">
 <Zap className="w-3 h-3 fill-black" />
 Featured
 </span>
 ) : ("""

new_featured = """ {isPremium ? (
 <span className="flex items-center gap-1">
 <ShieldCheck className="w-3 h-3" />
 Approved
 </span>
 ) : isPaid ? (
 <span className="flex items-center gap-1">
 <Zap className="w-3 h-3 fill-black" />
 Featured
 </span>
 ) : ("""

if old_featured in content:
    content = content.replace(old_featured, new_featured)

# 5. Logo and Name pt logic
old_name_start = '<div className="p-6 pt-16 flex-1 flex flex-col">'
new_name_start = '<div className={`p-6 ${isPremium && business.photos?.length ? "pt-4" : "pt-16"} flex-1 flex flex-col`}>'

if old_name_start in content:
    content = content.replace(old_name_start, new_name_start)

old_name_inner = """ {/* Business name - Fixed height for alignment */}
 <div className="h-[3.5rem] mb-3 pr-4 flex items-start">
 <h3 className="font-display text-xl tracking-wide text-foreground leading-tight line-clamp-2">
 <Link to={`/business/${business.id}`} className="hover:text-gold transition-colors">
 {business.name}
 </Link>
 </h3>
 </div>"""

new_name_inner = """ {/* Business name & Logo */}
 <div className="h-[4.5rem] mb-3 pr-4 flex items-start gap-4">
 {isPremium && business.logo_url && (
 <div className="w-12 h-12 rounded-lg border border-border overflow-hidden flex-shrink-0 bg-white shadow-sm">
 <img src={business.logo_url} alt={`${business.name} logo`} className="w-full h-full object-contain" />
 </div>
 )}
 <div className="flex-1">
 <h3 className="font-display text-xl tracking-wide text-foreground leading-tight line-clamp-2">
 <Link to={`/business/${business.id}`} className={`transition-colors ${isPremium ? "hover:text-emerald-500" : "hover:text-gold"}`}>
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

if old_name_inner in content:
    content = content.replace(old_name_inner, new_name_inner)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully fixed BusinessCard.tsx ReferenceError and applied Premium styles.")
