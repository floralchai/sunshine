# Waline setup for Tawny Flor

This repository integrates the Waline v3 comment client into Quartz 5. The widget is styled to match the site's pastel rainbow palette and uses a small set of original pixel-art emoji images hosted with the site.

The site remains static on Neocities. Waline itself needs a separate server and database to store comments.

## 1. Deploy the Waline server

1. Open the official [Waline Get Started guide](https://waline.js.org/en/guide/get-started/).
2. Use its Vercel deployment flow to create your own Waline server project.
3. In Vercel, open **Storage** and attach a PostgreSQL database using the Neon marketplace integration, as described in the guide.
4. Open the connected database in Neon, run the PostgreSQL schema SQL supplied by the Waline guide, then redeploy the Waline project.
5. Open the deployed server's base URL. This is the value needed for the website's `WALINE_SERVER_URL`.

Waline is open-source software. Vercel and Neon have their own plans and usage quotas, so check their current free-tier limits before relying on a no-cost deployment.

## 2. Configure moderation and anonymous comments

In the Waline server project's **Settings → Environment Variables**, add:

| Variable | Value |
| --- | --- |
| `SITE_NAME` | `Tawny Flor` |
| `SITE_URL` | `https://tawnyflor.neocities.org` |
| `COMMENT_AUDIT` | `true` |
| `SECURE_DOMAINS` | `tawnyflor.neocities.org,<your-waline-server-hostname>` |

Replace `<your-waline-server-hostname>` with the server host only, for example `your-project.vercel.app`. Do not include `https://` in `SECURE_DOMAINS`. Waline's documentation says to include both the website and server hostnames in this allowlist.

Leave the server's `LOGIN` variable unset (do not set it to `force`). The website client also sets `login: "disable"`, makes only the nickname field available, and does not require an email address. Visitors can post without creating an account.

**Moderation is enabled by `COMMENT_AUDIT=true`.** With this enabled, every new comment stays hidden until an administrator approves it. Redeploy the Waline server after changing its environment variables.

## 3. Register yourself as the administrator

1. As soon as your Waline server is ready, open `https://YOUR-WALINE-SERVER/ui/register`.
2. Create your administrator account immediately. Waline assigns administrator privileges to the first person who registers.
3. After registering, open `https://YOUR-WALINE-SERVER/ui` and sign in.

Do not publish the server URL to visitors until you have secured the first administrator account.

## 4. Connect the Quartz website to Waline

In the GitHub repository **floralchai/sunshine**:

1. Open **Settings → Secrets and variables → Actions → Variables**.
2. Choose **New repository variable**.
3. Set the name to `WALINE_SERVER_URL`.
4. Set the value to your Waline server URL, for example `https://your-project.vercel.app` (no trailing slash is needed).
5. Save the variable.

This URL is public and belongs in **Variables**, not **Secrets**. Do not put your database credentials or server secrets in this repository variable.

The pull-request build works without the variable and shows a setup placeholder. The Neocities deployment workflow deliberately refuses to deploy until `WALINE_SERVER_URL` is configured.

## 5. Moderate comments later

1. Open your Waline admin dashboard at `https://YOUR-WALINE-SERVER/ui`.
2. Sign in with the administrator account you registered in step 3.
3. Open the comment management view. New comments submitted while audit mode is on appear as pending / unapproved.
4. Read each pending comment and choose **Approve** to publish it. Reject or delete spam and unwanted comments.
5. Return to the pending list regularly. Only approved comments are visible to website visitors while audit mode is enabled.

You can also manage comments from the comment list on the relevant page, but the dashboard is the easiest place to review the whole queue.

## Theme and behavior

- Pastel pink, peach, yellow, mint, sky blue, lavender and violet styling.
- Source Serif 4 body text and Nunito controls, matching Tawny Flor.
- Original 8-bit style flower, heart, star, sparkle, rainbow and bunny emoji images are served from `/static/waline-emoji/`.
- Guest posting: no visitor login required and no email field required.
- New comments require administrator approval.
- Each Quartz page has its own comment thread, using the current page path. Quartz SPA navigation updates the Waline instance without a full reload.
- The 404 page does not display a comment box.

## Official documentation

- [Waline installation](https://waline.js.org/en/guide/get-started/)
- [Client options](https://waline.js.org/en/reference/client/props.html)
- [Custom styling](https://waline.js.org/en/guide/features/style.html)
- [Custom emoji presets](https://waline.js.org/en/cookbook/customize/emoji.html)
- [Moderation and comment audit](https://waline.js.org/en/reference/server/env.html)
- [Waline security guidance](https://waline.js.org/en/guide/features/safety.html)
