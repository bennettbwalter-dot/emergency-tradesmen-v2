import json
import os

BACKUP_FILE = 'scraped_data_backup.jsonl'
OUTPUT_FILE = 'src/data/fallback_enrichment.json'
TS_FILE = 'src/data/fallback_enrichment.ts'

if not os.path.exists('src/data'):
    os.makedirs('src/data')

print(f"Converting {BACKUP_FILE} to {OUTPUT_FILE}...")

enrichment_map = {}

if os.path.exists(BACKUP_FILE):
    with open(BACKUP_FILE, 'r') as f:
        for line in f:
            try:
                record = json.loads(line)
                biz_id = record.get('id')
                updates = record.get('updates')
                if biz_id and updates and 'social_links' in updates:
                     # Only keep non-empty social links
                     links = updates['social_links']
                     if any(links.values()):
                         enrichment_map[biz_id] = links
            except:
                pass

print(f"Found {len(enrichment_map)} enriched records with valid links.")

# Write to JSON file
with open(OUTPUT_FILE, 'w') as f:
    json.dump(enrichment_map, f, indent=2)

# Also write as a TS export for easy import
with open(TS_FILE, 'w') as f:
    f.write(f"export const fallbackEnrichment: Record<string, any> = {json.dumps(enrichment_map, indent=2)};")

print("Conversion complete.")
