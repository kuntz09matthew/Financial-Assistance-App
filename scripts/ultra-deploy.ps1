# Ultra-Deploy Script for Financial Assistance App
# This script automates deployment: version bump, commit, push, and GitHub release.
# Usage: Run from project root in PowerShell: ./scripts/ultra-deploy.ps1

param(
    [string]$ReleaseType = "patch"  # Accepts: major, minor, patch
)

function Write-Log {
    param([string]$Message)
    Write-Host "[Ultra-Deploy] $Message"
}

# 1. Ensure git is clean
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Log "Uncommitted changes detected. Please commit or stash before deploying."
    exit 1
}

# 2. Bump version in package.json
Write-Log "Bumping version ($ReleaseType)..."
npm version $ReleaseType --no-git-tag-version

# 3. Get new version
$package = Get-Content package.json | ConvertFrom-Json
$newVersion = $package.version
Write-Log "New version: $newVersion"


# 4. Update CHANGELOG.md
$date = Get-Date -Format "yyyy-MM-dd"
$changelogEntry = "`n## [$newVersion] - $date`n- Automated ultra-deploy release`n"
Add-Content -Path CHANGELOG.md -Value $changelogEntry

# 5. Update VERSION.md
$versionContent = "# Version`n`nCurrent version: $newVersion`n`n- Released $date by ultra-deploy script`n"
Set-Content -Path VERSION.md -Value $versionContent

# 5. Commit changes
Write-Log "Committing changes..."
git add package.json CHANGELOG.md VERSION.md
$commitMsg = "Ultra-deploy: release v$newVersion"
git commit -m $commitMsg

# 6. Tag release
Write-Log "Tagging release..."
git tag v$newVersion

# 7. Push to GitHub
Write-Log "Pushing to GitHub..."
git push origin main --tags

# 8. Create GitHub release (requires gh CLI)
if (Get-Command gh -ErrorAction SilentlyContinue) {
    Write-Log "Creating GitHub release..."
    gh release create v$newVersion --title "Release v$newVersion" --notes "Automated ultra-deploy release."
} else {
    Write-Log "GitHub CLI (gh) not found. Skipping GitHub release creation."
}

Write-Log "Ultra-deploy complete!"
