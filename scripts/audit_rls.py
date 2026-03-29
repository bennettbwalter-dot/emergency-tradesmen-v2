import os
import re

def audit_migrations(migrations_dir):
    files = sorted([f for f in os.listdir(migrations_dir) if f.endswith('.sql')])
    all_tables = {} # table_name -> first_file_defined
    rls_enabled_tables = set()

    # Pattern for CREATE TABLE (handles quotes and schemas)
    create_table_pat = re.compile(r'CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(?:\"?public\"?\.?\"?)?\"?([a-zA-Z0-9_]+)\"?', re.IGNORECASE)
    # Pattern for ENABLE ROW LEVEL SECURITY
    rls_enable_pat = re.compile(r'ALTER TABLE\s+(?:\"?public\"?\.?\"?)?\"?([a-zA-Z0-9_]+)\"?\s+ENABLE ROW LEVEL SECURITY', re.IGNORECASE)

    for f in files:
        path = os.path.join(migrations_dir, f)
        with open(path, 'r', encoding='utf-8') as file:
            content = file.read()
            
            # Find all created tables
            found_tables = create_table_pat.findall(content)
            for t in found_tables:
                if t not in all_tables:
                    all_tables[t] = f
            
            # Find all RLS enabled tables
            enabled = rls_enable_pat.findall(content)
            for t in enabled:
                rls_enabled_tables.add(t)

    missing = [t for t in all_tables if t not in rls_enabled_tables]
    
    print("--- RLS Audit Results ---")
    if not missing:
        print("All tables defined in migrations have RLS enabled.")
    else:
        for t in missing:
            print(f"MISSING RLS: {t} (Defined in {all_tables[t]})")
    print("-------------------------")

if __name__ == "__main__":
    audit_migrations('supabase/migrations')
