
import os
import re

path = "../src/components/EmergencyChatInterface.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update imports/destructuring
if 'setIsRequestingLocation' not in content:
    content = content.replace(
        'const { setDetectedTrade, setDetectedCity } = useChatbot();',
        'const { setDetectedTrade, setDetectedCity, setIsRequestingLocation } = useChatbot();'
    )

# 2. Update handleUserMessage to set state
old_sync = """            setDetectedTrade(newState.detectedTrade);
            setDetectedCity(newState.detectedCity);"""

new_sync = """            setDetectedTrade(newState.detectedTrade);
            setDetectedCity(newState.detectedCity);
            setIsRequestingLocation(newState.step === 'LOCATION_CHECK');"""

if old_sync in content:
    content = content.replace(old_sync, new_sync)

# 3. Remove inline button logic
# Finding the block:
# {msg.content.includes("Which city or area are you in?") && (
# ...
# )}

pattern = r'\{msg\.content\.includes\("Which city or area are you in\?"\) && \([\s\S]*?\)\}'
content = re.sub(pattern, '', content)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated EmergencyChatInterface.tsx")
