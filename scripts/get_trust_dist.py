import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv(r'c:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\.env')

url = os.getenv("VITE_SUPABASE_URL")
key = os.getenv("VITE_SUPABASE_ANON_KEY")
sb = create_client(url, key)

print("Fetching Trust Score Distribution (US)...")
dist = {}
for i in range(1, 6):
    count = sb.table('businesses').select('id', count='exact').eq('country_code', 'US').eq('trust_score', i).limit(1).execute().count
    dist[i] = count

none_count = sb.table('businesses').select('id', count='exact').eq('country_code', 'US').is_('trust_score', 'null').limit(1).execute().count

print(f"1/5: {dist[1]}")
print(f"2/5: {dist[2]}")
print(f"3/5: {dist[3]}")
print(f"4/5: {dist[4]}")
print(f"5/5: {dist[5]}")
print(f"Not Scored (NULL): {none_count}")
