# Creates the GitHub repo, pushes main, and enables Pages.
# Needs the GitHub CLI: winget install --id GitHub.cli -e

$ErrorActionPreference = 'Stop'

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Host 'GitHub CLI not found. Install it, then rerun this script:'
  Write-Host '  winget install --id GitHub.cli -e'
  exit 1
}

gh auth status | Out-Null
if ($LASTEXITCODE -ne 0) { gh auth login }

$user = gh api user --jq .login
gh repo create niosome-apothecary --public --source . --remote origin --push

$body = '{"source":{"branch":"main","path":"/"}}'
$body | gh api -X POST "repos/$user/niosome-apothecary/pages" --input - | Out-Null

Write-Host "Done. Live in a minute: https://$user.github.io/niosome-apothecary/"
