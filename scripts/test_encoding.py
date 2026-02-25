import json

files = [
    r'c:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\scripts\all_posts_content.json',
    r'c:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\scripts\all_posts_content_fixed.json'
]

for filepath in files:
    print(f"\n--- Checking {filepath} ---")
    try:
        with open(filepath, 'rb') as f:
            raw = f.read(50)
            print(f"Raw bytes: {raw.hex(' ')}")
    except Exception as e:
        print(f"FAILED to read raw bytes: {e}")
        continue

    encodings = ['utf-16', 'utf-8-sig', 'utf-8', 'latin-1']

    for enc in encodings:
        try:
            with open(filepath, 'r', encoding=enc) as f:
                content = f.read()
                print(f"SUCCESS with {enc}. First 100 chars: {content[:100]!r}")
                
                # Check where JSON starts
                start_array = content.find('[')
                start_obj = content.find('{')
                start_indices = [i for i in [start_array, start_obj] if i != -1]
                if start_indices:
                    start = min(start_indices)
                    potential_json = content[start:]
                    try:
                        data = json.loads(potential_json)
                        print(f"  JSON VALID after stripping {start} chars.")
                    except json.JSONDecodeError as je:
                        print(f"  JSON INVALID even after stripping: {je}")
                else:
                    print("  NO '[' or '{' found.")
        except Exception as e:
            print(f"FAILED with {enc}: {e}")
