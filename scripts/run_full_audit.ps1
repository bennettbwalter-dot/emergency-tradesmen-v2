# Emergency Tradesmen — Full Database Audit Automation Script
# This PowerShell script automates auditing all UK and US listings in configurable batches.
# It automatically resumes from where it left off, handles rate limits, and provides real-time progress.

$ErrorActionPreference = "Stop"

# Configurations
$BatchSize = 1000  # Listings per batch (highly recommended size)
$DelaySeconds = 2  # Pause between batches to cool down network/DNS

Write-Host "========================================================" -ForegroundColor Yellow
Write-Host "🚀 STARTING COMPREHENSIVE DATABASE AUDIT AUTOMATION" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Yellow
Write-Host "This script will audit all UK listings first, and then all USA listings."
Write-Host "It runs in optimized batches of $BatchSize to prevent database and network timeouts.`n"

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Error "❌ Error: .env file not found in the root folder. Please run this script from your project root."
    exit 1
}

# ---------------------------------------------------------------------------
# PHASE 1: UK AUDIT
# ---------------------------------------------------------------------------
Write-Host "--------------------------------------------------------" -ForegroundColor Cyan
Write-Host "🇬🇧 PHASE 1: Auditing all UK listings..." -ForegroundColor Cyan
Write-Host "--------------------------------------------------------"

$UKBatch = 1
$ProgressFile = "scripts/audit_progress.json"

# Remove progress file if it exists to start fresh for a new full audit
if (Test-Path $ProgressFile) {
    Remove-Item $ProgressFile -Force
}

while ($true) {
    Write-Host "`n📦 Processing UK Batch #$UKBatch (Limit: $BatchSize)..." -ForegroundColor Yellow
    
    # Run the audit script for GB region
    if ($UKBatch -eq 1) {
        # First batch does not use --resume
        node scripts/audit_listings.cjs --region=GB --limit=$BatchSize
    } else {
        # Subsequent batches use --resume to pick up from progress file
        node scripts/audit_listings.cjs --region=GB --limit=$BatchSize --resume
    }

    # Read progress output to check if we are finished
    # The node script outputs "No remaining listings to audit" when finished.
    # We check if there are listings loaded. If 0 loaded, we are done!
    # A simple way to check is if the progress file was deleted by the script.
    if (-not (Test-Path $ProgressFile)) {
        Write-Host "`n🎉 Phase 1 Complete! All UK listings have been fully audited." -ForegroundColor Green
        break
    }

    $UKBatch++
    Write-Host "⏳ Pausing for $DelaySeconds seconds to cool down..." -ForegroundColor Gray
    Start-Sleep -Seconds $DelaySeconds
}

# ---------------------------------------------------------------------------
# PHASE 2: USA AUDIT
# ---------------------------------------------------------------------------
Write-Host "`n--------------------------------------------------------" -ForegroundColor Cyan
Write-Host "🇺🇸 PHASE 2: Auditing all USA listings..." -ForegroundColor Cyan
Write-Host "--------------------------------------------------------"

$USBatch = 1

# Reset progress file for US side
if (Test-Path $ProgressFile) {
    Remove-Item $ProgressFile -Force
}

while ($true) {
    Write-Host "`n📦 Processing USA Batch #$USBatch (Limit: $BatchSize)..." -ForegroundColor Yellow
    
    # Run the audit script for US region
    if ($USBatch -eq 1) {
        node scripts/audit_listings.cjs --region=US --limit=$BatchSize
    } else {
        node scripts/audit_listings.cjs --region=US --limit=$BatchSize --resume
    }

    if (-not (Test-Path $ProgressFile)) {
        Write-Host "`n🎉 Phase 2 Complete! All USA listings have been fully audited." -ForegroundColor Green
        break
    }

    $USBatch++
    Write-Host "⏳ Pausing for $DelaySeconds seconds to cool down..." -ForegroundColor Gray
    Start-Sleep -Seconds $DelaySeconds
}

Write-Host "`n========================================================" -ForegroundColor Yellow
Write-Host "🏆 FULL DIRECTORY AUDIT SYSTEM COMPLETED SUCCESSFULLY!" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Yellow
