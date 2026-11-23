# Security

Leadersheet is a static site: no server code, no accounts, no database and no cookies. Progress is kept in your own browser (`localStorage`) and never sent anywhere. Anonymous usage counts go to Vercel Web Analytics, which sets no cookies.

## Reporting a problem

Please report privately through GitHub: **[Report a vulnerability](https://github.com/skirberg/leadersheet/security/advisories/new)** on this repository. Do not open a public issue for anything security-related.

Include what you found, where (a URL or a file), and how to reproduce it. You'll get an answer within a week. Fixes ship to the live site as soon as they're ready, and reporters are credited unless they prefer not to be.

## What's in scope

- https://leadersheet.io and its preview deployments
- This repository's code, build and check scripts

Out of scope: denial-of-service, automated scanner output without a demonstrated impact, and missing headers that don't lead to an exploit.

## What the site does to stay safe

- A strict Content-Security-Policy, set in `vercel.json`: same-origin scripts, styles, images and connections only (plus Vercel's preview toolbar), no plugins, no framing except by the owner's site.
- HSTS, `nosniff`, a strict referrer policy, a same-origin opener policy and a permissions policy that turns off camera, microphone, location and payment APIs.
- The local test server sends the same headers, so every QA and smoke run checks the pages under the real policy.
- No secrets in the repository; the IndexNow key in `public/` is public by design.
- Dependabot watches dependencies, and `npm audit --omit=dev` (what ships to the browser) is kept at zero.
