## [Unreleased]

### Added
- Spending pattern alerts on Dashboard: Detects unusual spending patterns by category, provides severity-based alerts, and allows users to dismiss or expand alert details. Alerts are persisted and do not reappear once dismissed. See README.md for usage.
- Financial Analysis Engine: Aggregates balances, income, expenses, and trends for the last 6 months. Provides AI-powered recommendations and insights in the Dashboard Insights tab. Fully theme-aware, modular, and accessible. Uses realistic test data for a ~$60k/year household in the database.
- Insights Tab: Displays actionable recommendations, positive insights, and financial tips based on user data. Includes loading and error handling states.

### Changed

### Fixed

---
# vNEXT
- Added: Spending Pattern Alerts to Dashboard (Alerts & Warnings tab)
    - Analyzes 4-6 months of transaction data for each category
    - Detects when current week/month spending is 30%+ higher or lower than historical average
    - Severity-based (High/Medium) alerts and positive insights for reduced spending
    - Fully theme-aware, mobile-responsive, and accessible
    - Alerts are shown in a compact, expandable list; each can be marked as read and will not reappear
    - All logic and UI follow roadmap quality standards and modular design
    - Realistic test data for ~$60k/year household included in SQLite database
    - Documentation and UI updated for new feature
- Added "Money left per day" calculator to Dashboard:
	- Calculates daily budget target based on remaining safe-to-spend and days left in the month
	- Displays daily target, progress, and alert if daily average is exceeded
	- Fully integrated with backend and frontend, with user-friendly icon and error handling
# [1.0.14] - 2025-12-12
### Added
- Alerts & Warnings: Upcoming Bill Reminders (next 7 days) feature with urgency grouping, color-coded indicators, auto-pay/manual badges, paid/unpaid status, and quick stats. Fully integrated into UI with theme and accessibility support.
- Database schema: Added `paid` and `auto_pay` columns to `transactions` table for bill tracking.
- Test data: Automatically inserted realistic test bills for the next 7 days to validate reminders feature.

### Improved
- UI polish and accessibility for Alerts & Warnings tab. All new features tested with dark/light theme toggle.

### Fixed
- Ensured all new features use modular design and follow roadmap quality standards.

### Updated
- Documentation and test data scripts for new bill reminder logic.
# [1.0.13] - 2025-12-11
### Added
- Dashboard: Month-to-date spending summary card, with live calculation from new data.db (SQLite) and realistic test data for a ~$60k/year household
- Migrated all data to new data.db (accounts, transactions) and removed legacy accounts.db and accounts.json
- Full rebuild and verification of all native modules for Electron compatibility
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]
- Completed: Real-time account balances (checking, savings, credit cards) feature. Dashboard now displays live balances for all major account types, with theme support, error handling, and realistic test data for ~$60k/year household.
- Added: Available Spending Money calculation card to Dashboard, with modular design, theme support, and realistic test data for ~$60k/year household. UI polish and accessibility improvements included.

## [1.0.5] - 2025-12-10
- First public release: initial project setup complete, modular Electron/React architecture, auto-update, ultra-deploy, and offline-first features implemented.
## [1.0.1] - 2025-12-10
- Automated ultra-deploy release


## [1.0.2] - 2025-12-10
- Automated ultra-deploy release


## [1.0.3] - 2025-12-10
- Automated ultra-deploy release


## [1.0.4] - 2025-12-10
- Automated ultra-deploy release


## [1.0.6] - 2025-12-10
- Automated ultra-deploy release


## [1.0.7] - 2025-12-10
- No changes found.


## [1.0.8] - 2025-12-10
- No changes found.


## [1.0.9] - 2025-12-10
- No changes found.


## [1.0.10] - 2025-12-10
- No changes found.


## [1.0.11] - 2025-12-11
- No changes found.


## [1.0.12] - 2025-12-11
- No changes found.


## [1.0.13] - 2025-12-11
- No changes found.


## [1.0.14] - 2025-12-11
- No changes found.


## [1.0.15] - 2025-12-11
- No changes found.


## [1.0.16] - 2025-12-11
- No changes found.


## [1.0.17] - 2025-12-11
- No changes found.


## [1.0.18] - 2025-12-11
- No changes found.


## [1.0.19] - 2025-12-11
- No changes found.


## [1.0.20] - 2025-12-11
- No changes found.


## [1.0.21] - 2025-12-11
- No changes found.


## [1.0.22] - 2025-12-11
- No changes found.


## [1.0.23] - 2025-12-11
- No changes found.


## [1.0.24] - 2025-12-11
- No changes found.


## [1.0.25] - 2025-12-11
- No changes found.


## [1.0.26] - 2025-12-11
- No changes found.


## [1.0.27] - 2025-12-11
- No changes found.


## [1.0.28] - 2025-12-12
- No changes found.


## [1.0.29] - 2025-12-13
- No changes found.


## [1.0.30] - 2025-12-13
- No changes found.


## [1.0.31] - 2025-12-13
- No changes found.


## [1.0.32] - 2025-12-13
- No changes found.


## [1.0.33] - 2025-12-13
- No changes found.


## [1.0.34] - 2025-12-13
- No changes found.


## [1.0.35] - 2025-12-13
- No changes found.


## [1.0.37] - 2025-12-13
- No changes found.


## [1.0.38] - 2025-12-13
#


## [1.0.39] - 2025-12-13
#


## [1.0.40] - 2025-12-13
#


## [1.0.41] - 2025-12-13
#


## [1.0.42] - 2025-12-13
#


## [1.0.43] - 2025-12-13
#


## [1.0.44] - 2025-12-13
#

