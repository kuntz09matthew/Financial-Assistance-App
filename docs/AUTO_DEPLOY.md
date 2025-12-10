# Auto-Deploy Setup

This document describes the auto-deploy process for the Financial Assistance App.

## Steps
1. Version bump
2. Commit changes
3. Push to GitHub
4. Create GitHub release

## Ultra-Deploy Script

The `scripts/ultra-deploy.ps1` PowerShell script automates the entire process:

- Detects and auto-commits all uncommitted changes
- Bumps the version in `package.json` (patch/minor/major)
- Updates `CHANGELOG.md` and `VERSION.md`
- Commits, tags, and pushes changes to GitHub
- Creates a GitHub release (if `gh` CLI is installed)

### Usage
From the project root, run:
```powershell
./scripts/ultra-deploy.ps1 -ReleaseType patch
```
Replace `patch` with `minor` or `major` as needed.

**Note:** You do not need to manually commit changes before running the script. All changes will be auto-committed.