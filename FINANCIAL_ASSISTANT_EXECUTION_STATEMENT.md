# FINANCIAL_ASSISTANT_EXECUTION_STATEMENT.md

## How to Direct Copilot for the Financial Assistant Roadmap

Paste the following statement to Copilot to work through the FINANCIAL_ASSISTANT_ROADMAP.md, one step at a time, with all standards and test data requirements:

---


**"Let's work on the next unchecked item (only that one) on the FINANCIAL_ASSISTANT_ROADMAP.md.**

**⚠️ When implementing new features, be especially careful to avoid duplicating code (such as entire components or hook logic) and to never call React hooks (like useState, useEffect, etc.) outside of function components or custom hooks. Duplicating code or misusing hooks can cause errors such as 'Invalid hook call' or 'return outside of function'. Always review and refactor existing code before adding new logic, and ensure only one export per file.**


**Make sure with me before you start that you are going to work on the correct item. Be sure to update test data at the end if necessary to test the new feature. The test data needs to be realistic for a family that only makes around 60k a year right now combined (the data doesn't have to be replaced from what was made in the past, instead just add some more data so it can test this new feature). All test data must be added to the database (assets/data.db) and not to JSON files. Also be sure to maintain the modular design. Place each new feature or code in the best (most logical) place in the codebase, and ensure that any new feature or UI element is also placed in the most logical and user-friendly location on the front end (what the users see in the app). Each feature must be placed in the most appropriate page and sub-page as defined in the updated roadmap navigation structure (lines 141-180). If a feature does not fit an existing page, create a new one as needed. Do all of this for me, keep everything according to the critical implementation instructions in the roadmap, and strictly follow the Quality Standards listed in the roadmap (lines 3-190). Do not stop during the implementation to ask me what I want to do, just do what you think is appropriate for that step (don't ask me what I want to do, tell me what I need to do). Also make sure to keep to the same type of 'theme' or complexity as the rest of the app that is already created. Styling and UI polish must be completed for each feature as it is built, including support for a dark/light theme toggle in the View menu. After making changes, run the build process (e.g., `npm run build`) before testing new features in the app. If you install new dependencies, update Node.js, or update Electron, you must also run `npx electron-rebuild` before building and starting the app to ensure all native modules are compatible. Always run the build process (e.g., `npm run build`) after making changes and before testing new features in the app. At the end, if all of the feature is confirmed complete with no errors with the tests, mark it complete on the roadmap.**

---


- Copilot will check off each item as it is completed, following all standards and updating test data as needed.

- **Always run the build process (e.g., `npm run build`) after making changes and before testing new features in the app.**
