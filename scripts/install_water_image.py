
import shutil
import os

# Source is the user uploaded image
source = r"C:\Users\Nick\.gemini\antigravity\brain\5023aa8e-cd49-4e3b-be67-d2ce047e5c08\uploaded_image_1768482612680.jpg"
# Target is the public folder
target = r"C:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\public\water-hero-final.jpg"

try:
    if not os.path.exists(source):
        print(f"Error: Source file not found at {source}")
    else:
        shutil.copy2(source, target)
        print(f"Success: Copied to {target}")
        print(f"File size: {os.path.getsize(target)} bytes")
except Exception as e:
    print(f"Error copying file: {e}")
