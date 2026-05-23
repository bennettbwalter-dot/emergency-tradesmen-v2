
# ═══════════════════════════════════════════════════════════════════════════
#  fix_todays_blogs.ps1
#  Run from your own PowerShell (NOT Antigravity terminal):
#    cd "C:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen"
#    .\fix_todays_blogs.ps1
# ═══════════════════════════════════════════════════════════════════════════

Write-Host "`n🚀 Fixing today's blogs..." -ForegroundColor Cyan

# ── CONFIG ───────────────────────────────────────────────────────────────────
$projectRoot = "C:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen"
$supabaseUrl = "https://xwqvhymkwuasotsgmarn.supabase.co"
$supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cXZoeW1rd3Vhc290c2dtYXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5OTAzNDMsImV4cCI6MjA4MTU2NjM0M30.nHErFkf6SIMzj-b_bwWBlHL4NmQ288rQUZLCIg6jH5Y"

$headers = @{
    "apikey"        = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
    "Content-Type"  = "application/json"
    "Prefer"        = "resolution=merge-duplicates,return=representation"
}

# ── STEP 1: COPY HERO IMAGES ─────────────────────────────────────────────────
Write-Host "`n📸 Step 1: Copying hero images..." -ForegroundColor Yellow

$imgDest = "$projectRoot\public\images\blog"
New-Item -ItemType Directory -Force -Path $imgDest | Out-Null

$images = @(
    @{
        Src  = "C:\Users\Nick\OneDrive\my App\AC Leaking Water Through the Ceiling.png"
        Dest = "$imgDest\us-ac-leaking-ceiling-hero.png"
        Name = "US AC Leaking hero"
    },
    @{
        Src  = "C:\Users\Nick\OneDrive\my App\Outside Tap Leaking or Burst After Winter.png"
        Dest = "$imgDest\uk-outside-tap-leaking-hero.png"
        Name = "UK Outside Tap hero"
    }
)

foreach ($img in $images) {
    try {
        Copy-Item -Path $img.Src -Destination $img.Dest -Force -ErrorAction Stop
        $size = [math]::Round((Get-Item $img.Dest).Length / 1KB)
        Write-Host "  ✅ $($img.Name) copied (${size}KB)" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ $($img.Name) failed: $_" -ForegroundColor Red
    }
}

# ── STEP 2: READ BLOG CONTENT ────────────────────────────────────────────────
Write-Host "`n📄 Step 2: Reading blog files..." -ForegroundColor Yellow

$usFile = "$projectRoot\optimized-blogs\usa-emergencycontractors\ac-leaking-water-ceiling-safe-steps-us.md"
$ukFile = "$projectRoot\optimized-blogs\uk-emergencytradesmen\outside-tap-leaking-burst-winter-gb.md"

$usContent = Get-Content $usFile -Raw -Encoding UTF8
$ukContent = Get-Content $ukFile -Raw -Encoding UTF8
Write-Host "  ✅ US blog read ($([math]::Round($usContent.Length/1KB))KB)" -ForegroundColor Green
Write-Host "  ✅ UK blog read ($([math]::Round($ukContent.Length/1KB))KB)" -ForegroundColor Green

# ── STEP 3: INSERT INTO SUPABASE ─────────────────────────────────────────────
Write-Host "`n🗄️  Step 3: Inserting into Supabase..." -ForegroundColor Yellow

$now = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")

$posts = @(
    @{
        title        = "AC Leaking Water Through the Ceiling? Safe Steps Before Calling a 24/7 HVAC Technician"
        slug         = "ac-leaking-water-ceiling-safe-steps-us"
        content      = $usContent
        excerpt      = "AC dripping through your ceiling? Follow this step-by-step guide to safely shut down your system, drain a ceiling drywall blister, clear a clogged PVC condensate line with a Shop-Vac, and decide whether to repair or replace your unit."
        cover_image  = "/images/blog/us-ac-leaking-ceiling-hero.png"
        published    = $true
        published_at = $now
        label        = "US"
        url          = "http://localhost:3001/blog/ac-leaking-water-ceiling-safe-steps-us"
    },
    @{
        title        = "Outside Tap Leaking or Burst After Winter? Quick Fixes Before Calling an Emergency Plumber"
        slug         = "outside-tap-leaking-burst-winter-gb"
        content      = $ukContent
        excerpt      = "Your outside tap split over winter? Follow this UK step-by-step guide to isolate the water, replace a perished washer or burst bib tap, check for cavity wall leaks, and prevent future frost damage."
        cover_image  = "/images/blog/uk-outside-tap-leaking-hero.png"
        published    = $true
        published_at = $now
        label        = "UK"
        url          = "http://localhost:3000/blog/outside-tap-leaking-burst-winter-gb"
    }
)

foreach ($post in $posts) {
    $label = $post.label
    $url   = $post.url
    $post.Remove("label")
    $post.Remove("url")

    try {
        $body = $post | ConvertTo-Json -Depth 5 -Compress
        $resp = Invoke-RestMethod `
            -Uri "$supabaseUrl/rest/v1/posts" `
            -Method POST `
            -Headers $headers `
            -Body $body `
            -ContentType "application/json" `
            -ErrorAction Stop

        Write-Host "  ✅ $label blog inserted: $($resp[0].slug)" -ForegroundColor Green
        Write-Host "     👉 View at: $url" -ForegroundColor DarkCyan
    } catch {
        Write-Host "  ❌ $label blog failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n✨ Done! Refresh your browser and the blogs should be live." -ForegroundColor Cyan
Write-Host "   🇺🇸 http://localhost:3001/blog/ac-leaking-water-ceiling-safe-steps-us"
Write-Host "   🇬🇧 http://localhost:3000/blog/outside-tap-leaking-burst-winter-gb`n"
