
import json
import os

def main():
    with open("uk_audit_report.json", "r") as f:
        data = json.load(f)

    summary = data["summary"]
    gaps = data["gaps"]
    unknowns = data["unknown_locations_in_db"]

    # Group gaps by city for better readability
    city_gaps = {}
    for gap in gaps:
        city = gap["city"]
        if city not in city_gaps:
            city_gaps[city] = []
        city_gaps[city].append(gap)

    # Sort cities alphabetically
    sorted_cities = sorted(city_gaps.keys())

    md = []
    md.append("# UK Listing Coverage Audit Report")
    md.append("")
    md.append("## 📊 Executive Summary")
    md.append("| Metric | Count |")
    md.append("| :--- | :--- |")
    md.append(f"| **Total UK Listings** | {summary['total_listings']} |")
    md.append(f"| **Total Landing Pages** | {summary['total_landing_pages']} |")
    md.append(f"| **Complete Pages (>5 listings)** | {summary['complete_pages']} |")
    md.append(f"| **Incomplete Pages (<5 listings)** | {summary['incomplete_pages']} |")
    md.append("")
    
    md.append("## 🚨 Gap Report")
    md.append("The following cities have landing pages with fewer than 5 listings.")
    md.append("")
    
    for city in sorted_cities:
        city_items = city_gaps[city]
        md.append(f"### {city}")
        md.append("| Trade | Current | Needed |")
        md.append("| :--- | :--- | :--- |")
        for item in city_items:
            md.append(f"| {item['trade']} | {item['current']} | {item['needed']} |")
        md.append("")

    md.append("## 📍 Potential Missing Landing Pages")
    md.append("The following locations were found in the database but are NOT in the current landing page list. Review these for potential new pages.")
    md.append("")
    
    # Sort unknowns
    sorted_unknowns = sorted(unknowns, key=str.lower)
    
    # organize into columns or list? List is fine.
    for loc in sorted_unknowns:
        md.append(f"- {loc}")
        
    md.append("")
    
    # Write to file
    output_path = r"C:\Users\Nick\.gemini\antigravity\brain\953beebf-8805-4fa7-a46d-fff4ccb6b120\uk_gap_report.md"
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            f.write("\n".join(md))
        print(f"✅ Generated {output_path}")
    except Exception as e:
        # Fallback to local if brain dir not accessible (or just print locally)
        print(f"Failed to write to brain dir: {e}")
        with open("uk_gap_report.md", "w", encoding="utf-8") as f:
            f.write("\n".join(md))
        print("Generated local uk_gap_report.md")

if __name__ == "__main__":
    main()
