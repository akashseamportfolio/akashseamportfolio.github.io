# Morph development progress

Public page: https://akashseamportfolio.github.io/morph/

A minimal task-completion dashboard for Morph. It matches the portfolio's color palette, fonts, and saved `akash-theme` light/dark preference. Hovering highlights each milestone and clicking a milestone reveals completed, remaining, and total task counts. No manual refresh button.

## Secure scheduled ClickUp integration

This site is publicly hosted with GitHub Pages. `morph/progress.json` contains **only aggregate task counts**—never private task names, descriptions, or API tokens.

The GitHub Actions workflow `.github/workflows/morph-progress.yml` is configured to run every 30 minutes and publish updated counts from the ClickUp Morph List. The workflow uses the private GitHub Actions repository secret `CLICKUP_API_TOKEN` configured under:
https://github.com/akashseamportfolio/akashseamportfolio.github.io/settings/secrets/actions

Do not paste a ClickUp token into this repository, public page, or JSON. Without the repository secret, the scheduled sync safely fails and the public page continues to display the previous published snapshot.

Stages use the task's `Suggested Stage` field; completed tasks are in ClickUp's COMPLETE/closed state. JUICE and DEFFERED are not completion statuses. Percentages measure tasks, not total development effort.

## Automatic synchronization

GitHub Actions securely fetches ClickUp task totals approximately every 30 minutes and deploys the aggregate progress JSON to GitHub Pages. The dashboard checks the deployed JSON every two minutes while visible and again when the visitor returns to the tab. No manual sync button or browser-side API credential is required.
