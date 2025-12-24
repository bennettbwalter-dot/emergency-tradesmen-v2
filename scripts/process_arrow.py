from PIL import Image

def process_arrow():
    input_path = "c:/Users/Nick/Downloads/hitmaker-2026/emergency-tradesmen/public/arrow-original.jpg"
    output_path = "c:/Users/Nick/Downloads/hitmaker-2026/emergency-tradesmen/public/custom-arrow.png"

    try:
        img = Image.open(input_path).convert("RGBA")
        datas = img.getdata()
        
        new_data = []
        for item in datas:
            # item is (R, G, B, A)
            # Check for white background (threshold 200)
            if item[0] > 200 and item[1] > 200 and item[2] > 200:
                new_data.append((255, 255, 255, 0)) # Transparent
            else:
                # Colorize to Gold (#D4AF37 -> 212, 175, 55)
                # Keep full opacity
                new_data.append((212, 175, 55, 255))
        
        img.putdata(new_data)
        img.save(output_path, "PNG")
        print(f"Successfully saved transparent gold arrow to {output_path}")

    except Exception as e:
        print(f"Error processing image: {e}")

if __name__ == "__main__":
    process_arrow()
