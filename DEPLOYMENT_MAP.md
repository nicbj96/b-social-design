# Deployment Map

Last verified: 2026-05-11

## Live ownership

- `b-social.net` -> Cloudflare Worker `b-social-pages`
- `www.b-social.net` -> Cloudflare Worker `b-social-pages`
- `dashboard.b-social.net` -> Cloudflare Pages project `b-social-command-center`
- `b-social-design.pages.dev` -> Cloudflare Pages project `b-social-design`

## Repository role

This repository is for design and concept work only.

It must not deploy to:

- `b-social.net`
- `www.b-social.net`
- Cloudflare project `b-social`

## Required guardrail

The legacy workflow that published to `projectName: b-social` has been removed
from this local clone and should stay removed in the authoritative remote.
