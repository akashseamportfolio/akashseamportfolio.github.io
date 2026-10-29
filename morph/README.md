# Morph development progress

Public URL: https://akashseamportfolio.github.io/morph/

This page has five minimal loading bars. It displays only aggregate counts from the ClickUp Morph List. No task names, descriptions, passwords, or ClickUp token are published.

## Automatic updates (no ChatGPT dependency)

GitHub Actions owns the whole sync. The workflow at `.github/workflows/morph-progress.yml` runs on portfolio pushes, when manually requested, and approximately every two hours. It fetches ClickUp tasks into a temporary build copy of `morph/progress.json`, and deploys the *entire existing portfolio* plus the updated Morph page to GitHub Pages. No JSON commit to the default branch is necessary.

**One-time setup by the repository owner**:
1. In https://github.com/akashseamportfolio/akashseamportfolio.github.io/settings/secrets/actions add a repository secret named `CLICKUP_API_TOKEN` containing your ClickUp personal API token. Keep this private.
2. In https://github.com/akashseamportfolio/akashseamportfolio.github.io/settings/pages set **Build and deployment → Source → GitHub Actions**.
3. Run https://github.com/akashseamportfolio/akashseamportfolio.github.io/actions/workflows/morph-progress.yml with **Run workflow** once to confirm successful deployment.

**Why the one-time settings are necessary**: A public GitHub Pages site cannot safely contain a private ClickUp token. The connected GitHub tools in ChatGPT cannot manage repository secrets or GitHub Pages source configuration. GitHub Pages branch publishing is not triggered by commits made with the built-in GitHub Actions `GITHUB_TOKEN`.

Until the workflow is successfully configured, the site continues displaying the last committed snapshot (7/334 tasks in the original snapshot). On any failed ClickUp request, a scheduled job stops rather than publishing fabricated totals. Existing portfolio pages, assets and routes are preserved.

The `Suggested Stage` custom field determines Pitch, Alpha, Beta, and Full Release grouping. COMPLETE/closed controls the numerator. JUICE and DEFFERED are not counted as completed. This is a task completion measurement, not a game effort estimate.
