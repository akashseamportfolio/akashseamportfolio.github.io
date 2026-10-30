# Morph development progress

Public page: https://akashseamportfolio.github.io/morph/

A minimal task-completion dashboard for Morph. It matches the portfolio's color palette, fonts, and saved `akash-theme` light/dark preference. Hovering over each milestone reveals completed, remaining, and total counts on desktop; tap to expand on mobile. No manual refresh button.

## Secure scheduled ClickUp integration

This site is publicly hosted with GitHub Pages. `morph/progress.json` contains **only aggregate task counts**—never private task names, descriptions, or API tokens.

The GitHub Actions workflow `.github/workflows/morph-progress.yml` is configured to run every 30 minutes and publish updated counts from the ClickUp Morph List. The workflow uses the private GitHub Actions repository secret `CLICKUP_API_TOKEN` configured under:
https://github.com/akashseamportfolio/akashseamportfolio.github.io/settings/secrets/actions

Do not paste a ClickUp token into this repository, public page, or JSON. Without the repository secret, the scheduled sync safely fails and the public page continues to display the previous published snapshot.

## Stage tags (ClickUp Free Forever)

Use the built-in **Tags** field to assign one stage tag to each task: `Pitch`, `Alpha`, `Beta`, or `Full Release`. The sync also accepts labels such as `Pitch Stage` or `Stage: Pitch` (case-insensitive).

Tags take priority over the legacy `Suggested Stage` custom field, which may not be editable on the Free plan. Existing untagged backlog tasks retain their old stage assignments through that field, so their counts do not reset. Add only one stage tag per task; multiple conflicting stage tags cause the task to be unassigned.

Mark the task **Complete** to count it as finished. JUICE and DEFFERED are not completion statuses. Percentages reflect tasks, not total development effort.

## Automatic synchronization

GitHub Actions securely fetches ClickUp task totals approximately every 30 minutes and deploys the aggregate progress JSON to GitHub Pages. The dashboard checks the deployed JSON every two minutes while visible and again when the visitor returns to the tab. No manual sync button or browser-side API credential is required.
