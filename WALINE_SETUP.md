# Waline setup for Tawny Flor

This repository integrates the Waline v3 comment client into Quartz 5. The widget is styled to match the site's pastel rainbow palette and uses a small set of original pixel-art emoji images hosted with the site.

The site remains static on Neocities. Waline itself runs as a separate server with a database. The current server is hosted at `https://waline-comment-cds2jczdz-floralchai.vercel.app`.

## 1. Waline server

The existing Waline server is deployed at:

- Server: `https://waline-comment-cds2jczdz-floralchai.vercel.app`
- Admin dashboard: [Waline admin](https://waline-comment-cds2jczdz-floralchai.vercel.app/ui)
- Registration: [First administrator registration](https://waline-comment-cds2jczdz-floralchai.vercel.app/ui/register)

The v0 project is the design/development reference; the deployed Vercel URL above is the Waline server endpoint used by the website. Keep the Vercel server deployment active.

Waline is open-source software. Vercel and its connected database provider have their own plans and usage quotas, so check their current limits before relying on a no-cost deployment.

## 2. Configure moderation and anonymous comments

In the Waline server project's **Settings → Environment Variables**, make sure these values are configured:

| Variable | Value |
| --- | --- |
| `SITE_NAME` | `Tawny Flor` |
| `SITE_URL` | `https://tawnyflor.neocities.org` |
| `COMMENT_AUDIT` | `false` |
| `SECURE_DOMAINS` | `tawnyflor.neocities.org,waline-comment-cds2jczdz-floralchai.vercel.app` |

Do not include `https://` in `SECURE_DOMAINS`. Waline's documentation says to include both the website and server hostnames in this allowlist.

Leave the server's `LOGIN` variable unset (do not set it to `force`). The website client also sets `login: "disable"`, makes only the nickname field available, and does not require an email address. Visitors can post without creating an account.

**Instant publishing:** set `COMMENT_AUDIT=false` (or remove the variable, since Waline defaults to `false`). New comments can then appear immediately without manual approval. Keep the built-in spam safeguards enabled: leave `AKISMET_KEY` at its default active value, and set `IPQPS=15` (one comment per IP per 15 seconds; the default is 60 seconds). Waline also rejects highly similar repeated comments to reduce flooding. For stronger bot protection, configure Cloudflare Turnstile by adding both `TURNSTILE_KEY` and `TURNSTILE_SECRET` on the server and the matching client key. Redeploy the Waline server after changing its environment variables. Automatic publishing means a spam comment that passes these checks can still appear, so periodically check the Waline dashboard.

## 3. Administrator dashboard

1. Open [Waline registration](https://waline-comment-cds2jczdz-floralchai.vercel.app/ui/register).
2. Create your administrator account if you have not already done so. The first registered account is assigned administrator privileges.
3. Open the [Waline admin dashboard](https://waline-comment-cds2jczdz-floralchai.vercel.app/ui) and sign in.

Do not share administrator credentials with visitors.

## 4. Connect the Quartz website to Waline

The GitHub Actions workflows in **floralchai/sunshine** now use this Waline server URL by default:

```text
https://waline-comment-cds2jczdz-floralchai.vercel.app
```

No GitHub Actions variable is required for this configured server. The workflows still allow you to override the default later by setting the public repository variable `WALINE_SERVER_URL` under **Settings → Secrets and variables → Actions → Variables**.

Do not put database credentials or Waline server secrets in the website repository. Only the public server URL belongs in the client-side build.

## 5. Moderate comments

1. Open the [Waline admin dashboard](https://waline-comment-cds2jczdz-floralchai.vercel.app/ui).
2. Sign in with the administrator account.
3. Open the comment management view. With instant publishing (`COMMENT_AUDIT=false`), ordinary comments appear immediately; use the dashboard to remove any spam that gets through.
4. Read each pending comment and choose **Approve** to publish it. Reject or delete spam and unwanted comments.
5. Return to the pending list regularly. If you temporarily turn audit mode back on (`COMMENT_AUDIT=true`), only approved comments are visible to visitors.

## Theme and behavior

- Pastel pink, peach, yellow, mint, sky blue, lavender and violet styling.
- Source Serif 4 body text and Nunito controls, matching Tawny Flor.
- Original 8-bit style flower, heart, star, sparkle, rainbow and bunny emoji images are served from `/static/waline-emoji/`.
- Guest posting: no visitor login required and no email field required.
- New comments publish immediately when `COMMENT_AUDIT=false`; Akismet spam detection, a gentler 15-second per-IP rate limit, and duplicate-comment detection remain enabled.
- Each Quartz page has its own comment thread, using the current page path. Quartz SPA navigation updates the Waline instance without a full reload.
- The 404 page does not display a comment box.

## Official documentation

- [Waline installation](https://waline.js.org/en/guide/get-started/)
- [Client options](https://waline.js.org/en/reference/client/props.html)
- [Custom styling](https://waline.js.org/en/guide/features/style.html)
- [Custom emoji presets](https://waline.js.org/en/cookbook/customize/emoji.html)
- [Moderation and comment audit](https://waline.js.org/en/reference/server/env.html)
- [Waline security guidance](https://waline.js.org/en/guide/features/safety.html)
