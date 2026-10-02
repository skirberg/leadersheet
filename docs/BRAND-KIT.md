# Brand kit: a new site in about an hour

This repo is the template. The brand is isolated in one folder, the components read only tokens, and the checks are scripts. To make a site for another brand, industry or idea: copy the repo, write a preset, swap the content, run the checks.

## What is fixed and what changes

| Fixed (reuse as is) | Changes per brand |
|---|---|
| Next.js static export, shadcn/Radix components, Remotion player wiring | `src/brand/presets/<id>/`: name, logo, tokens, favicon, app icon |
| Header, footer, ⌘K search, light and dark, Study and Play switch | Content in `src/data/` (here: sessions, frameworks, games) |
| QA, screenshot, icon, share-card, contrast and domain scripts | The signature component (here: the labs and the films) |

## The hour

**0 to 10 min. Concept and name.** One sentence a stranger understands, plus the proof behind it. Three voice lines: a hero, an error, a confirmation. Five name candidates, then:

```bash
npm run domains name1,name2,name3 com,app,io,so,co,study,fun
```

Search the web for each survivor; drop any name a live company in a nearby category already uses.

**10 to 25 min. Preset.** Copy `src/brand/presets/leadersheet` to `src/brand/presets/<id>` and edit:

- `brand.ts`: name, descriptor, title, description, emphasis (`"highlight"` or `"underline"`), author, repo, theme colors
- `tokens.css`: paper, ink and one signal color (plus an optional second for the emphasis device), light and dark. Tint the neutrals; pure grays read as a template.
- `logo.tsx`: a mark that works at 16 px and comes from the concept. One idea, three shapes at most.
- `favicon.svg` (with a dark-mode `@media` block) and `app-icon.svg` (full-bleed square)

```bash
npm run contrast <id>   # every pair must pass
npm run brand <id>      # switches the site and renders the icons
```

Check the accent against the category leaders' colors before you commit to it.

**25 to 45 min. Content and the signature piece.** Replace `src/data/*` and the labs with the new subject. Keep one signature, interactive thing per page; let everything else stay quiet.

**45 to 60 min. Check and ship.**

```bash
npm run check           # build, share card, then 100+ checks: crashes, 375 px overflow, axe in light and dark
npm run shots           # docs/shots and the two preview contact sheets for a portfolio
```

Commit, publish with GitHub Desktop under a personal account, import at vercel.com/new on a personal Hobby team. Every push after that goes live at the same link.

## Rules that keep it from looking templated

- Replace every library default (grays, radius, font, ring, shadow) before building a page.
- One accent, rationed: one marked element per view. It is never the error color.
- Fonts with a point of view; check the license covers web use.
- No gradients, glows or glass. Shadows only for elevation.
- Motion under 300 ms for interface, everything off under reduced motion.
- Text on any colored fill uses that fill's `-foreground` token, so contrast survives a palette swap.

## Presets in this repo

- `leadersheet` (active): paper, ink, hot pink signal, lime highlighter
- `drafting`: the original Leadership Sandbox look, paper, blue-black ink, red pencil underline
