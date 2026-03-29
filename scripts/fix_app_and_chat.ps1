
$appPath = "..\src\App.tsx"
$liveChatPath = "..\src\components\LiveChat.tsx"

# 1. Update LiveChat.tsx to wrap EmergencyChatInterface
$liveChatContent = @"
import { EmergencyChatInterface } from "./EmergencyChatInterface";

export function LiveChat() {
  return <EmergencyChatInterface />;
}
"@
Set-Content -Path $liveChatPath -Value $liveChatContent

# 2. Update App.tsx to include ChatbotProvider
$appContent = Get-Content -Path $appPath -Raw

# Add import if missing
if (-not ($appContent -match "ChatbotProvider")) {
    $appContent = $appContent -replace 'import { ComparisonProvider } from "@/contexts/ComparisonContext";', 'import { ComparisonProvider } from "@/contexts/ComparisonContext";
import { ChatbotProvider } from "@/contexts/ChatbotContext";'
}

# Add Provider check (avoid double wrapping)
if (-not ($appContent -match "<ChatbotProvider>")) {
    $appContent = $appContent -replace '<ComparisonProvider>', '<ChatbotProvider>
                <ComparisonProvider>'
    $appContent = $appContent -replace '</ComparisonProvider>', '</ComparisonProvider>
              </ChatbotProvider>'
}

Set-Content -Path $appPath -Value $appContent
Write-Host "App and LiveChat updated successfully"
