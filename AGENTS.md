# Working on Leadersheet

For people and AI coding agents. Read this before changing anything; DESIGN.md has the reasoning behind the look.

## What it is

A static Next.js site (`output: "export"`): 24 lessons, each with an interactive model, a decision case, readings, frameworks and a three-question check, plus an arcade of quizzes and a practice area. No server, no accounts, no cookies. Progress lives in `localStorage` (`src/lib/store.tsx`).

## Before you call a change done

Run what CI runs, and say what you ran:

```bash
npm run typecheck && npm run lint && npm run tokens:check && npm run contrast && npm test && npm run cases && npm run build && npm run previews && npm run voice && npm run smoke
```

Layout or page changes also need `npm run qa` (every page at 320 to 1280 px, light and dark, axe; `QA_ONLY=/a/,/b/` checks just those pages after a fix). QA sees each page once it has loaded and settled, before any tap, so check the states after a tap (a result, a reveal) yourself. It skips the share-card sources under `/og/` (pictures, not pages; `npm run brand:check` covers them). Done means seen working in the built site, not only compiled. `scripts/serve.ts` sends the production headers from `vercel.json`, so a Content-Security-Policy problem shows up as a page error in these checks.

## Rules

- **Content is sourced.** Every reading, number and claim traces to `docs/SOURCES.md`. Don't invent statistics, studies or quotes. Decision cases must land on a real framework row (`npm run cases`).
- **Voice:** short, concrete, a little dry, never cute. The banned words are in `BRAND.never` and `npm run voice` fails on them.
- **Design:** tokens only. Their source is `src/brand/presets/<preset>/tokens/` (W3C design tokens: primitives, then light, dark and high-contrast themes); `npm run tokens` writes `tokens.css`, `tokens.ts` and `public/tokens.json` from it, and CI fails if they drift. Code reads colours from CSS variables, or from `COLORS` in `@/brand` where CSS cannot reach (a canvas). One pink accent per view, pink is never an error color, 44 px touch targets, reduced motion respected, durations from `--dur-*`. Rolling numbers keep a plain-text copy (`Num`). Components inside a lesson's model size by container queries (`@container` on `LabFrame`), not the window.
- **Grid:** every page is a `page` and every block takes a span (`span-wide`, `-head`, `-center`, `-rail`, `-main`, `-read`) so its edges fall on column lines; no page sets its own width. Widths inside a block are `max-w-cols-N`. The numbers are layout tokens; DESIGN.md (Grid) has the system, `?grid` on any address draws it, and `npm run qa` fails anything off it.
- **No new trackers, cookies or third-party scripts.** The CSP in `vercel.json` will block them; changing it is a reviewed decision.
- **Share cards:** every page names a 1200 x 630 card that robots.txt lets bots fetch (`npm run previews`). Don't disallow `/og/*.png`.
- **Every surface ships with the feature.** `npm test` (`test/surfaces.test.ts`) fails until a new game has its own card (`npm run build && npm run og`), a link and the right count in the README, and every analytics event is listed under "What we count" in `docs/PLAN.md`. Also update `/built/`, `llms.txt` (`src/lib/seo.ts`) and the screenshots (`npm run shots`) when the change shows there.
- **Deploys** happen from `main` through Vercel's Git integration. Don't deploy from a session.
- **Never commit** secrets, `.env` files, personal data or anything from `docs/` that is marked private.

## Map

- Plan: `docs/PLAN.md`: where the product stands, the bets in order with their evidence and metric, and how a week of work runs. Read it before proposing work.
- Content: `src/data/` (`course.json`, `cases.ts`, `labs.ts`, `games.ts`, `results.ts`, `daily.ts`, `jds.ts`, `rewind.ts`, `brs.ts`; network constraint in `src/lib/network.ts`). Every check option has a `not` line saying why it is wrong; Rewind conversations are walked path by path in `npm run cases`.
- Models: `src/components/labs/`; lesson page: `src/app/learn/[id]/page.tsx`
- Frameworks: `src/app/frameworks/`; search and structured data: `src/lib/seo.ts`
- Brand presets: `src/brand/`; checks and tools: `scripts/`
