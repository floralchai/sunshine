# Hyvor Talk setup for TawnyFlor

This repository embeds Hyvor Talk on each Quartz page.

## Website ID

The Hyvor Talk Console URL supplied for this site is:

`https://talk.hyvor.com/console/16849/settings/website`

The Website ID is **16849**. It is a public embed identifier, not an API key or password. It is now configured directly in `quartz/components/HyvorComments.tsx`; you do not need to create a GitHub Actions variable.

## Anonymous guest commenting

Hyvor Talk documents guest commenting as enabled by default. In the Console, confirm guest commenting remains enabled for this website. Guests can comment using a display name without signing in; an email address is optional by default.

## Require approval before comments appear

In the Hyvor Talk Console, open **Settings → Embed → Configuration** and enable site-wide **Pre-moderation**. This holds new comments for approval before they become visible. Moderators can review and approve them in **Console → Comments**.

The repository code cannot verify or change these account-level Console settings. Please confirm both guest commenting and pre-moderation in the Hyvor dashboard before considering moderation setup complete.

## Theme and page mapping

The embed uses TawnyFlor's pastel lavender/pink/blue/mint palette, Source Serif 4 and Nunito typography. Each page uses its Quartz slug as its stable Hyvor Talk page ID, so each note has its own discussion.

## Official documentation

- [Install with HTML](https://hyvor.com/talk/docs/install-html)
- [Guest commenting](https://hyvor.com/talk/docs/commenting)
- [Moderation and pre-moderation](https://hyvor.com/talk/docs/moderation)
- [Comments embed settings](https://hyvor.com/talk/docs/comments)
