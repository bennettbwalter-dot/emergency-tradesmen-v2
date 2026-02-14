import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
sb = create_client(os.environ['VITE_SUPABASE_URL'], os.environ['VITE_SUPABASE_ANON_KEY'])

# Top 25 US metros by population
TOP_METROS = [
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
    'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
    'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte',
    'Indianapolis', 'San Francisco', 'Seattle', 'Denver', 'Boston',
    'Nashville', 'Detroit', 'Portland', 'Las Vegas', 'Miami'
]

print('🏙️ TOP 25 US METRO COVERAGE ANALYSIS')
print('=' * 50)

covered = 0
for city in TOP_METROS:
    res = sb.table('businesses').select('id', count='exact').eq('country_code', 'US').ilike('city', f'%{city}%').execute()
    count = res.count or 0
    if count >= 5:
        status = '✅'
        covered += 1
    elif count > 0:
        status = '⚠️'
    else:
        status = '❌'
    print(f'{status} {city}: {count} listings')

print('=' * 50)
print(f'Coverage: {covered}/25 metros with 5+ listings ({int(covered/25*100)}%)')
