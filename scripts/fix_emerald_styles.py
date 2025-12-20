import os
import re

file_path = os.path.join('..', 'src', 'components', 'BusinessCard.tsx')

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update the main card wrapper styles for premium
# We look for the className of the main div
old_style = r'className={`group relative bg-card rounded-lg border hover:shadow-2xl transition-all duration-300 (\${[\s\S]+?})`}'
new_style = 'className={`group relative bg-card rounded-lg border hover:shadow-2xl transition-all duration-300 ${isPremium ? "border-emerald-500/50 shadow-xl shadow-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent" : "border-border/50 hover:border-emerald-500/30"} ${className}`}'

# Let's use a simpler regex if the above is too complex
search_pattern = r'isPremium\s\?\s"border-gold shadow-xl shadow-gold/10 bg-gradient-to-br from-gold/5 to-transparent"\s:\s"border-border/50 hover:border-gold/30"'
replacement = 'isPremium ? "border-emerald-500 shadow-xl shadow-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent" : "border-border/50 hover:border-emerald-500/30"'

if re.search(search_pattern, content):
    content = re.sub(search_pattern, replacement, content)
    print("Updated premium card colors to Emerald")
else:
    # Try another common pattern
    search_pattern_2 = r'border-gold shadow-xl shadow-gold/10'
    replacement_2 = 'border-emerald-500 shadow-xl shadow-emerald-500/20'
    if re.search(search_pattern_2, content):
        content = re.sub(search_pattern_2, replacement_2, content)
        content = content.replace('from-gold/5', 'from-emerald-500/5')
        content = content.replace('hover:border-gold/30', 'hover:border-emerald-500/30')
        print("Updated premium card colors to Emerald (Pattern 2)")
    else:
        print("Could not find exact premium color patterns, checking for any gold references...")
        content = content.replace('border-gold', 'border-emerald-500')
        content = content.replace('shadow-gold/10', 'shadow-emerald-500/20')
        content = content.replace('from-gold/5', 'from-emerald-500/5')
        content = content.replace('hover:border-gold/30', 'hover:border-emerald-500/30')
        content = content.replace('bg-gold', 'bg-emerald-500')
        content = content.replace('text-gold', 'text-emerald-500')
        print("Applied global gold->emerald replacement for premium consistency")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
