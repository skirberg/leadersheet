# Contributing

Thank you for helping. The most valuable contribution is a correction: a reading, a number, a date or a framework that is wrong or out of date.

## Report a correction

Open an issue with the **Content correction** template: the page, what it says, what it should say, and a source. Every claim on the site has to trace to a source in [docs/SOURCES.md](docs/SOURCES.md).

## Change the code

1. Node 22.18 or later. `npm install`, then `npm run dev`.
2. Keep the change small and say why in the pull request.
3. Before you push, run what CI runs:

   ```bash
   npm run typecheck && npm run cases && npm run build && npm run previews && npm run voice && npm run smoke
   ```

   A change to layout or pages also needs `npm run qa` (every page at five widths in light and dark, with axe).

## House rules

- **Voice:** a sharp colleague's notes. Short, concrete, a little dry. Never: unlock, journey, empower, leverage, synergy (`npm run voice` enforces the list in `src/brand/presets/leadersheet/brand.ts`).
- **One accent per view.** Pink marks the one thing to look at; it is never an error color. Wrong answers get a strike and an X in ink.
- **Numbers are real text.** Animated numbers keep a plain-text copy (`src/components/motion/number.tsx`).
- **Every decision case** lands on a real row of its lesson's framework, and any model state it writes must be state that model reads (`npm run cases`).
- **Accessibility:** WCAG 2.1 AA, keyboard reachable, reduced motion respected, 44 px targets on touch.
- **No accounts, no cookies, no tracking beyond Vercel's cookieless analytics.** Progress stays in the visitor's browser.

## Content you contribute

By contributing code you agree it is released under the MIT license. Content (lesson text, cases, quiz items) is not open; see [NOTICE.md](NOTICE.md). Content corrections are welcome and are credited in the commit.

## Conduct

Be kind and specific. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
