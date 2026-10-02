# Drafting Table preset (the original Leadership Sandbox): design

The reasoning behind the original look. Values live in `tokens.css` next to this file.

## Concept

**A drafting table for leadership.** Session 1 calls the leader an architect: you shape behavior through the setting you design. So every class is a drawing sheet, every model is something you can pick up and move, and one red pencil marks what matters.

Proof points: sheets are numbered S01 to S12 like an architect's plan set; each sheet opens with a title block; the logo is a leader node inside a sandbox frame.

## Voice

Register: drafting room. Short, concrete, a little dry. Instructions read like notes on a drawing.

- Uses: build, draw, sheet, move, test
- Never: unlock, journey, empower, leverage, synergy
- Hero: "Every LiO idea, built so you can move it."
- Error: "No sheet at this address. The set has twelve."
- Confirmation: "3 of 3. Sheet signed off."

## Type

| Role | Face | Why | License |
|---|---|---|---|
| Speaks (headlines, body) | Bricolage Grotesque, variable opsz and width | Ink-trap grotesk with a hand-built edge; reads as drafted, not templated | SIL Open Font License, free, web and print |
| Measures (sheet numbers, dates, scores, labels) | Martian Mono | The annotation layer of a drawing; tabular and slashed-zero numerals | SIL Open Font License, free |

Both self-hosted at build by `next/font`, so no request goes to Google at runtime.

## Color

| Token | Paper (light) | Blueprint (dark) | Use |
|---|---|---|---|
| background | #f9f5ee | #0a1423 | Page |
| foreground | #171f2e | #f4f0e7 | Ink: text, primary buttons, lines |
| muted-foreground | #535b69 (6.3:1) | #9facba (8.0:1) | Secondary text |
| pencil | #d02f14 (4.7:1) | #f96c4a (6.4:1) | One mark per view |
| ok | #137d41 (4.8:1) | #58c97d | Right answers, with a check icon |

Rules: neutrals are tinted (warm paper, blue-black ink), never pure gray. The pencil is never an error color; wrong answers get a strike and an X icon in ink. The pencil is deliberately not the school's violet: this is an unofficial study tool and should not look like the school.

Nearest study-tool brand color checked: Chegg orange #EB7100 (brandcolorcode.com), OKLCH hue 51. The pencil #d02f14 sits at hue 32, a red vermilion rather than an amber orange.

## Devices

1. **Drafting grid.** 16 px minor, 64 px major, faint blue. Hero backgrounds, films, flashcard fronts. Never behind body text.
2. **Red pencil.** A hand-drawn underline or loop that draws once on entry. Hero line, each sheet's big idea, the leader node in the films and labs. Never on buttons, quiz options or body copy.
3. **Registration corners and title blocks.** Cards carry two corner marks; each sheet opens with a title block (sheet, class date, part).

## Motion

- Press 120 ms, interface 220 ms, pencil draw 700 ms, all on `cubic-bezier(0.2, 0.7, 0.2, 1)`.
- Remotion films: the hero builds an organization and redraws it as the four structures from session 3; every sheet has a 16 second recap film generated from its own data.
- Everything respects `prefers-reduced-motion`: the hero shows a still frame and the pencil appears already drawn.

## Study and Play

A header switch changes emphasis, never hides content. Play mode leads the home page with the arcade, swaps the hero to "built so you can play it", puts each sheet's game first under See it, and celebrates wins with a burst of red pencil strokes (never under reduced motion). The quizzes use original questions on the public models and say so: for fun, not validated assessments.

## Components

shadcn/ui on Radix, restyled from these tokens: default grays, radius, font, ring and shadows all replaced. Utility pieces (inputs, dialogs, tabs) stay quiet. The signature pieces got custom design: the labs, the films, the sheet cards and the title block.

## Anti-template checks

1. Font: pass. Neither face is on the template-default list.
2. Accent: pass. Not a category leader's color, not the library default.
3. Layout: pass. No centered hero with three feature cards; the page is organized as a plan set around the sheet grid.
4. Device: pass. With the logo covered, the grid, the title blocks and the red pencil still identify it.
5. Decoration: pass. No gradients, glows or glass; the only shadows are 1 px rings that mark a selected control.
6. Voice: pass. Headline, error and confirmation read as one voice.
7. Concept: grid (the drafting table), sheet numbers (a plan set), red pencil (the architect's markup), all trace to the leader as architect.
