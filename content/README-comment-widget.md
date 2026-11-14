# Obsidian Publish comment widget — installation

## To begin
You might want to follow https://virtualobserver.moe/ayano/comment-widget aka Virtual Observer tutorial if you have obsidian publish and an old Neocities acco

## Required Publish files

Put these two files directly in the **root of the vault** (the same level as your homepage note), not in `assets/`, `.obsidian/`, or a nested folder:

- `publish.js` — comment form, Google Forms submission, Google Sheets loading, replies, and five-comment pagination.
- `publish.css` — comment styling and the site-wide scrollbar styling.

`publish.js` and `publish.css` are special Obsidian Publish filenames. Publish loads them site-wide when you publish the files. The JavaScript requires your Obsidian Publish site to use a **custom domain**.

## Add the comment section to the homepage

Open the Markdown note that is set as your Obsidian Publish homepage (for example, `Home.md` or `Welcome.md`). Put this HTML element where the comment section should appear:

```html
<div id="c_widget"></div>
```

Do **not** add a `<script>` tag to the note. Obsidian Publish loads `publish.js` globally. The script waits for the widget element and re-initialises when Publish changes the displayed note.

## Publish the files

1. Open **Publish: Publish changes...**.
2. In the Publish changes dialog, make sure `publish.css` and `publish.js` are included. They may not appear in the normal file explorer, but they should be selectable in the Publish dialog.
3. Publish the homepage note containing `<div id="c_widget"></div>`.
4. Open the published site through its custom domain and test the comment form and pagination.

## Folder layout

```text
Your Vault/
├── Home.md                     # or the note set as your Publish homepage
├── publish.css                 # required, vault root
├── publish.js                  # required, vault root; custom domain required
├── README-comment-widget.md    # optional local instructions; do not publish
└── .obsidian/
    └── ...                     # do not put Publish CSS/JS here
```

## Behaviour

- Five top-level comments per pagination page.
- Replies appear under their parent and do not count toward the five-comment limit.
- Each note/page has a separate comment thread based on its URL path.
- Scrollbars use one global styling from `publish.css`.

## Existing Google setup

The Google Form field IDs and Sheet ID from the supplied script are retained. The form questions must be titled exactly `Name`, `Website`, `Text`, `Page`, and `Reply`. The response Sheet must be readable by the site (the script expects the Sheet to be shared as **Anyone with the link: Viewer**).

## Important

Obsidian's official Publish documentation states that `publish.css` and `publish.js` must be located in the vault root. It also states that custom JavaScript through `publish.js` requires a custom domain. Without a custom domain, the CSS will work but this JavaScript comment widget will not run.
