# Hyvor Talk setup for TawnyFlor

This repository uses Hyvor Talk for comments. Visitors can post as guests without creating a Hyvor or GitHub account. Guest commenting is enabled by default in Hyvor Talk; keep it enabled in the Hyvor Talk Console.

## 1. Create the Hyvor Talk website

1. Open [Hyvor Talk](https://talk.hyvor.com/).
2. Sign in to your Hyvor owner account and create a website for `tawnyflor.neocities.org`.
3. In the Console, open **Settings → Website** and copy the numeric **Website ID**.

The Website ID is a public embed identifier, not a password. Do not put an API key or account password in the repository.

## 2. Enable anonymous guest commenting

In the Hyvor Talk Console, open the website's authentication/comment settings and make sure guest commenting is enabled. Hyvor Talk documents guest commenting as enabled by default. Visitors can submit a display name and optionally an email address; they do not need to sign in.

## 3. Require approval before comments appear

In **Console → Settings → Embed → Configuration**, enable **Pre-moderation** site-wide. This holds every new comment in Pending status until a moderator approves it. You can approve comments in **Console → Comments**.

Also check that no trusted-user rule bypasses pre-moderation for users who should remain subject to approval.

## 4. Add the Website ID to GitHub

In the GitHub repository:

1. Open **Settings → Secrets and variables → Actions → Variables**.
2. Choose **New repository variable**.
3. Set the name to `HYVOR_WEBSITE_ID`.
4. Set the value to the Website ID copied from Hyvor Talk.

The ID is read at build time by GitHub Actions. Pull-request builds can still run without it and will show a temporary setup message. The Neocities deployment workflow intentionally stops until the variable is configured, preventing a broken comments embed from being published.

## 5. Theme and page mapping

The embed uses TawnyFlor's pastel lavender/pink/blue/mint palette, Source Serif 4 and Nunito typography. Each page uses its Quartz slug as its stable Hyvor Talk page ID, so each note has its own discussion.

## Official documentation

- [Install with HTML](https://hyvor.com/talk/docs/install-html)
- [Guest commenting](https://hyvor.com/talk/docs/commenting)
- [Moderation and pre-moderation](https://hyvor.com/talk/docs/moderation)
- [Comments embed settings](https://hyvor.com/talk/docs/comments)
