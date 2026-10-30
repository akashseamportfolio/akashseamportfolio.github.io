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

**Tags are the only stage assignment source.** The ClickUp custom fields were not imported on the Free plan and the sync does not inspect them. Add one stage tag per task; untagged tasks or tasks with conflicting stage tags remain unassigned.

Until the entire backlog is tagged, the four milestone denominators use the original approximate roadmap allocations: **Pitch 92, Alpha 117, Beta 76, Full Release 18**. These are *planning targets*, not verified counts of tagged tasks. The numerator is the live count of **Complete** tasks with each stage tag. Stage totals only increase automatically if the number of tasks tagged for that stage exceeds its estimate, preventing progress from exceeding 100%. Thus, changing a stage tag updates the stage numerator and task membership, but does not lower the estimated target. This avoids double-counting tasks as tags are applied over time. The totals are configurable in `PLANNED_STAGE_TOTALS` in `morph/sync_clickup.py`.

Overall progress continues to use **all** tasks and their real completion statuses, tagged or not. JUICE and DEFFERED are not completion statuses. The `unassigned` field in the JSON counts tasks without exactly one recognized stage tag and does not subtract from the four planning targets. Percentages measure task counts, not effort.

## Automatic synchronization

GitHub Actions securely fetches ClickUp task totals approximately every 30 minutes and deploys the aggregate progress JSON to GitHub Pages. The dashboard checks the deployed JSON every two minutes while visible and again when the visitor returns to the tab. No manual sync button or browser-side API credential is required.
