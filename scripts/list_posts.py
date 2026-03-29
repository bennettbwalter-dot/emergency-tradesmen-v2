import json
import sys

try:
    with open(r'c:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\scripts\all_posts.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        for post in data:
            print(f"{post.get('slug')}\t{post.get('title')}")
except Exception as e:
    print(f"Error: {e}")
