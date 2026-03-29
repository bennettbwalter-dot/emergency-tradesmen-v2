# Quick Backup Script for Emergency Tradesmen
# Run this anytime to create a fresh backup

$timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$desktopPath = [Environment]::GetFolderPath("Desktop")
$projectPath = "C:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host " Emergency Tradesmen - Quick Backup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Create folder backup
Write-Host "[1/2] Creating full project backup..." -ForegroundColor Yellow
$backupFolder = "$desktopPath\emergency-tradesmen-backup-$timestamp"
Copy-Item -Path "$projectPath\*" -Destination $backupFolder -Recurse -Force -Exclude @("node_modules", ".next", "dist", "build", ".git")
Write-Host "✓ Folder backup created: emergency-tradesmen-backup-$timestamp" -ForegroundColor Green

# Create git bundle
Write-Host "[2/2] Creating git bundle..." -ForegroundColor Yellow
Push-Location $projectPath
git bundle create "$desktopPath\emergency-tradesmen-git-bundle-$timestamp.bundle" --all
Pop-Location
Write-Host "✓ Git bundle created: emergency-tradesmen-git-bundle-$timestamp.bundle" -ForegroundColor Green

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host " Backup Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backups saved to Desktop:" -ForegroundColor White
Write-Host "  📁 $backupFolder" -ForegroundColor Gray
Write-Host "  📦 emergency-tradesmen-git-bundle-$timestamp.bundle" -ForegroundColor Gray
Write-Host ""

# Show total backup size
$folderSize = (Get-ChildItem $backupFolder -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
$bundleSize = (Get-Item "$desktopPath\emergency-tradesmen-git-bundle-$timestamp.bundle").Length / 1MB
Write-Host "Total backup size: $([math]::Round($folderSize + $bundleSize, 2)) MB" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor DarkGray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
