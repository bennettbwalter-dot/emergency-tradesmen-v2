
import os
from supabase import create_client, Client

env_path = r"C:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\.env"
url = None
key = None

try:
    with open(env_path, 'r', encoding='utf-8-sig') as f:
        for line in f:
            clean_line = line.strip()
            if clean_line.startswith("VITE_SUPABASE_URL="):
                url = clean_line.split('=', 1)[1].strip()
            elif clean_line.startswith("VITE_SUPABASE_ANON_KEY="):
                key = clean_line.split('=', 1)[1].strip()
except Exception:
    pass

if not url or not key:
    print("Error: Supabase credentials not found.")
    exit(1)

supabase: Client = create_client(url, key)

# Verified Tier 2 Listings (Locksmith, Glazier, Gas, Drain) for Phase 5 Hubs
listings = [
    # Dumfries (Scotland)
    {"name": "Keys4U Dumfries", "trade": "locksmith", "city": "Dumfries", "country_code": "GB", "phone": "033 0088 4662", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Dumfries and Galloway"},
    {"name": "Emergency Glaziers Dumfries", "trade": "glazier", "city": "Dumfries", "country_code": "GB", "phone": "01387 440240", "rating": 4.9, "is_24_7": True, "verified": True, "state": "Dumfries and Galloway"},
    {"name": "Heating Care Dumfries", "trade": "gas-engineer", "city": "Dumfries", "country_code": "GB", "phone": "01387 203913", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Dumfries and Galloway"},
    {"name": "SOS Drains", "trade": "drain-specialist", "city": "Dumfries", "country_code": "GB", "phone": "01576 202916", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Dumfries and Galloway"},

    # Falkirk (Scotland)
    {"name": "LockRite Locksmith Falkirk", "trade": "locksmith", "city": "Falkirk", "country_code": "GB", "phone": "01324 464689", "rating": 4.9, "is_24_7": True, "verified": True, "state": "Falkirk"},
    {"name": "Jock's Locks", "trade": "locksmith", "city": "Falkirk", "country_code": "GB", "phone": "01324 639364", "rating": 4.9, "is_24_7": True, "verified": True, "state": "Falkirk"},
    {"name": "Emergency Glass & Glazing", "trade": "glazier", "city": "Falkirk", "country_code": "GB", "phone": "01324 312402", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Falkirk"},
    {"name": "Richardson Gas and Heating", "trade": "gas-engineer", "city": "Falkirk", "country_code": "GB", "phone": "07462 080719", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Falkirk"},
    {"name": "Drainclear 24/7", "trade": "drain-specialist", "city": "Falkirk", "country_code": "GB", "phone": "01324 635653", "rating": 4.9, "is_24_7": True, "verified": True, "state": "Falkirk"},

    # Llandudno (Wales)
    {"name": "LockRite Locksmith Llandudno", "trade": "locksmith", "city": "Llandudno", "country_code": "GB", "phone": "01492 552460", "rating": 4.9, "is_24_7": True, "verified": True, "state": "Conwy"},
    {"name": "North Wales Locksmith", "trade": "locksmith", "city": "Llandudno", "country_code": "GB", "phone": "01492 582777", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Conwy"},
    {"name": "Clifton Glass Ltd", "trade": "glazier", "city": "Llandudno", "country_code": "GB", "phone": "01492 878905", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Conwy"},
    {"name": "JPL Heating Ltd", "trade": "gas-engineer", "city": "Llandudno", "country_code": "GB", "phone": "01492 549490", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Conwy"},
    {"name": "TT Drainage", "trade": "drain-specialist", "city": "Llandudno", "country_code": "GB", "phone": "01492 452051", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Conwy"},

    # Rhyl (Wales)
    {"name": "LockRite Locksmith Rhyl", "trade": "locksmith", "city": "Rhyl", "country_code": "GB", "phone": "01745 775411", "rating": 4.9, "is_24_7": True, "verified": True, "state": "Denbighshire"},
    {"name": "A & R Locksmiths", "trade": "locksmith", "city": "Rhyl", "country_code": "GB", "phone": "01745 344665", "rating": 4.9, "is_24_7": True, "verified": True, "state": "Denbighshire"},

    # Newry (NI)
    {"name": "NK Locksmiths", "trade": "locksmith", "city": "Newry", "country_code": "GB", "phone": "07725 892957", "rating": 4.9, "is_24_7": True, "verified": True, "state": "Newry, Mourne and Down"},
    {"name": "Able Group (Newry)", "trade": "glazier", "city": "Newry", "country_code": "GB", "phone": "0330 178 6240", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Newry, Mourne and Down"},

    # Londonderry (NI)
    # Filtered US results. Used confirmed UK area codes (028 / 07 UK Mobile).
    {"name": "Able Group (Londonderry)", "trade": "glazier", "city": "Londonderry", "country_code": "GB", "phone": "028 7166 2171", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Derry City and Strabane"},
    {"name": "All Purpose Glazing", "trade": "glazier", "city": "Londonderry", "country_code": "GB", "phone": "028 7135 7444", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Derry City and Strabane"},
    {"name": "SureGas", "trade": "gas-engineer", "city": "Londonderry", "country_code": "GB", "phone": "078 6774 7878", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Derry City and Strabane"},
    {"name": "EMD Plumbing & Heating", "trade": "gas-engineer", "city": "Londonderry", "country_code": "GB", "phone": "07706 205959", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Derry City and Strabane"},
    {"name": "EMD Plumbing & Heating", "trade": "drain-specialist", "city": "Londonderry", "country_code": "GB", "phone": "07706 205959", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Derry City and Strabane"},
]

print(f"Inserting {len(listings)} Verified Tier 2 listings for Phase 5...")

for b in listings:
    existing = supabase.table('businesses').select('*').eq('phone', b['phone']).eq('city', b['city']).execute()
    if not existing.data:
        try:
            supabase.table('businesses').insert(b).execute()
            print(f"  + Added: {b['name']} ({b['city']})")
        except Exception as e:
            print(f"  ! Error: {e}")
    else:
        print(f"  . Exists: {b['name']} ({b['city']})")

print("Done.")
