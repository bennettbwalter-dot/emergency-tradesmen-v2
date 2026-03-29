
import os
from PIL import Image

# Paths
INPUT_IMAGE = r"C:/Users/Nick/.gemini/antigravity/brain/51191fd0-14ff-4f9b-8e4b-4f61cad3054b/uploaded_media_1_1769470849130.png"
PUBLIC_DIR = r"c:/Users/Nick/Downloads/hitmaker-2026/emergency-tradesmen/public"

FAVICON_ICO_PATH = os.path.join(PUBLIC_DIR, "favicon.ico")
FAVICON_PNG_PATH = os.path.join(PUBLIC_DIR, "favicon.png")
ET_FAVICON_PATH = os.path.join(PUBLIC_DIR, "et-favicon.png") # Updating this too just in case

def update_favicons():
    try:
        if not os.path.exists(INPUT_IMAGE):
            print(f"Error: Input image not found at {INPUT_IMAGE}")
            return

        img = Image.open(INPUT_IMAGE)
        print(f"Loaded image: {img.size} format: {img.format}")

        # 1. Provide favicon.ico (multi-size)
        # Standard sizes for ico: 16, 32, 48, 64, 128, 256
        img.save(FAVICON_ICO_PATH, format='ICO', sizes=[(16,16), (32,32), (48,48), (64,64), (128,128), (256,256)])
        print(f"Saved {FAVICON_ICO_PATH}")

        # 2. Provide favicon.png (usually 32x32 or 192x192, we'll aim for a high quality one like 512x512 or keep original if valid)
        # Use a high-res PNG for modern link rel="icon"
        # Resize to 512x512 for consistency if original is huge, or keep. 
        # Let's save a 512x512 version as the main png favicon
        img_512 = img.resize((512, 512), Image.Resampling.LANCZOS)
        img_512.save(FAVICON_PNG_PATH, format='PNG')
        print(f"Saved {FAVICON_PNG_PATH}")

        # 3. Update et-favicon.png as well since it seems to be used/referenced
        img_512.save(ET_FAVICON_PATH, format='PNG')
        print(f"Saved {ET_FAVICON_PATH}")
        
        print("Favicon update complete.")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    update_favicons()
