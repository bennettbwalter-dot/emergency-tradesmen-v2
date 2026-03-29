
$path = "..\src\App.tsx"
$content = Get-Content $path -Raw

# Replace 1
$bad1 = 'import { ComparisonProvider } from "@/contexts/ComparisonContext";`nimport { ChatbotProvider } from "@/contexts/ChatbotContext";'
$good1 = 'import { ComparisonProvider } from "@/contexts/ComparisonContext";
import { ChatbotProvider } from "@/contexts/ChatbotContext";'
$content = $content.Replace($bad1, $good1)

# Replace 2
$bad2 = '<ChatbotProvider>`n                <ComparisonProvider>'
$good2 = '<ChatbotProvider>
                <ComparisonProvider>'
$content = $content.Replace($bad2, $good2)

# Replace 3
$bad3 = '</ComparisonProvider>`n              </ChatbotProvider>'
$good3 = '</ComparisonProvider>
              </ChatbotProvider>'
$content = $content.Replace($bad3, $good3)

Set-Content -Path $path -Value $content
Write-Host "Fixed syntax errors in App.tsx"
