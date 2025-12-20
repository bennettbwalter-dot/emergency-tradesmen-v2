import os

def read_file_clean(rel_path):
    abs_path = os.path.abspath(os.path.join('..', rel_path))
    if not os.path.exists(abs_path):
        print(f"File not found: {abs_path}")
        return
    
    print(f"--- Reading {rel_path} ---")
    with open(abs_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        for i, line in enumerate(lines):
            # Print with line numbers and avoid terminal mangling as much as possible
            print(f"{i+1:3}: {line.rstrip()}")
    print(f"--- End of {rel_path} ---")

read_file_clean('src/lib/businessService.ts')
