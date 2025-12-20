
import os

path = "../src/contexts/ChatbotContext.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

if 'isRequestingLocation: boolean;' not in content:
    content = content.replace(
        'detectedCity: string | null;',
        'detectedCity: string | null;\n    isRequestingLocation: boolean;'
    )
    content = content.replace(
        'setDetectedCity: (city: string | null) => void;',
        'setDetectedCity: (city: string | null) => void;\n    setIsRequestingLocation: (isRequesting: boolean) => void;'
    )
    content = content.replace(
        'const [detectedCity, setDetectedCity] = useState<string | null>(null);',
        'const [detectedCity, setDetectedCity] = useState<string | null>(null);\n    const [isRequestingLocation, setIsRequestingLocation] = useState(false);'
    )
    content = content.replace(
        'value={{ detectedTrade, detectedCity, setDetectedTrade, setDetectedCity }}',
        'value={{ detectedTrade, detectedCity, isRequestingLocation, setDetectedTrade, setDetectedCity, setIsRequestingLocation }}'
    )

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Updated ChatbotContext.tsx")
else:
    print("ChatbotContext.tsx already updated")
