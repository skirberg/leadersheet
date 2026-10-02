# Leadersheet: design

Values live in `src/brand/presets/leadersheet/`. This file holds the reasoning. The original look and its reasoning live in `src/brand/presets/drafting/`.

## Concept

**The cheat sheet for leading people, printed in two fluorescent inks.** Every class is one sheet: the idea, a model you can move, the frameworks, a three question check, and a game. A cheat sheet is the thing you actually keep, so the site behaves like one: dense, marked up, quick to scan.

Proof points: sheets numbered S01 to S12 with title blocks, a highlighter on the one phrase that matters, and a logo that is a dog-eared sheet with one line highlighted.

## Name

Leadersheet: leader plus sheet, read like cheat sheet. No product called Leadersheet turned up in a web search.

Domains priced on 2 October 2026 with Vercel's public registrar API (first year, then yearly renewal):

| Domain | First year | Renewal | Note |
|---|---|---|---|
| leadersheet.app | $9.99 | $15 | Recommended home. Exact name, HTTPS only |
| leadersheets.com | $11.25 | $11.25 | Closest .com; leadersheet.com is taken |
| leadersheet.org | $9.99 | $10.99 | Fits a free learning resource |
| leading.how | $25 | $25 | Short vanity link |
| leadersheet.fyi | $7 | $7 | Cheapest steady price |
| lead.how | $372.90 | $372.90 | Premium |
| lead.ing | $33,000 | $33,000 | Premium |

Unavailable through Vercel: leadersheet.com, leadersheet.so. Cheap first years can hide steep renewals (leadersheet.study $1.99 then $35.56; leadersheet.io $14.99 then $46). Prices change; recheck before buying.

Runners-up: **Moveset** (moveset.io and .so unregistered; a fighting-game combo app owns moveset.app) and **Orgbox** (orgbox.app and .io unregistered; a university research tool uses the name). Ruled out: Sandtable (a funded defense-AI company) and Orgami (two HR companies).

### Naming study (2 October 2026)

Method after Lexicon Branding (David Placek's interview on Lenny's Newsletter): generate wide before judging, use separate territories including unrelated categories ("naming by indirection"), weigh sound symbolism (V alive, B reliable, Z attention), prefer compounds that add up to more than their parts, treat the extension as an area code, and test names as if a competitor had launched them.

About 45 names across seven territories: practice, leading in motion (cycling, flight), wayfinding, sheets and study, tennis, coined, compounds. Every evocative real word is taken on .com, .app, .co and .io.

| Name | Story | Best domain (first year, renewal) | Conflict |
|---|---|---|---|
| Leadersheet | The cheat sheet for leading people | leadersheet.app ($9.99, $15) | None found |
| Sandlot | The lot where you learn the game by playing, no stakes | sandlot.page ($11.99, $11.99) or sandlot.school ($9.99, $30) | Game studio, health IT; no learning product |
| Paceline | Riders take turns at the front and the group goes faster | paceline.page ($11.99, $11.99) | Fitness rewards app |
| Waymark | A mark that shows the path to those behind you | waymark.club ($6.99, $18.46) | AI video company |
| ChalkTalk | The coach's whiteboard session | Several | Ruled out: K-12 learning platform |

Decision: keep Leadersheet. Sandlot is the strongest bold alternative and the closest to the original Sandbox idea. A leadership app called Leaderly uses "Learn to Lead", so the wordmark line changed to "Leadership, one sheet at a time" (shown from 640 px up; phones show the name alone).

## Audience

Anyone who wants to learn to lead, not only one class. The public site is timeless: no course codes, no schedule. Class mode (a footer switch, or any link with `?class`) adds the schedule, a This week card and what is due on each sheet for people taking the course.

## Voice

Register: a sharp classmate's notes. Short, concrete, a little dry, never cute.

- Uses: sheet, move, mark, check, play
- Never: unlock, journey, empower, leverage, synergy
- Hero: "Leadership, built so you can move it."
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
