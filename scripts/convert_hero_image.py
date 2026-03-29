
from PIL import Image
import os

source = r"C:\Users\Nick\.gemini\antigravity\brain\5023aa8e-cd49-4e3b-be67-d2ce047e5c08\emergency_water_damage_1768478983935.png"
dest = r"C:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\public\emergency-water-damage.jpg"

try:
    img = Image.open(source)
    rgb_img = img.convert('RGB')
    rgb_img.save(dest, "JPEG")
    print("Successfully converted and saved to " + dest)
except Exception as e:
    print(f"Error: {e}")
