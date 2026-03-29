
import os
import sys
import subprocess
from pathlib import Path

def install_pillow():
    print("Installing Pillow for image conversion...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    except subprocess.CalledProcessError:
        print("Failed to install Pillow. Please install it manually: pip install Pillow")
        sys.exit(1)

try:
    from PIL import Image
except ImportError:
    install_pillow()
    from PIL import Image

def convert_to_webp(directory, min_size_kb=200):
    """
    Recursively finds images > min_size_kb and converts them to WebP.
    """
    public_dir = Path(directory)
    count = 0
    saved_space = 0

    print(f"Scanning {public_dir} for images larger than {min_size_kb}KB...")

    for file_path in public_dir.rglob('*'):
        if file_path.suffix.lower() not in ['.png', '.jpg', '.jpeg']:
            continue
        
        # Skip if it's already a webp source (though looking for png/jpg)
        
        size_kb = file_path.stat().st_size / 1024
        if size_kb > min_size_kb:
            try:
                # Target path
                webp_path = file_path.with_suffix('.webp')
                
                # Check if webp already exists and is efficient
                if webp_path.exists() and webp_path.stat().st_size < file_path.stat().st_size:
                    print(f"Skipping {file_path.name} (WebP already exists)")
                    continue

                print(f"Converting {file_path.name} ({size_kb:.1f}KB)...")
                
                with Image.open(file_path) as img:
                    # Resize if extremely large (e.g., > 2500px width)
                    if img.width > 2500:
                        ratio = 2500 / img.width
                        new_height = int(img.height * ratio)
                        img = img.resize((2500, new_height), Image.Resampling.LANCZOS)
                        print(f"  Resized to 2500px width")

                    # Convert to RGB if necessary (e.g. PNG with alpha)
                    # For PNGs with transparency, we keep RGBA, but WebP handles it.
                    # If saving as JPG we'd need RGB. WebP supports transparency.
                    
                    img.save(webp_path, 'WEBP', quality=85, optimize=True)
                
                new_size_kb = webp_path.stat().st_size / 1024
                saved = size_kb - new_size_kb
                if saved > 0:
                    print(f"  -> Created {webp_path.name} ({new_size_kb:.1f}KB). Saved {saved:.1f}KB")
                    saved_space += saved
                    count += 1
                else:
                    print(f"  -> Created {webp_path.name} but it was larger/same. Keeping both.")
                    
            except Exception as e:
                print(f"Error converting {file_path}: {e}")

    print(f"\nSummary: Converted {count} images. Total space saved: {saved_space/1024:.2f} MB")

if __name__ == "__main__":
    target_dir = os.path.join(os.getcwd(), "public")
    if not os.path.exists(target_dir):
        print("Error: 'public' directory not found.")
    else:
        convert_to_webp(target_dir)
