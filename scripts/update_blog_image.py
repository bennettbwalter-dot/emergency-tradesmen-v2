import requests
import json

# Supabase Configuration
url = "https://xwqvhymkwuasotsgmarn.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cXZoeW1rd3Vhc290c2dtYXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5MDM0MywiZXhwIjoyMDgxNTY2MzQzfQ.ZJQXY5OzkfO4Ey2G5enTdPHx_shgDMGAUaTJAHKDKus"

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

# Update Data
slug = "gutters-overflowing-spring-rain-gb"
data = {
    "cover_image": "/images/blog/gutters-overflowing.webp"
}

# Update in Supabase
response = requests.patch(f"{url}/rest/v1/posts?slug=eq.{slug}", headers=headers, data=json.dumps(data))

if response.status_code in [200, 204]:
    print(f"Successfully updated hero image for: {slug}")
else:
    print(f"Failed to update {slug}: {response.text}")
