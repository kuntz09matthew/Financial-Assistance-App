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


# 1. Detect and commit all changes since last release
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Log "Uncommitted changes detected. Staging and committing all changes..."
    git add -A
    $autoCommitMsg = "Auto-commit: changes before ultra-deploy v$((Get-Content package.json | ConvertFrom-Json).version)"
    git commit -m $autoCommitMsg
    Write-Log "Committed all changes."
} else {
    Write-Log "No uncommitted changes detected."
}

# 2. Bump version in package.json
Write-Log "Bumping version ($ReleaseType)..."
npm version $ReleaseType --no-git-tag-version

# 2.5. Rebuild native modules and build renderer
Write-Log "Running electron-rebuild to ensure native modules are compatible..."
npx electron-rebuild
Write-Log "Building renderer..."
npm run build

# 3. Get new version
$package = Get-Content package.json | ConvertFrom-Json
$newVersion = $package.version
Write-Log "New version: $newVersion"


# 4. Update CHANGELOG.md
$date = Get-Date -Format "yyyy-MM-dd"

# Get last tag (previous release)
$lastTag = git describe --tags --abbrev=0 2>$null
if (-not $lastTag) {
    $lastTag = ""
}

# Get commit messages since last tag
if ($lastTag -ne "") {
    $commitMessages = git log $lastTag..HEAD --pretty=format:"- %s"
} else {
    $commitMessages = git log --pretty=format:"- %s"
}

if (-not $commitMessages) {
    $commitMessages = "- No changes found."
}

# Prepare changelog entry
$changelogEntry = "`n## [$newVersion] - $date`n$commitMessages`n"
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
    gh release create v$newVersion --title "Release v$newVersion" --notes "$commitMessages"

    # Upload update files to the release
    $distPath = Join-Path $PSScriptRoot "..\dist"
    $latestYml = Join-Path $distPath "latest.yml"
    $exe = Get-ChildItem -Path $distPath -Filter "*.exe" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    $blockmap = Get-ChildItem -Path $distPath -Filter "*.blockmap" | Sort-Object LastWriteTime -Descending | Select-Object -First 1

    if (Test-Path $latestYml) {
        Write-Log "Uploading latest.yml to GitHub release..."
        gh release upload v$newVersion $latestYml --clobber
    } else {
        Write-Log "latest.yml not found, skipping upload."
    }
    if ($exe) {
        Write-Log "Uploading $($exe.Name) to GitHub release..."
        gh release upload v$newVersion $($exe.FullName) --clobber
    } else {
        Write-Log ".exe file not found, skipping upload."
    }
    if ($blockmap) {
        Write-Log "Uploading $($blockmap.Name) to GitHub release..."
        gh release upload v$newVersion $($blockmap.FullName) --clobber
    } else {
        Write-Log ".blockmap file not found, skipping upload."
    }
} else {
    Write-Log "GitHub CLI (gh) not found. Skipping GitHub release creation."
}

Write-Log "Ultra-deploy complete!"
