# Morph development progress

Public page: https://akashseamportfolio.github.io/morph/

A minimal task-completion dashboard for Morph. It matches the portfolio's color palette, fonts, and saved `akash-theme` light/dark preference. Hovering over each milestone reveals completed, remaining, and total counts on desktop; tap to expand on mobile. No manual refresh button.

## Secure scheduled ClickUp integration

This site is publicly hosted with GitHub Pages. `morph/progress.json` contains **only aggregate task counts**—never private task names, descriptions, or API tokens.

The GitHub Actions workflow `.github/workflows/morph-progress.yml` is configured to run every 30 minutes and publish updated counts from the ClickUp Morph List. The workflow uses the private GitHub Actions repository secret `CLICKUP_API_TOKEN` configured under:
https://github.com/akashseamportfolio/akashseamportfolio.github.io/settings/secrets/actions

Do not paste a ClickUp token into this repository, public page, or JSON. Without the repository secret, the scheduled sync safely fails and the public page continues to display the previous published snapshot.

## Stage counting (ClickUp Free Forever)

The dashboard counts **current task records** in the Morph ClickUp List, with each task contributing to at most one of the four development stages: `Pitch`, `Alpha`, `Beta`, and `Full Release`.

1. **Explicit ClickUp stage tag wins.** The Tags field supports `Pitch`, `Alpha`, `Beta`, `Full Release`, `Pitch Stage`, and `Stage: Pitch` (case-insensitive), with equivalent aliases for other stages. Add one stage tag when you deliberately assign or move a task.
2. **Existing imported roadmap stage is a provisional fallback.** The 303 granular `MOR-...` tasks were imported with `Suggested stage: Pitch/Alpha/Beta/Full Release` in their descriptions. Until they receive explicit stage tags, the sync reads that existing description text. It does not depend on a paid ClickUp custom field.
3. **No valid or conflicting stage tags:** If there is no valid tag and no recognized suggestion, the task remains unassigned. Conflicting valid stage tags always leave a task unassigned until the tags are corrected.

**Stage denominators are actual counts of currently assigned tasks, not fixed estimates.** Adding or deleting a staged task changes the corresponding total at the next sync. Applying a stage tag overrides a description's provisional stage and moves that task between stage totals. Each stage's completed numerator counts completed tasks assigned by the same rules, so its percentage is internally consistent.

The original roadmap had 303 granular tasks (Pitch 92, Alpha 117, Beta 76, Full Release 18). Existing umbrella cards and newer tasks count in a stage when tagged, rather than being silently added to those original allocations. Untagged umbrella cards remain unassigned. The overall bar counts **all** tasks and their true completion statuses, whether staged or not. JUICE and DEFFERED are work statuses, not development stages. Only aggregate counts are published.

## Automatic synchronization

GitHub Actions securely fetches ClickUp task totals approximately every 30 minutes and deploys the aggregate progress JSON to GitHub Pages. The dashboard checks the deployed JSON every two minutes while visible and again when the visitor returns to the tab. No manual sync button or browser-side API credential is required.
