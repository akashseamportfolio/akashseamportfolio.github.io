# Morph loading bars
Public page: https://akashseamportfolio.github.io/morph/

Static progress page lives at `morph/index.html`; the public `morph/progress.json` has only aggregate counts, not task names or private data.

## Enable automatic ClickUp sync
1. Open repository Settings → Secrets and variables → Actions → New repository secret.
2. Create `CLICKUP_API_TOKEN` using your personal ClickUp API token. Do not commit it or paste it into the webpage.
3. Set Settings → Pages → Build and deployment → Source to **GitHub Actions** (the workflow deploys the existing portfolio and Morph page together).
4. Run Actions → Morph progress — ClickUp sync → Run workflow. Then it refreshes roughly every two hours.

Until the secret and Pages configuration are complete, the website shows a fixed 334-task initial snapshot. `Suggested Stage` identifies the milestone; the `COMPLETE` status determines what is finished. JUICE and DEFFERED are not completed statuses.

The original portfolio's pages and assets are not modified by this page addition.
