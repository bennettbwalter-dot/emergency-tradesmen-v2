$path = "src/lib/businesses.ts"
$lines = Get-Content $path
$count = $lines.Count
Write-Host "Total lines: $count"

# Ranges to DELETE (1-based lines):
# 15640 - 15705
# 16055 - 16177

# Indices to KEEP (0-based):
# 0 to 15638 (Keep up to line 15639)
# 15705 to 16053 (Keep from line 15706 to 16054)
# 16177 to end (Keep from line 16178 to end)

$part1 = $lines[0..15638]
$part2 = $lines[15705..16053]
$part3 = $lines[16177..($count-1)]

$newContent = $part1 + $part2 + $part3
$newContent | Set-Content $path -Encoding UTF8
Write-Host "New line count: $($newContent.Count)"
