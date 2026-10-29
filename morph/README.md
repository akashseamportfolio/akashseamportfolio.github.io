# Morph development progress

Public page: https://akashseamportfolio.github.io/morph/

The public page uses `morph/index.html` and `morph/progress.json`. The JSON contains only aggregate progress counts: no task names, descriptions or API credentials.

## Automatic updates

Progress is synchronized using a ChatGPT automation named **Sync Morph progress**, scheduled approximately every two hours. It uses the owner's connected ClickUp and GitHub apps to read tasks and commit updated aggregate totals to this repository.

GitHub Pages already deploys from the main branch, so publishing new progress data triggers the existing site deployment. No ClickUp API token, GitHub Actions secret or workflow configuration is required.

If the connected apps or the ChatGPT automation are disabled, the website continues displaying the last saved totals, but stops refreshing until the connection is restored.

Stage-specific percentages use the tasks' `Suggested Stage` values. The overall percentage counts tasks marked COMPLETE across the Morph List. JUICE and DEFFERED are separate statuses, not completed work.

This page is a task-completion indicator, not an estimate of actual game-development effort.
