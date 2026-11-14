# Giscus setup for TawnyFlor

This repository is already configured to use Giscus with custom TawnyFlor pastel light/dark themes. The final activation is deliberately gated because GitHub Discussions is currently disabled for this repository.

## One-time GitHub setup

1. Open **Settings → General → Features** in [floralchai/sunshine](https://github.com/floralchai/sunshine/settings) and turn on **Discussions**.
2. Install the [Giscus GitHub App](https://github.com/apps/giscus/installations/new) and grant it access to **this repository only**.
3. Open [giscus.app](https://giscus.app/), enter `floralchai/sunshine`, and select the **Announcements** category.
4. Use **Discussion title contains page pathname** as the mapping.
5. Copy the generated **Discussion category ID** into `quartz.config.yaml`, replacing `REPLACE_WITH_GISCUS_CATEGORY_ID`.

The repository ID is already filled in as `R_kgDOVl2v_A`. Do not replace it unless Giscus reports a different value.

## Deploy

The Neocities deployment workflow refuses to deploy while the category ID placeholder remains. Once Discussions and the Giscus App are enabled and the real category ID is saved, merge the Giscus PR. The next push to `main` will build and deploy the pastel Giscus widget.

## Notes

- Visitors authenticate with GitHub when they comment.
- Comments are stored as GitHub Discussions in this repository.
- `pathname` gives each page its own discussion thread.
- The custom themes live in `quartz/static/giscus/pastel-light.css` and `quartz/static/giscus/pastel-dark.css`.
- Existing Google Sheets comments are not imported automatically. They remain in the old Sheet; new comments will be stored in GitHub Discussions.
