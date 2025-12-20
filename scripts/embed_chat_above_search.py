
import os
import re

path = "../src/pages/Index.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Add Import (if not present)
if 'import { EmergencyChatInterface }' not in content:
    # Find a good spot for import. 
    # Replace the SearchForm import line to add Chat Interface import after it
    if 'import { SearchForm } from "@/components/SearchForm";' in content:
        content = content.replace(
            'import { SearchForm } from "@/components/SearchForm";',
            'import { SearchForm } from "@/components/SearchForm";\nimport { EmergencyChatInterface } from "@/components/EmergencyChatInterface";'
        )
    else:
        # Fallback if specific line not found (unlikely)
        content = 'import { EmergencyChatInterface } from "@/components/EmergencyChatInterface";\n' + content

# Embed Chat ABOVE SearchForm
# <SearchForm /> -> <Chat /><SearchForm />
if '<SearchForm />' in content:
    replacement = '''
                <div className="w-full max-w-4xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                  <div className="backdrop-blur-sm rounded-3xl overflow-hidden">
                    <EmergencyChatInterface />
                  </div>
                </div>
                
                <SearchForm />'''
    
    content = content.replace('<SearchForm />', replacement)
    print("Embedded Chat ABOVE SearchForm")
else:
    print("Could not find <SearchForm /> tag")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
