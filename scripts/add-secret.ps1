param(
    [string]$KeyName
)

# Initialize Visual Basic interaction for InputBox
Add-Type -AssemblyName Microsoft.VisualBasic

# 1. Ask for Key Name if not provided
if (-not $KeyName) {
    $KeyName = [Microsoft.VisualBasic.Interaction]::InputBox("Enter the name of the Environment Variable (e.g. OPENAI_API_KEY)", "Add Secret - Step 1/2")
}

if (-not $KeyName) { Write-Host "Operation Cancelled"; exit }

# 2. Ask for Value
$KeyValue = [Microsoft.VisualBasic.Interaction]::InputBox("Enter the value for $KeyName", "Add Secret - Step 2/2 for $KeyName")

if (-not $KeyValue) { Write-Host "Operation Cancelled"; exit }

# 3. Locate .env file
$envPath = Join-Path $PSScriptRoot "..\.env"
if (-not (Test-Path $envPath)) {
    New-Item $envPath -Type File | Out-Null
    Write-Host "Created new .env file."
}

# 4. Read and Update
$content = Get-Content $envPath
$pattern = "^$KeyName\s*="
$match = $content | Select-String -Pattern $pattern

if ($match) {
    # Replace existing line
    $content = $content | ForEach-Object {
        if ($_ -match $pattern) {
            "$KeyName=$KeyValue"
        } else {
            $_
        }
    }
    Write-Host "Updated existing '$KeyName' in .env"
} else {
    # Append to end
    $content += "$KeyName=$KeyValue"
    Write-Host "Added '$KeyName' to .env"
}

# 5. Save safely
$content | Set-Content $envPath -Encoding UTF8
Write-Host "Successfully saved to .env"
