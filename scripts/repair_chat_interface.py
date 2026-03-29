
import os
import re

path = "../src/components/EmergencyChatInterface.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# The previous regex match was likely partial. 
# Let's find the specific orphaned closing tag area identified by the browser agent.

# Identification from browser agent:
# {/* Contextual Locate Button */}
# 
#             disabled={geoLoading}
#             className="text-xs border-primary/20 hover:bg-gold/10 hover:border-gold/50 transition-all animate-pulse"
#         >
#             <MapPin className="w-3 h-3 mr-1" />
#             {geoLoading ? "Locating..." : "ðŸ“  Locate Me"}
#         </Button>
#     </div>
# )}

pattern = r'\{msg\.content\.includes\("Which city or area are you in\?"\) && \([\s\S]*?\) && \([\s\S]*?\n\s+\)\}'
# Or more simply, let's find the "Contextual Locate Button" marker and the following ")}"
import re

# Look for the marker and the NEXT ')}' that closes a JSX block in this context
marker = '{/* Contextual Locate Button */}'
if marker in content:
    start_idx = content.find(marker)
    # Search for the closing ')}' after the marker
    end_idx = content.find(')}', start_idx)
    if end_idx != -1:
        # We want to remove from marker up to and including ')}'
        # But wait, the marker might be inside a { ... } block that was partially deleted.
        # Based on browser logs, it looks like:
        # {msg.content.includes(...) && ( ... )} 
        # was turned into:
        # {msg.content.includes(...) && (
        #    ... orphaned tags ...
        # )}
        
        # Let's find the start of the {msg.content... expression
        expr_start = content.rfind('{', 0, start_idx)
        if expr_start != -1:
            full_end = end_idx + 2
            content = content[:expr_start] + content[full_end:]
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)
            print("Repaired EmergencyChatInterface.tsx manually")
        else:
            print("Could not find expression start")
    else:
        print("Could not find closing )}")
else:
    print("Marker not found")
