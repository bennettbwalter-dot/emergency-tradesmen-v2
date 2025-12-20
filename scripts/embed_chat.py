
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

# Replace Button with Interface
target_str = '''<EmergencyTriageModal
                  trigger={
                    <Button variant="outline" size="lg" className="border-gold/50 text-gold hover:bg-gold/10 hover:text-gold rounded-full">
                      <Zap className="w-5 h-5 mr-2" />
                      Not sure what you need? Get Help Now
                    </Button>
                  }
                />'''

replacement_str = '''<div className="w-full max-w-xl mx-auto bg-card/95 backdrop-blur-sm rounded-2xl border border-border/50 shadow-2xl overflow-hidden h-[450px] flex flex-col mb-8">
                  <div className="p-3 border-b border-border/50 bg-muted/30 flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                     <span className="text-sm font-medium">Emergency Agent</span>
                  </div>
                  <div className="flex-1 overflow-hidden relative">
                    <EmergencyChatInterface />
                  </div>
                </div>'''

if target_str in content:
    content = content.replace(target_str, replacement_str)
else:
    print("Exact string not found. Trying regex.")
    # Regex to replace EmergencyTriageModal block handling the internal button content
    # Look for <EmergencyTriageModal ... /> 
    content = re.sub(
        r'<EmergencyTriageModal\s+trigger=\{[\s\S]*?\}\s*/>', 
        replacement_str, 
        content
    )

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Embedded Chat Interface into Index.tsx")
