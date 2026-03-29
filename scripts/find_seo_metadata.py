import os

search_string = "Primary Keyword"
directory = r"c:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\scripts"
encodings = ['utf-8', 'utf-16', 'latin-1', 'cp1252']

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith(('.json', '.md', '.js', '.ts', '.txt')):
            file_path = os.path.join(root, file)
            for encoding in encodings:
                try:
                    with open(file_path, 'r', encoding=encoding) as f:
                        content = f.read()
                        if search_string in content:
                            print(f"FOUND in {file_path} (encoding: {encoding})")
                            # Print context
                            index = content.find(search_string)
                            start = max(0, index - 50)
                            end = min(len(content), index + 100)
                            print(f"Context: {content[start:end]!r}")
                            break
                except Exception:
                    continue
