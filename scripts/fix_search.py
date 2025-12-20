
import os

search_form_path = r"..\src\components\SearchForm.tsx"

with open(search_form_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

# We want to keep lines up to 120 (which is the closing </div> of the main container)
# and then add the closing ); and }
fixed_lines = lines[:120]
fixed_lines.append("  );\n")
fixed_lines.append("}\n")

with open(search_form_path, "w", encoding="utf-8") as f:
    f.writelines(fixed_lines)

print("SearchForm fixed.")
