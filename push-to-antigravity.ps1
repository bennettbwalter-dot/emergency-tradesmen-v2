$ErrorActionPreference = "Stop"

$branch = git branch --show-current
if (-not $branch) {
  throw "Could not detect the current Git branch."
}

git status --short
git add -A
git commit -m "Update site from Codex" 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "No new commit was created. Pushing current branch anyway..."
}
git push origin $branch

Write-Host ""
Write-Host "Pushed $branch to GitHub for Antigravity."
