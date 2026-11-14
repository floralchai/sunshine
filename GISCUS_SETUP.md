# Giscus setup for TawnyFlor

TawnyFlor uses the Quartz `@quartz-community/comments` plugin with Giscus, GitHub sign-in, and custom pastel light/dark themes.

## One-time GitHub setup

1. Enable **Discussions** under [floralchai/sunshine Settings → General → Features](https://github.com/floralchai/sunshine/settings).
2. Install the [Giscus GitHub App](https://github.com/apps/giscus/installations/new) and grant it access to **this repository**.
3. Make sure the **Announcements** discussion category exists in the repository's Discussions settings.

The repository ID is already configured as `R_kgDOVl2v_A`.

## Automatic category ID resolution

GitHub Discussion category IDs are repository-specific. The `prebuild` script therefore calls Giscus' own public category endpoint before each Quartz build, verifies the repository ID, looks up the configured `Announcements` category, and replaces the placeholder in the build workspace. The generated site receives the real category ID; the ID does not need to be manually copied into the repository.

If the Giscus endpoint cannot access the repository, the build stops with an actionable message. Check that Discussions is enabled and that the Giscus GitHub App is installed for this repository with Discussions access.

## Deploy

The pull-request build checks verify that the generated site contains the resolved Giscus category ID and both custom theme files. The Neocities deploy workflow performs the same checks before it uploads anything.

## Notes

- Visitors sign in with GitHub to comment.
- Comments are stored as Discussions in this repository.
- `pathname` mapping gives each page its own discussion thread.
- Custom themes are in `quartz/static/giscus/pastel-light.css` and `quartz/static/giscus/pastel-dark.css`.
- New comments go to GitHub Discussions. Existing Google Sheets comments are not imported automatically and remain in the old spreadsheet.
