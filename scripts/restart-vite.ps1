# Restart Vite dev servers cleanly: kill any running vite, wipe cache, restart.
# Run with: powershell -NoProfile -File scripts/restart-vite.ps1
Get-Process -Name node -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -like '*vite*' } |
    ForEach-Object { Write-Output ("killing node PID " + $_.Id); Stop-Process -Id $_.Id -Force }
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue
Write-Output "vite cache cleared"
