# Leadersheet: design

Values live in `src/brand/presets/leadersheet/`. This file holds the reasoning. The original look and its reasoning live in `src/brand/presets/drafting/`.

## Concept

**The cheat sheet for leading people, printed in two fluorescent inks.** Every class is one sheet: the idea, a model you can move, the frameworks, a three question check, and a game. A cheat sheet is the thing you actually keep, so the site behaves like one: dense, marked up, quick to scan.

Proof points: sheets numbered S01 to S12 with title blocks, a highlighter on the one phrase that matters, and a logo that is a dog-eared sheet with one line highlighted.

## Name

Leadersheet: leader plus sheet, read like cheat sheet. Checked on 2 October 2026:

| | .com | .app | .io | .so | .co | .study | .lol |
|---|---|---|---|---|---|---|---|
| leadersheet | taken | free | free | free | free | free | free |

"Free" means unregistered at the registry (RDAP or whois), not a confirmed price; premium names look the same. No product called Leadersheet turned up in a web search. Runners-up: **Moveset** (moveset.io, .so, .study free; a fighting-game combo app owns moveset.app) and **Orgbox** (orgbox.app, .io free; a university research tool uses the name). Ruled out: Sandtable (a funded defense-AI company) and Orgami (two HR companies). Recheck with `npm run domains leadersheet` before buying.

## Voice

Register: a sharp classmate's notes. Short, concrete, a little dry, never cute.

- Uses: sheet, move, mark, check, play
- Never: unlock, journey, empower, leverage, synergy
- Hero: "Every LiO idea, built so you can move it."
- Error: "No sheet at this address. The set has twelve."
- Confirmation: "3 of 3. Sheet signed off."

## Color

Two spot inks on paper, like a Riso print. Paper and ink carry the page.

| Token | Light | Dark | Use |
|---|---|---|---|
| background | #f7f6ef | #0c0e13 | Paper and night |
| foreground | #13161c | #f5f3ee | Ink |
| signal | #f1228f | #ff6fae | Hot pink: lines, data marks, focus, the logo fold. One thing per view. |
| signal-text | #ca0d76 | #ff6fae | Pink when it has to be small text |
| signal-2 | #ddf93c | #d4f73e | Lime highlighter, always with ink text on top. One phrase per view. |

`npm run contrast` checks every pair; all pass in both modes. Pink is never an error color; wrong answers get a strike and an X in ink.

Category check: Chegg's amber (#EB7100) was verified; from memory, not verified, Quizlet leans indigo, Duolingo green, Coursera blue and Kahoot purple. Hot pink and a lime highlighter match none of them. The lime is lighter and yellower than a grass green and only ever appears as a highlighter fill.

## Type

Bricolage Grotesque for words (variable optical size and width) and Martian Mono for anything measured: sheet numbers, dates, scores. Both SIL Open Font License, self-hosted by `next/font`.

## Devices

1. **Highlighter swipe** behind one phrase per view (the hero, each sheet's big idea). Grows left to right once.
2. **Sheets and title blocks.** Every class is a numbered sheet with a title block; cards carry registration corners.
3. **Graph paper.** A faint 16 px and 64 px grid behind heroes, films and game cards. Never behind body text.

## Motion

Press 120 ms, interface 200 ms, highlighter 650 ms, all on `cubic-bezier(0.2, 0.7, 0.2, 1)`. The Remotion hero film builds an org chart and redraws it as four structures; each sheet has a 16 second recap film. Reduced motion holds still frames and shows marks already drawn.

## Study and Play

A header switch changes emphasis, never hides content. Play mode leads with the arcade, swaps the hero to "play it", puts each sheet's game first, and celebrates wins with a burst in the two inks.

## Anti-template checks

1. Font: pass. Neither face is a template default.
2. Accent: pass. Not a study-category color, not a library default.
3. Layout: pass. Organized around the sheet grid and the arcade, not a hero plus three cards.
4. Device: pass. Cover the logo and the highlighter, sheet numbers and title blocks still say Leadersheet.
5. Decoration: pass. No gradients, glows or glass; shadows are 1 px rings on selected controls.
6. Voice: pass.
7. Concept: the highlighter (marking up a cheat sheet), sheets (one per class), the pink fold (a dog-eared page). All trace to the cheat sheet.
