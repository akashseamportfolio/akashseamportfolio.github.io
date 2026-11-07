# Morph development progress

Public page: https://akashseamportfolio.github.io/morph/

A minimal task-completion dashboard for Morph. It matches the portfolio's color palette, fonts, and saved `akash-theme` light/dark preference. Hovering over each milestone reveals completed, remaining, and total counts on desktop; tap to expand on mobile. No manual refresh button.

## Secure scheduled ClickUp integration

This site is publicly hosted with GitHub Pages. `morph/progress.json` contains **only aggregate task counts**—never private task names, descriptions, or API tokens.

The GitHub Actions workflow `.github/workflows/morph-progress.yml` is configured to run every 30 minutes and publish updated counts from the ClickUp Morph List. The workflow uses the private GitHub Actions repository secret `CLICKUP_API_TOKEN` configured under:
https://github.com/akashseamportfolio/akashseamportfolio.github.io/settings/secrets/actions

Do not paste a ClickUp token into this repository, public page, or JSON. Without the repository secret, the scheduled sync safely fails and the public page continues to display the previous published snapshot.

## Stage counting (ClickUp Free Forever)

The dashboard reads the new **Morph** ClickUp List (ID `1000450000013753`) and tracks five stages: **Greybox**, **Pitch**, **Alpha**, **Beta**, and **Full Release**. Each task counts in at most one stage.

Stage assignment priority, from highest to lowest:

1. **Task name prefix:** A task name beginning with `[G]`, `[P]`, `[A]`, `[B]`, or `[F]` assigns it to Greybox, Pitch, Alpha, Beta, or Full Release, respectively. Prefixes are case-insensitive. **The prefix overrides any conflicting stage tag, description, or status.** To reassign a task, change its prefix in the name.
2. **Stage tag:** For a task without a recognized prefix, a unique stage tag such as `Beta`, `Beta Stage`, or `Stage: Beta` takes precedence. Conflicting stage tags leave an unprefixed task unassigned.
3. **Description:** Without a recognized prefix or tag, `Suggested stage: Beta` (or any other recognized stage) anywhere in the description assigns the stage, regardless of capitalization.
4. **Task status:** If none of the above is present, the stage status itself is used when it matches a recognized stage. Workflow statuses such as Waiting, Current, Juice, Deffered, and Complete are not stages.

For new tasks, use the name prefix. The existing imported tasks can retain their historical `Suggested stage:` descriptions as a fallback. A task moved into Current, Waiting, Juice, Next on the list, or Complete retains its stage through the prefix or description. Completion is determined separately by the ClickUp status.

The dashboard totals are the number of currently assigned task records, not estimates of engineering effort. Adding, completing, reassigning, or deleting tasks changes the corresponding counts at the next successful sync. Only aggregate totals are published, never task titles or descriptions.

## Scope notes

The old 338-task list is preserved as **Morph old**, while the new Morph list uses the revised Greybox → Pitch → Alpha → Beta → Full Release roadmap. The earlier [Pitch scope review](PITCH_SCOPE.md) is retained as historical planning context, not the authoritative current task allocation.

## Automatic synchronization

GitHub Actions securely fetches ClickUp task totals approximately every 30 minutes and deploys the aggregate progress JSON to GitHub Pages. The dashboard checks the deployed JSON every two minutes while visible and again when the visitor returns to the tab. No manual sync button or browser-side API credential is required.
