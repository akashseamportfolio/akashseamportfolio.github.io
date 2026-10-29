# Morph — Development Progress

Public: https://akashseamportfolio.github.io/morph/

This is a minimalist accessible GitHub Pages display showing one overall loading bar and four milestone bars. Each stage is expandable to show completed / remaining / total tasks. A small top-right **Refresh** button fetches the latest **published** `progress.json` without browser caching.

**Important**: Refreshing the public JSON is not equivalent to fetching live ClickUp tasks. GitHub Pages is a static site. A true per-click ClickUp refresh for all anonymous visitors requires a separately hosted protected endpoint (for example a Cloudflare Worker or Vercel serverless function) with the ClickUp credential stored as a server-side secret, rate limiting and caching. Never put a ClickUp token in public HTML, JSON, JavaScript or source code.

The GitHub Actions workflow `.github/workflows/morph-progress.yml` refreshes the published aggregate data approximately every 2 hours when `CLICKUP_API_TOKEN` is configured in repository Secrets and Pages is deployed via GitHub Actions. The public site only exposes aggregate values, never task details. If the workflow is not configured, the page shows the last committed snapshot.

Progress numerator is tasks in COMPLETE status; the `Suggested Stage` field determines stage grouping. JUICE and DEFFERED aren't completed status values. These are task-count percentages, not game-completion estimates.
