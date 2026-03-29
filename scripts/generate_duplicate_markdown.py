
import json
import os

def main():
    with open("uk_duplicate_report.json", "r") as f:
        data = json.load(f)

    summary = data["summary"]
    duplicates = data["duplicates"]

    md = []
    md.append("# UK Duplicate Listing Audit Report")
    md.append("")
    md.append("## 📊 Executive Summary")
    md.append("| Metric | Count |")
    md.append("| :--- | :--- |")
    md.append(f"| **Total UK Listings Scanned** | {summary['total_scanned']} |")
    md.append(f"| **Duplicate Groups (Business+Phone)** | {summary['duplicate_groups']} |")
    md.append(f"| **Total Redundant Entries** | {summary['total_duplicate_entries']} |")
    md.append("")
    
    md.append("## 🖇️ Detailed Duplicate Report")
    md.append("The following businesses appear multiple times across the UK system with the **same name and phone number**.")
    md.append("")
    
    for dup in duplicates:
        name = dup.get('name_normalized', 'Unknown')
        phone = dup.get('phone_normalized', 'Unknown')
        # Use first occurrence name for display if available, else normalized
        display_name = dup['occurrences'][0]['name'] if dup['occurrences'] else name
        display_phone = dup['occurrences'][0]['phone'] if dup['occurrences'] else phone
        
        md.append(f"### {display_name} ({display_phone})")
        md.append(f"**Occurrences: {dup['count']}**")
        
        md.append("| City | Trade |")
        md.append("| :--- | :--- |")
        for occ in dup['occurrences']:
            md.append(f"| {occ.get('city', 'N/A')} | {occ.get('trade', 'N/A')} |")
        
        md.append("")
        md.append("---")
        md.append("")

    # Write to file
    output_path = r"C:\Users\Nick\.gemini\antigravity\brain\953beebf-8805-4fa7-a46d-fff4ccb6b120\uk_duplicate_report.md"
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            f.write("\n".join(md))
        print(f"✅ Generated {output_path}")
    except Exception as e:
        print(f"Failed to write to brain dir: {e}")

if __name__ == "__main__":
    main()
