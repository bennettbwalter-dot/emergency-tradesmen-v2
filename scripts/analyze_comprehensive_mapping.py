
import json
import os
import re

def analyze():
    with open('all_posts_audit.json', 'r', encoding='utf-8') as f:
        posts = json.load(f)
    
    try:
        with open('clean_image_list.txt', 'r', encoding='utf-16') as f:
            images = [line.strip() for line in f if line.strip()]
    except:
        with open('clean_image_list.txt', 'r', encoding='utf-8', errors='ignore') as f:
            images = [line.strip() for line in f if line.strip()]
    
    base_dir = r"C:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\public"
    web_images = [img.replace(base_dir, '').replace('\\', '/') for img in images]
    
    img_by_folder = {}
    for img in web_images:
        folder = img.split('/')[2] if len(img.split('/')) > 2 else 'root'
        if folder not in img_by_folder:
            img_by_folder[folder] = []
        img_by_folder[folder].append(img)
    
    needs_update = []
    for post in posts:
        content = post.get('content', '')
        # Count images in content (HTML and Markdown)
        img_tags = len(re.findall(r'<img', content))
        md_images = len(re.findall(r'!\[.*?\]\(.*?\)', content))
        total_content_images = img_tags + md_images
        
        if total_content_images < 2:
            needs_update.append(post)
            
    print(f"Total Posts Needing Visual Enrichment: {len(needs_update)}")
    
    results = []
    for post in needs_update:
        slug = post['slug']
        title = post['title']
        cover = post['cover_image']
        content = post['content']
        
        # Determine category for mapping
        slug_lower = slug.lower()
        title_lower = title.lower()
        
        if 'roof' in slug_lower or 'roof' in title_lower:
            folder_keys = ['roof', 'water-leak', 'water']
        elif 'plumber' in slug_lower or 'leak' in slug_lower or 'drain' in slug_lower or 'sewage' in slug_lower or 'plumbing' in title_lower or 'flood' in slug_lower or 'water' in slug_lower:
            folder_keys = ['plum', 'water-leak', 'water']
        elif 'electrical' in slug_lower or 'electricity' in slug_lower or 'electrician' in title_lower:
            folder_keys = ['elect', 'emergency-at-home']
        elif 'locksmith' in slug_lower or 'locked' in slug_lower or 'lock' in title_lower:
            folder_keys = ['lock', 'emergency-locksmith']
        elif 'gas' in slug_lower or 'carbon' in slug_lower:
            folder_keys = ['gas', 'emergency']
        elif 'boiler' in slug_lower or 'furnace' in slug_lower:
            folder_keys = ['boiler', 'hvac']
        elif 'boarding' in slug_lower or 'window' in slug_lower or 'glass' in title_lower:
            folder_keys = ['windows', 'structure']
        elif 'car' in slug_lower or 'auto' in slug_lower or 'recovery' in title_lower:
            folder_keys = ['auto', 'emergency-at-home']
        elif 'structural' in slug_lower or 'cracks' in slug_lower or 'engineer' in title_lower:
            folder_keys = ['structure', 'water-leak']
        elif 'ac' in slug_lower:
            folder_keys = ['hvac', 'electrical']
        else:
            folder_keys = ['emergency', 'home-emergency', 'emergency-at-home']
            
        candidates = []
        for fk in folder_keys:
            for f in img_by_folder:
                if fk in f:
                    candidates.extend([img for img in img_by_folder[f] if img != cover and img not in candidates])
        
        if len(candidates) < 2:
            general = img_by_folder.get('emergency', []) + img_by_folder.get('home-emergency', []) + img_by_folder.get('emergency-at-home', [])
            candidates.extend([img for img in general if img != cover and img not in candidates])
            
        assigned = candidates[:2]
            
        results.append({
            "slug": slug,
            "title": title,
            "keys": folder_keys,
            "cover": cover,
            "images": assigned
        })

    with open('comprehensive_image_mapping.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2)
    
    print(f"\nFinal mapping complete for {len(results)} posts. Output to comprehensive_image_mapping.json")
    for r in results:
        print(f"  - {r['slug']} ({r['title']})")

analyze()
