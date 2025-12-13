# Ultra-Deploy Script for Financial Assistance App
# This script automates deployment: version bump, commit, push, and GitHub release.
# Usage: Run from project root in PowerShell: ./scripts/ultra-deploy.ps1



function Write-Log {
    param([string]$Message)
    Write-Host "[Ultra-Deploy] $Message"
}




# 1. Detect and commit all changes since last release
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Log "Uncommitted changes detected. Staging and committing all changes..."
    git add -A
    # Determine auto-commit type for Conventional Commits
    $featureFiles = @('main/', 'renderer/', 'components/', 'assets/', 'docs/', 'scripts/', 'package.json', 'webpack.config.js')
    $bugfixFiles = @('fix', 'bug', 'hotfix')
    $changedFiles = git diff --cached --name-only
    $isFeature = $false
    $isFix = $false
    foreach ($file in $changedFiles) {
        foreach ($pattern in $featureFiles) {
            if ($file -like "*$pattern*") { $isFeature = $true }
        }
        foreach ($pattern in $bugfixFiles) {
            if ($file -like "*$pattern*") { $isFix = $true }
        }
    }
    if ($isFeature) {
        $autoCommitMsg = "feat: auto-commit changes before ultra-deploy v$((Get-Content package.json | ConvertFrom-Json).version)"
    } elseif ($isFix) {
        $autoCommitMsg = "fix: auto-commit changes before ultra-deploy v$((Get-Content package.json | ConvertFrom-Json).version)"
    } else {
        $autoCommitMsg = "chore: auto-commit changes before ultra-deploy v$((Get-Content package.json | ConvertFrom-Json).version)"
    }
    git commit -m $autoCommitMsg
    Write-Log "Committed all changes."
} else {
    Write-Log "No uncommitted changes detected."
}

# 1.5. Gather commit messages and determine release type using Conventional Commits
Write-Log "Analyzing commit messages to determine version bump (Conventional Commits)..."
$lastTag = git describe --tags --abbrev=0 2>$null
if (-not $lastTag) { $lastTag = "" }
# Gather commit messages since last tag (excluding version bump/ultra-deploy commits)
if ($lastTag -ne "") {
    $commitList = git log $lastTag..HEAD --pretty=format:"%s%n%b"
    $commitMessages = git log $lastTag..HEAD --pretty=format:"- %s" | Where-Object { $_ -notmatch "Ultra-deploy: release v" -and $_ -notmatch "Auto-commit: changes before ultra-deploy" }
} else {
    $commitList = git log --pretty=format:"%s%n%b"
    $commitMessages = git log --pretty=format:"- %s" | Where-Object { $_ -notmatch "Ultra-deploy: release v" -and $_ -notmatch "Auto-commit: changes before ultra-deploy" }
}

# Default to patch
$ReleaseType = "patch"
if ($commitList | Select-String -Pattern "BREAKING CHANGE" -SimpleMatch) {
    $ReleaseType = "major"
} elseif ($commitList | Select-String -Pattern "^feat!|^fix!|^.*!:" -SimpleMatch) {
    $ReleaseType = "major"
} elseif ($commitList | Select-String -Pattern "^feat:" -SimpleMatch) {
    $ReleaseType = "minor"
} elseif ($commitList | Select-String -Pattern "^fix:" -SimpleMatch) {
    $ReleaseType = "patch"
}
Write-Log "Determined release type: $ReleaseType"

# 2. Bump version in package.json
Write-Log "Bumping version ($ReleaseType)..."
npm version $ReleaseType --no-git-tag-version

# 2.5. Rebuild native modules and build renderer
Write-Log "Running electron-rebuild to ensure native modules are compatible..."
npx electron-rebuild
Write-Log "Building renderer..."
npm run build

# 2.6. Build installer and release files
Write-Log "Packaging app for release..."
npm run dist


# 3. Get new version
$package = Get-Content package.json | ConvertFrom-Json
$newVersion = $package.version
Write-Log "New version: $newVersion"

# 4. Update CHANGELOG.md and prepare release notes
$date = Get-Date -Format "yyyy-MM-dd"
if (-not $commitMessages -or $commitMessages.Count -eq 0) {
    $commitMessages = "- No changes found."
}
$changelogEntry = "`n## [$newVersion] - $date`n$($commitMessages -join "`n")`n"
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
    $releaseNotes = $commitMessages -join "`n"
    gh release create v$newVersion --title "Release v$newVersion" --notes "$releaseNotes"

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
