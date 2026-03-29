
import os

index_path = r"..\src\pages\Index.tsx"

with open(index_path, "r", encoding="utf-8") as f:
    index_content = f.read()

# 1. Remove backdrop-blur-sm and slightly relax negative margin to avoid overlap if it's too much
# Original: <div className="backdrop-blur-sm rounded-3xl overflow-hidden">
index_content = index_content.replace('backdrop-blur-sm rounded-3xl overflow-hidden', 'rounded-3xl overflow-hidden')

# 2. Relax the negative margin from -mt-24 to something that fits better without blurring text
# The tagline is usually around 20-30px high. -mt-24 might be covering it.
index_content = index_content.replace('-mt-24', '-mt-16')

with open(index_path, "w", encoding="utf-8") as f:
    f.write(index_content)

print("Blur removed and margin relaxed.")
