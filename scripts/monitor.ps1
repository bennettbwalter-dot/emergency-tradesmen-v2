# Emergency Tradesmen Audit Real-Time Monitor
# Run this script in your PowerShell window to see a beautiful live progress counter!

$ProgressFile = "scripts/audit_progress.json"
$TotalUK = 28000
$TotalUS = 180000
$TotalListings = $TotalUK + $TotalUS

Clear-Host
$StartTime = Get-Date

while ($true) {
    if (-not (Test-Path $ProgressFile)) {
        Write-Host "--------------------------------------------------------" -ForegroundColor Gray
        Write-Host "[INFO] Waiting for audit progress file to be initialized..." -ForegroundColor Yellow
        Write-Host "--------------------------------------------------------"
        Start-Sleep -Seconds 2
        continue
    }

    try {
        $ProgressData = Get-Content $ProgressFile -Raw -ErrorAction SilentlyContinue | ConvertFrom-Json -ErrorAction SilentlyContinue
    } catch {
        # Catch JSON read/write collisions
        Start-Sleep -Milliseconds 200
        continue
    }

    if ($null -eq $ProgressData -or $null -eq $ProgressData.processedCount) {
        Start-Sleep -Milliseconds 200
        continue
    }

    $Processed = $ProgressData.processedCount
    $Percent = [Math]::Min(100, [Math]::Round(($Processed / $TotalListings) * 100, 2))
    
    # Calculate elapsed and ETA
    $Elapsed = (Get-Date) - $StartTime
    if ($Processed -gt 0) {
        $SecsPerItem = $Elapsed.TotalSeconds / $Processed
        $RemainingItems = $TotalListings - $Processed
        $ETASeconds = $RemainingItems * $SecsPerItem
        $ETA = [TimeSpan]::FromSeconds($ETASeconds)
    } else {
        $ETA = [TimeSpan]::Zero
    }

    # Build ASCII progress bar (30 characters wide) - Pure ASCII for safety
    $BarWidth = 30
    $FilledWidth = [Math]::Min($BarWidth, [Math]::Round(($Percent / 100) * $BarWidth))
    $EmptyWidth = $BarWidth - $FilledWidth
    $Bar = ("#" * $FilledWidth) + ("-" * $EmptyWidth)

    # Format elapsed and ETA times
    $ElapsedStr = "{0:d2}:{1:d2}:{2:d2}" -f $Elapsed.Hours, $Elapsed.Minutes, $Elapsed.Seconds
    $ETAStr = "{0:d2}:{1:d2}:{2:d2}" -f $ETA.Hours, $ETA.Minutes, $ETA.Seconds

    # Print dashboard
    Clear-Host
    Write-Host "========================================================" -ForegroundColor Yellow
    Write-Host "  EMERGENCY TRADESMEN AUDIT LIVE MONITOR" -ForegroundColor Yellow
    Write-Host "========================================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  TOTAL DIRECTORY SUMMARY" -ForegroundColor Cyan
    Write-Host "   UK Listings:      28,000"
    Write-Host "   USA Listings:     180,000"
    Write-Host "   Grand Total:      208,000"
    Write-Host ""
    Write-Host "  AUDIT PROGRESS" -ForegroundColor Cyan
    Write-Host "   [$Bar] $Percent%" -ForegroundColor Green
    Write-Host "   Processed:        $($Processed.ToString("N0")) / $($TotalListings.ToString("N0"))"
    Write-Host "   Remaining:        $((($TotalListings - $Processed)).ToString("N0"))"
    Write-Host ""
    Write-Host "  TIME METRICS" -ForegroundColor Cyan
    Write-Host "   Elapsed Time:     $ElapsedStr"
    Write-Host "   Est. Time Left:   $ETAStr"
    Write-Host "   Processing Speed: $([Math]::Round(1 / $SecsPerItem, 2)) listings/sec"
    Write-Host ""
    Write-Host "========================================================" -ForegroundColor Yellow
    Write-Host "  [!] Press Ctrl+C at any time to exit the monitor." -ForegroundColor Gray
    Write-Host "  (The audit will continue running safely in the background)" -ForegroundColor Gray

    Start-Sleep -Seconds 2
}
