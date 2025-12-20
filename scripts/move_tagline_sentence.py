import re

# Read the file
with open('../src/pages/Index.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove "Find trusted local emergency tradespeople fast." from the current description
# and replace with just "Describe your emergency or search and call immediately."
old_desc = r'Find trusted local emergency tradespeople fast\.\s*Describe your emergency or search and call immediately\.'
new_desc = 'Describe your emergency or search and call immediately'

content = re.sub(old_desc, new_desc, content)

# Now add "Find trusted local emergency tradespeople fast" as a new paragraph 
# right after "When You Need Them Most" tagline
# Find the tagline section and add the new text after it
tagline_section = r'(When You Need Them Most\s*</motion\.p>)'
replacement = r'''\1

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.25 }}
                  className="text-base md:text-lg text-muted-foreground mb-4 max-w-2xl mx-auto"
                >
                  Find trusted local emergency tradespeople fast
                </motion.p>'''

content = re.sub(tagline_section, replacement, content)

# Write back
with open('../src/pages/Index.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Successfully moved the sentence under the main title')
