# Financial Assistance App

This repository contains the source code for the Financial Assistance App, an Electron desktop application designed to help families manage financial assistance and budgeting.

## Features
- Modular Electron architecture
- Auto-deploy and update system
- Realistic test data for ~$60k/year household

## Setup
1. Clone the repository
2. Install dependencies
3. Run the app

## Auto-Deploy

### Ultra-Deploy Usage

The Financial Assistance App uses an automated deployment script to streamline versioning, changelog updates, and GitHub releases.

#### Prerequisites
- **PowerShell** (Windows, or PowerShell Core on Mac/Linux)
- **Node.js** and **npm**
- **git**
- **GitHub CLI** (`gh`) [optional, for automatic release creation]

#### How to Use
1. Make your changes as usual. You do not need to manually commit changes before running the script.
2. From the project root, run:
	```powershell
	./scripts/ultra-deploy.ps1 -ReleaseType patch
	```
	- Replace `patch` with `minor` or `major` as needed.
3. The script will:
	- Detect and auto-commit all uncommitted changes
	- Bump the version in `package.json`
	- Update `CHANGELOG.md` and `VERSION.md`
	- Commit and tag the release
	- Push to GitHub
	- Create a GitHub release (if `gh` CLI is installed)

#### Troubleshooting
- If the GitHub CLI is not installed, the script will skip release creation (install from https://cli.github.com/).
- For any errors, check the script output for details.

See `docs/AUTO_DEPLOY.md` for more information.

## License
See `LICENSE` for usage terms.
