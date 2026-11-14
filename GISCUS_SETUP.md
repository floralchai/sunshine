# Giscus setup for TawnyFlor

TawnyFlor is configured to use the Quartz `@quartz-community/comments` plugin with Giscus, GitHub sign-in, and custom pastel light/dark themes.

## Repository setup — verified

- Repository: `floralchai/sunshine`
- Repository ID: `R_kgDOVl2v_A`
- Discussion category: `Announcements`
- Category ID: `DIC_kwDOVl2v_M4DLFyU`
- Page mapping: `pathname`

GitHub now reports Discussions enabled for the repository. The Giscus category endpoint successfully returned the `Announcements` category and matching repository ID. The verified category ID is committed in `quartz.config.yaml`.

## Build-time validation

The `prebuild` script includes a small resolver. When a placeholder is used in a future change, it queries Giscus' public category endpoint, verifies the repository ID, and resolves the configured category ID before Quartz builds. With the verified ID already committed, ordinary builds skip the lookup.

The pull-request and Neocities deployment workflows verify that the generated HTML contains a real `DIC_...` category ID and that both custom theme files are present.

## Comment behavior

- Visitors sign in with GitHub to comment.
- Comments are stored as Discussions in this repository.
- Each page uses its own discussion thread through `pathname` mapping.
- The comment widget has custom pastel light and dark themes in `quartz/static/giscus/`.
- New comments go to GitHub Discussions. Existing Google Sheets comments are not imported automatically and remain in the old spreadsheet.
