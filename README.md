#
# Commit Message Guidelines for Versioning

This project uses [Conventional Commits](https://www.conventionalcommits.org/) to determine version bumps and release notes:

- **Features:** `feat: description` (bumps minor version)
- **Bugfixes:** `fix: description` (bumps patch version)
- **Breaking changes:** `BREAKING CHANGE:` or `!` in type (bumps major version)

Please use these prefixes in your commit messages for accurate versioning and changelogs.
# Financial Assistance App

This repository contains the source code for the Financial Assistance App, an Electron desktop application designed to help families manage financial assistance and budgeting.

## Features
- Modular Electron architecture
- Auto-deploy and update system
- Realistic test data for ~$60k/year household

## Setup
1. Clone the repository
2. Install dependencies
3. **Always run `npm run build` before testing or running the app to ensure your latest code changes are included.**
4. The SQLite database file (`assets/accounts.db`) is included in builds and deployments. All test data for new features must be added to this database (not to `accounts.json`).
5. Run the app

## Auto-Deploy

### Ultra-Deploy Usage

The Financial Assistance App uses an automated deployment script to streamline versioning, changelog updates, and GitHub releases.

#### Prerequisites
- **PowerShell** (Windows, or PowerShell Core on Mac/Linux)
- **Node.js** and **npm**
- **git**
- **GitHub CLI** (`gh`) [optional, for automatic release creation]

#### How to Use
1. Make your changes as usual. **Before testing or running the app, always run `npm run build` to bundle your latest code.**
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


## Modular Design

The Financial Assistance App is built with a modular architecture to ensure maintainability, scalability, and ease of development. The project is organized into clear, functional modules for both the Electron main process and the renderer (React UI):

### Main Process (Electron)
- **main/index.js**: Entry point. Initializes the app, creates the main window, and sets up IPC and auto-update modules.
- **main/modules/window.js**: Handles creation and configuration of the main application window.
- **main/modules/ipc.js**: Manages all inter-process communication (IPC) between the main and renderer processes, including update and messaging events.
- **main/modules/updater.js**: Integrates Electron auto-updater, handling update checks, downloads, and user prompts.

### Renderer Process (React)
- **renderer/App.jsx**: Main React component, manages dashboard UI, state, and offline/online logic. Uses modular components for error boundaries and update help.
- **renderer/index.jsx**: React entry point, renders the app.
- **renderer/preload.js**: Securely exposes update and IPC APIs to the renderer via Electron's contextBridge.
- **components/**: Contains reusable UI components (e.g., `ErrorBoundary.jsx`, `UpdateHelp.jsx`).

### Modularity Principles
- Each module is responsible for a single concern (window, IPC, updates, UI, etc.).
- Communication between main and renderer is handled via IPC channels, with clear separation of logic.
- All business logic and state management are encapsulated in their respective modules/components.
- The app is designed to work offline-first, with localStorage used for persistent data in the renderer.
- New features should be added as new modules or components, following this structure.

For more details, see the code comments in each module and the [docs/](docs/) folder.

## Spending Pattern Alerts (Dashboard)

The Dashboard now features a new "Spending Pattern Alerts" section in the Alerts & Warnings tab. This system analyzes your last 4-6 months of spending by category and notifies you if your current week or month spending is significantly higher or lower than usual (30%+ variance). Alerts are color-coded by severity, can be expanded for details, and can be marked as read (they will not reappear). All logic is modular, theme-aware, and accessible. Test data for a ~$60k/year household is included in the SQLite database for realistic demo and testing.

**How to use:**
- Go to Dashboard > Alerts & Warnings
- Click the "Spending Pattern Alerts" section to expand
- Review any new alerts; click to expand for details
- Mark alerts as read to hide them permanently

This feature helps you spot unusual spending patterns and take action before they become a problem.

## License
See `LICENSE` for usage terms.
