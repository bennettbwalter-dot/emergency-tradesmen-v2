import os
import re

def fix_business_card():
    path = os.path.join('..', 'src', 'components', 'BusinessCard.tsx')
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update main container styling - remove gold remnants
    content = content.replace('to-gold/5', 'to-emerald-500/5')
    content = content.replace('ring-gold/20', 'ring-emerald-500/20')
    content = content.replace('fill-gold', 'fill-emerald-500')

    # 2. Add Logo rendering to the header
    # We find the name rendering block and prepend the logo
    old_name_block = """  <div className="p-6 pt-16 flex-1 flex flex-col">
  {/* Business name - Fixed height for alignment */}
  <div className="h-[3.5rem] mb-3 pr-4 flex items-start">
  <h3 className="font-display text-xl tracking-wide text-foreground leading-tight line-clamp-2">
  <Link to={`/business/${business.id}`} className="hover:text-emerald-500 transition-colors">
  {business.name}
  </Link>
  </h3>
  </div>"""

    new_name_block = """  <div className="p-6 pt-16 flex-1 flex flex-col">
  {/* Business header (Logo + Name) */}
  <div className="flex items-start gap-4 mb-3 h-[3.5rem]">
  {business.logo_url && (
  <div className="w-12 h-12 rounded-lg border border-border/50 bg-white p-1 flex-shrink-0 overflow-hidden">
  <img 
  src={business.logo_url} 
  alt={`${business.name} logo`} 
  className="w-full h-full object-contain"
  />
  </div>
  )}
  <div className="flex-1 min-w-0">
  <h3 className="font-display text-xl tracking-wide text-foreground leading-tight line-clamp-2">
  <Link to={`/business/${business.id}`} className="hover:text-emerald-500 transition-colors">
  {business.name || "Untitled Business"}
  </Link>
  </h3>
  </div>
  </div>"""

    # Check for name block without trailing spaces if exact match fails
    if old_name_block in content:
        content = content.replace(old_name_block, new_name_block)
        print("Injected logo rendering into BusinessCard.tsx")
    else:
        # Try a more flexible match for the name block
        pattern = r'<div className="p-6 pt-16 flex-1 flex flex-col">[\s\S]*?\{business\.name\}[\s\S]*?<\/div>'
        content = re.sub(pattern, new_name_block, content, count=1)
        print("Injected logo rendering into BusinessCard.tsx using regex")

    # 3. Add a "Verified & Approved" badge if it's missing (I saw ShieldCheck but can make it more prominent)
    # Let's add it near the name or rating if isPaid/isPremium
    verified_badge = """  {isPaid && (
  <div className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-bold uppercase tracking-tighter mb-1">
  <ShieldCheck className="w-3 h-3" />
  Verified Partner
  </div>
  )}"""
    
    # Prepend to the name block
    content = content.replace('<div className="flex-1 min-w-0">', f'<div className="flex-1 min-w-0">\n{verified_badge}')

    # 4. Fix the "Call Now" button colors to be more emerald-friendly
    content = content.replace('to-yellow-500 hover:from-yellow-400 hover:to-gold', 'to-emerald-600 hover:from-emerald-400 hover:to-emerald-500')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

fix_business_card()
