
import os
import re

path = "../src/pages/Index.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Add Import
if 'import { EmergencyChatInterface }' not in content:
    content = content.replace(
        'import { EmergencyTriageModal } from "@/components/EmergencyTriageModal";', 
        'import { EmergencyTriageModal } from "@/components/EmergencyTriageModal";\nimport { EmergencyChatInterface } from "@/components/EmergencyChatInterface";'
    )

# Replace "Get Help Now" Button with Clean Chat Interface
# Using a clean container without borders/shadows to respect "Day 1" complaint (maybe they want it clear)
# And assuring it's above the buttons.

target_str = '''<EmergencyTriageModal
                  trigger={
                    <Button variant="outline" size="lg" className="border-gold/50 text-gold hover:bg-gold/10 hover:text-gold rounded-full">
                      <Zap className="w-5 h-5 mr-2" />
                      Not sure what you need? Get Help Now
                    </Button>
                  }
                />'''

# Clean Replacement: No card styles, just the component in a responsive container
replacement_str = '''<div className="w-full max-w-3xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                  <div className="backdrop-blur-sm rounded-3xl overflow-hidden">
                    <EmergencyChatInterface />
                  </div>
                </div>'''

if target_str in content:
    content = content.replace(target_str, replacement_str)
else:
    # Regex fallback
    content = re.sub(
        r'<EmergencyTriageModal\s+trigger=\{[\s\S]*?\}\s*/>', 
        replacement_str, 
        content
    )

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Embedded Chat Interface (Clean Style)")
