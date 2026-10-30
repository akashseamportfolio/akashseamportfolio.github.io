# Morph development progress

Public page: https://akashseamportfolio.github.io/morph/

A minimal task-completion dashboard for Morph. It matches the portfolio's color palette, fonts, and saved `akash-theme` light/dark preference. Hovering highlights each milestone and clicking a milestone reveals completed, remaining, and total task counts. No manual refresh button.

## Secure scheduled ClickUp integration

This site is publicly hosted with GitHub Pages. `morph/progress.json` contains **only aggregate task counts**—never private task names, descriptions, or API tokens.

The GitHub Actions workflow `.github/workflows/morph-progress.yml` is configured to run every 30 minutes and publish updated counts from the ClickUp Morph List. For live synchronization the repository owner must add a current ClickUp personal API token as the private GitHub Actions repository secret `CLICKUP_API_TOKEN` under:
https://github.com/akashseamportfolio/akashseamportfolio.github.io/settings/secrets/actions

The GitHub integration available to this deployment cannot create or modify Actions secrets. Do not paste a ClickUp token into this repository, public page, or JSON. Without the repository secret, the scheduled sync safely fails and the public page continues to display the previous published snapshot.

Stages use the task's `Suggested Stage` field; completed tasks are in ClickUp's COMPLETE/closed state. JUICE and DEFFERED are not completion statuses. Percentages measure tasks, not total development effort.

## Manual synchronization

The small **SYNC** link in the dashboard opens the GitHub Actions workflow for repository owners. Use **Run workflow** there to start a fresh ClickUp sync. GitHub requires write access, which prevents anonymous visitors from generating API calls. The public page itself polls only its deployed aggregate `progress.json` every two minutes while the page is visible; no browser-side ClickUp credential is needed. The GitHub Actions scheduled sync remains active roughly every 30 minutes. Avoid rerunning a previously successful job directly: doing so can create duplicate `github-pages` artifacts and fail at deploy. Instead use **Run workflow** to start a new run.
