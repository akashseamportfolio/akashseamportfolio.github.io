# Morph development progress

Live page: https://akashseamportfolio.github.io/morph/

Minimal progress dashboard for the Morph game project, styled to match the portfolio's current color palette and typography. Shares the portfolio's `akash-theme` light/dark preference. Hovering over a milestone highlights it; clicking it expands the completed, remaining and total task counts. No redundant refresh button.

### Data and privacy

This is a public GitHub Pages site. It loads the aggregate-only `progress.json` created by the private ClickUp sync. It does not and must not include a ClickUp personal token in HTML, JS, git history, or public JSON.

GitHub Actions workflow: `.github/workflows/morph-progress.yml`. It runs roughly every two hours and deploys the current portfolio with new aggregate counts when the repository secret `CLICKUP_API_TOKEN` has been configured. **The token has not been configured by ChatGPT**; connected GitHub tools cannot manage Actions secrets. Until the repository owner adds a freshly rotated token as that secret, scheduled syncs fail safely and the page shows its last saved snapshot.

ClickUp's personal token was pasted into a chat on 2026-10-29. Rotate/revoke it and use a new token only in GitHub's Actions secret settings: https://github.com/akashseamportfolio/akashseamportfolio.github.io/settings/secrets/actions. Never publish that token.

Progress: the numerator is tasks completed/closed, stages use the `Suggested Stage` custom field, JUICE and DEFFERED remain separate statuses rather than completed states. Percentages represent task counts, not percentage of the overall development effort.
