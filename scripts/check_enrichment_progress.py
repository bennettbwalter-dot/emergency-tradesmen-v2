import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv(r'c:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\.env')

url = os.getenv("VITE_SUPABASE_URL")
key = os.getenv("VITE_SUPABASE_ANON_KEY")
sb = create_client(url, key)

total = sb.table('businesses').select('id', count='exact').eq('country_code', 'US').limit(1).execute().count
enriched = sb.table('businesses').select('id', count='exact').eq('country_code', 'US').gt('trust_score', 1).limit(1).execute().count
email_count = sb.table('businesses').select('id', count='exact').eq('country_code', 'US').not_.is_('email', 'null').neq('email', '').limit(1).execute().count
socials = sb.table('businesses').select('id', count='exact').eq('country_code', 'US').neq('social_links', '{}').limit(1).execute().count

print(f"TOTAL_US: {total}")
print(f"ENRICHED: {enriched}")
print(f"EMAILS: {email_count}")
print(f"SOCIALS: {socials}")
