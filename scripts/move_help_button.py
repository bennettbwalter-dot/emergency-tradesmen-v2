import os
import re

index_path = r"..\src\pages\Index.tsx"

with open(index_path, "r", encoding="utf-8") as f:
    content = f.read()

# Find and extract the AI Triage CTA block (the "Not sure what you need?" button)
ai_triage_pattern = r'(\s*{/\* AI Triage CTA \*/}.*?<EmergencyTriageModal.*?trigger=\{.*?<Button.*?>.*?Not sure what you need\? Get Help Now.*?</Button>.*?\}.*?/>.*?</motion\.div>)'

match = re.search(ai_triage_pattern, content, re.DOTALL)
if not match:
    print("Could not find AI Triage CTA block")
    exit(1)

ai_triage_block = match.group(1)

# Remove it from its current location
content = content.replace(ai_triage_block, '')

# Find the AvailabilityCarousel section and insert the AI Triage BEFORE it
# The carousel is in the "Need Help Right Now?" CTA section
carousel_section_start = content.find('<div className="mb-8 -mx-6 md:mx-auto max-w-4xl">')

if carousel_section_start == -1:
    print("Could not find carousel section")
    exit(1)

# Insert the AI Triage block before the carousel div
content = content[:carousel_section_start] + ai_triage_block + '\n\n                ' + content[carousel_section_start:]

with open(index_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Moved 'Not sure what you need?' button above the carousel")
