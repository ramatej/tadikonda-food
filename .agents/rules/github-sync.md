# Permanent GitHub Sync Instructions — Tadikonda Food

## Repository Configuration
* **Repository**: https://github.com/ramatej/tadikonda-food.git
* **Remote Name**: `origin`
* **Main Branch**: `main`
* **Project Root**: `C:\Users\ramat\OneDrive\Desktop\Business`

## 1. Automatic GitHub Synchronization on Every Task
Whenever you create, modify, delete, rename, or move any project file:
1. Complete the requested development task.
2. Review all changed files using `git status` and inspect the diff.
3. Run relevant tests, type checks, or production build (`npm run build`).
4. Ensure no secrets, credentials, environment files, private user data, or generated build artifacts are committed.
5. Stage all appropriate changes belonging to the completed task (`git add`).
6. Create a meaningful Git commit following conventions (`feat:`, `fix:`, `ui:`, `chore:`, `docs:`).
7. Push the commit to `origin/main` (`git push origin main`).
8. Verify that the push succeeded and report the commit hash and link.

Do NOT wait for the user to ask to push. GitHub synchronization is a mandatory part of every completed development task.

## 2. Handled Files
* All application code (React, TypeScript, JavaScript, HTML, CSS).
* Components, pages, hooks, context providers, utilities, and services.
* Configuration files (`package.json`, `package-lock.json`, Vite, Tailwind CSS v4, TypeScript configs, ESLint/oxlint).
* Documentation and `README.md`.
* Supabase migrations, SQL schema files, database functions, triggers, and RLS policies.
* Deleted and renamed files must be staged and committed accurately.

## 3. Secret Protection & Ignored Files
* Never commit `.env`, `.env.local`, `.env.*.local`, or any file with real secrets.
* Never commit Supabase service-role keys, database passwords, SMTP credentials, API keys, or private tokens.
* Never commit `node_modules/`, `dist/`, logs, or temporary files.
* Keep `.env.example` updated with safe placeholders.
* If a secret is ever detected, stop and notify the user immediately without logging the secret.

## 4. Push Safety Rules
* Confirm the current directory is `C:\Users\ramat\OneDrive\Desktop\Business`.
* Confirm `origin` points to `https://github.com/ramatej/tadikonda-food.git`.
* Push only completed, clean, working commits.
* Never use `git push --force` or destructive resets.

## 5. End-of-Task Reporting
At the end of every task, provide:
1. What was implemented.
2. Key files changed.
3. Build/typecheck status.
4. Commit hash and push confirmation with GitHub repository link.
5. Any manual action or next steps if applicable.
