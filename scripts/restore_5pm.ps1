
# Map backups to target paths
$mapping = @{
    "contact_page.txt"          = "src\pages\ContactPage.tsx"
    "business_profile_page.txt" = "src\pages\BusinessProfilePage.tsx"
    "business_card.txt"         = "src\components\BusinessCard.tsx"
    "businesses_lib.txt"        = "src\lib\businesses.ts"
    "db_lib.txt"                = "src\lib\db.ts"
    "quote_modal.txt"           = "src\components\QuoteRequestModal.tsx"
    "booking_modal.txt"         = "src\components\BookingModal.tsx"
    "email_util.txt"            = "src\lib\email.ts"
    "quotes_lib.txt"            = "src\lib\quotes.ts"
    "bookings_lib.txt"          = "src\lib\bookings.ts"
    "send_email_fn.txt"         = "supabase\functions\send-email\index.ts"
    "app_tsx.txt"               = "src\App.tsx"
}

foreach ($backup in $mapping.Keys) {
    $target = $mapping[$backup]
    $backupPath = $backup # Files are in current directory
    $targetPath = Join-Path ".." $target
    
    if (Test-Path $targetPath) {
        Copy-Item -Path $backupPath -Destination $targetPath -Force
        Write-Host "Restored $target from $backup"
    }
    else {
        Write-Host "WARNING: Target $targetPath not found (creating it)"
        Copy-Item -Path $backupPath -Destination $targetPath -Force
    }
}

# Re-apply Chatbot Fix (LiveChat wrapper + Provider injection)
# Because strict 5pm restore breaks the app (missing provider)

$appPath = "..\src\App.tsx"
$liveChatPath = "..\src\components\LiveChat.tsx"

# 1. Update LiveChat.tsx
$liveChatContent = @"
import { EmergencyChatInterface } from "./EmergencyChatInterface";

export function LiveChat() {
  return <EmergencyChatInterface />;
}
"@
Set-Content -Path $liveChatPath -Value $liveChatContent
Write-Host "Fixed LiveChat.tsx"

# 2. Inject ChatbotProvider into App.tsx
$appContent = Get-Content -Path $appPath -Raw
if (-not ($appContent -match "ChatbotProvider")) {
    $appContent = $appContent -replace 'import { ComparisonProvider } from "@/contexts/ComparisonContext";', 'import { ComparisonProvider } from "@/contexts/ComparisonContext";
import { ChatbotProvider } from "@/contexts/ChatbotContext";'
    
    $appContent = $appContent -replace '<ComparisonProvider>', '<ChatbotProvider>
                <ComparisonProvider>'
    $appContent = $appContent -replace '</ComparisonProvider>', '</ComparisonProvider>
              </ChatbotProvider>'
    
    Set-Content -Path $appPath -Value $appContent
    Write-Host "Injected ChatbotProvider into App.tsx"
}
