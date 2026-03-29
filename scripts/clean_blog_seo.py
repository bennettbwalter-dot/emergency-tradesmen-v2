import os
import re
import json

patterns = [
    r'Primary Keyword.*',
    r'Secondary Keywords.*',
    r'Long-Tail Keywords.*',
    r'Question-Based Keywords.*',
    r'Target Keyword.*',
    r'Keywords.*',
    r'SEO Title.*',
    r'Meta Description.*',
    r'Word Count.*',
    r'Target audience.*',
    r'Search Intent.*',
    r'Internal Linking Strategy.*',
    r'Regional Focus.*',
    r'Semantic Keywords.*',
    r'Content/Op.*',
    r'\*\*Primary Keyword.\*\*.*',
    r'\*\*Secondary Keywords.\*\*.*',
    r'\*\*Long-Tail Keywords.\*\*.*',
    r'\*\*Target Keyword.\*\*.*',
    r'\*\*SEO Title.\*\*.*',
    r'\*\*Meta Description.\*\*.*',
    r'\*\*Regional Focus.\*\*.*',
    r'\*\*Semantic Keywords.\*\*.*'
]

def clean_content(content):
    if not content:
        return content
    new_content = content
    for pattern in patterns:
        new_content = re.sub(pattern, '', new_content, flags=re.IGNORECASE)
    return new_content.strip()

def process_file(file_path):
    print(f"Checking {file_path}...")
    encodings = ['utf-8', 'utf-16-le', 'utf-16', 'latin-1', 'cp1252']
    
    content = None
    used_encoding = None
    
    for encoding in encodings:
        try:
            with open(file_path, 'r', encoding=encoding) as f:
                content = f.read()
                used_encoding = encoding
                break
        except Exception:
            continue
            
    if content is None:
        print(f"Could not read {file_path}")
        return

    if file_path.endswith('.json'):
        try:
            data = json.loads(content)
            changed = False
            
            def clean_recursive(obj):
                nonlocal changed
                if isinstance(obj, dict):
                    for k, v in obj.items():
                        if isinstance(v, str):
                            cleaned = clean_content(v)
                            if cleaned != v:
                                obj[k] = cleaned
                                changed = True
                        else:
                            clean_recursive(v)
                elif isinstance(obj, list):
                    for i in range(len(obj)):
                        if isinstance(obj[i], str):
                            cleaned = clean_content(obj[i])
                            if cleaned != obj[i]:
                                obj[i] = cleaned
                                changed = True
                        else:
                            clean_recursive(obj[i])
            
            clean_recursive(data)
            
            if changed:
                print(f"Cleaning {file_path}...")
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2)
        except Exception as e:
            print(f"Error processing JSON {file_path}: {e}")
    else:
        cleaned = clean_content(content)
        if cleaned != content:
            print(f"Cleaning {file_path}...")
            # Use utf-8 for writing if it was utf-16 to avoid issues with standard tools
            out_encoding = 'utf-8' if used_encoding.startswith('utf-16') else used_encoding
            with open(file_path, 'w', encoding=out_encoding) as f:
                f.write(cleaned)

def main():
    directory = r'c:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\scripts'
    for root, dirs, files in os.walk(directory):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        for file in files:
            if file.endswith(('.md', '.json')):
                process_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
