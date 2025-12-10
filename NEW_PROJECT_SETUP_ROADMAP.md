# NEW_PROJECT_SETUP_ROADMAP.md

## ⚡️ Project Setup Roadmap: Electron Desktop App with Ultra-Deploy & Auto-Update

---




## PROJECT SETUP BEST PRACTICES

- Use clear, modular folder and file structure
- Write clean, well-commented code
- Add basic documentation for each setup step
- Ensure all scripts and configuration files are easy to understand and maintain
- All features and setup steps must be implemented with production quality, modular design, error handling, validation, and documentation.
- Use realistic test data for a ~$60k/year household for all test/demo data.
- **Always run `npm run build` before testing or running the Electron app to ensure your latest code changes are included.**
- Always confirm the next unchecked item before starting. Implement only that item completely before moving on.
- After each item is finished, create a release to ‘save my spot’ (version bump, commit, changelog, GitHub release).
- The system must automatically detect changes since the last release, commit them, and update documentation.
- If a change in technology or approach is required, update the roadmap accordingly (do not remove features, but add new ones if needed for robustness).
- [x] Add the ability for the app to automatically check GitHub for updates after it has been downloaded and installed, so users can pull down new releases.
- After the initial setup roadmap is complete, add explicit steps to download and install the first version of the app before moving on to feature development.

---


## PHASE 1: Project Initialization
 [x] Create project folder structure (modular Electron app: main, renderer, components, assets, scripts, docs)
 [x] Initialize git repository and connect to GitHub (guide user step by step: repo creation, versioning, changelog, auto-deploy setup)
 [x] Add .gitignore, README.md, and LICENSE
 [x] Set up Node.js environment and package.json
 [x] Set up Electron main process (entry point, window creation, IPC)
 [x] Set up React (or preferred UI framework) for renderer process with dashboard layout (tabs, subtabs)


## PHASE 2: Ultra-Deploy System
[x] Create ultra-deploy script (PowerShell or Bash)
- [x] Script bumps version, commits, pushes, and creates GitHub release
- [x] Add changelog and version tracking
- [x] Document ultra-deploy usage in README
- [x] System must automatically detect changes since last release, commit them, and update documentation


## PHASE 3: In-App Update System
- [x] Electron auto-update integration: app checks GitHub for new releases after install
- [x] UI for "Check for Updates" and "Update Now" in dashboard
- [x] Download and apply update (manual or guided)
- [x] Document update process for users


## PHASE 4: Offline-First & Modularity
- [x] Ensure all core features work offline
- [x] Modularize Electron main/renderer code (folders, components, blueprints)
 - [x] Document modular design in README
## PHASE 5: Release & Download First Version
- [x] Make a release of the current state after setup is complete (version bump, commit, changelog, GitHub release)
- [ ] Download and install the first version of the app (explicit user step)
- [ ] Verify installation and initial run before moving to feature development

---


## COMMANDS TO CONTROL ROADMAP PROGRESS

You can use these commands at any time to control progress:

- ‘Start with setup roadmap. Show the next unchecked item.’
- ‘Start with financial assistant roadmap. Show the next unchecked item.’
- ‘Proceed.’ (implement the confirmed item)
- ‘Pause here. I’ll test.’
- ‘Make a release for this item.’
- ‘Resume from last completed item.’
- ‘Switch to setup roadmap.’ / ‘Switch to feature roadmap.’
- ‘Show roadmap status.’

**Rules:**
- Always wait for user to say ‘Proceed’ before building the next item.
- Always update the roadmap files and Copilot prompt files in the project to reflect changes.

---

To work on the next unchecked item, paste this statement to Copilot:

  **"Let's work on the next unchecked item (only that one) on the NEW_PROJECT_SETUP_ROADMAP.md. Make sure with me before you start that you are going to work on the correct item. Be sure to update test data at the end if necessary to test the new feature. The test data needs to be realistic for a family that only makes around 60k a year right now combined (the data doesn't have to be replaced from what was made in the past, instead just add some more data so it can test this new feature). Also be sure to maintain the modular design. Do all of this for me, keep everything according to the critical implementation instructions in the roadmap. Do not stop during the implementation to ask me what I want to do, just do what you think is appropriate for that step (don't ask me what I want to do, tell me what I need to do). Also make sure to keep to the same type of 'theme' or complexity as the rest of the app that is already created."**

---

To work on the next unchecked item in the financial assistant roadmap, use:

  **"Let's work on the next unchecked item (only that one) on the FINANCIAL_ASSISTANT_ROADMAP.md. Make sure with me before you start that you are going to work on the correct item. Be sure to update test data at the end if necessary to test the new feature. The test data needs to be realistic for a family that only makes around 60k a year right now combined (the data doesn't have to be replaced from what was made in the past, instead just add some more data so it can test this new feature). Also be sure to maintain the modular design. Do all of this for me, keep everything according to the critical implementation instructions in the roadmap. Do not stop during the implementation to ask me what I want to do, just do what you think is appropriate for that step (don't ask me what I want to do, tell me what I need to do). Also make sure to keep to the same type of 'theme' or complexity as the rest of the app that is already created."**

---

You can use these statements for any roadmap in this project. Copilot will check off each item as it is completed, following all standards and updating test data as needed.
