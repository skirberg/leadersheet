# Leadersheet: design

Values live in `src/brand/presets/leadersheet/tokens/` (W3C design tokens, generated into the CSS, the TS and `/tokens.json`; see "The system under the look" below). This file holds the reasoning. The original look and its reasoning live in `src/brand/presets/drafting/`.

Updated 11 November 2026 to match the code. The 6 November redesign (commits 2fa8873 to 359c267) built the preset on Brilliant's measured system: black ink on an oat page with white cards, pills and 28 px card corners, Noticia Text and Instrument Sans, no highlighter, no title blocks and no recap films. Color, Type, Devices and Motion below describe the site as built; Concept and the anti-template checks still describe the cheat-sheet look that came before it.

## Concept

**The cheat sheet for leading people, printed in two fluorescent inks.** Every lesson is one sheet: the idea, a model you can move, the frameworks, a three question check, and a game. A cheat sheet is the thing you actually keep, so the site behaves like one: dense, marked up, quick to scan.

Proof points: numbered sheets with title blocks, a highlighter on the one phrase that matters, and a logo that is a dog-eared sheet with one line highlighted.

## Name

Leadersheet: leader plus sheet, read like cheat sheet. No product called Leadersheet turned up in a web search.

**Chosen 8 October 2026: leadersheet.io**, registered through Vercel. leadersheet.xyz redirects to it (308).

Domains priced on 2 October 2026 with Vercel's public registrar API (first year, then yearly renewal):

| Domain | First year | Renewal | Note |
|---|---|---|---|
| leadersheet.app | $9.99 | $15 | Recommended at the time; leadersheet.io was chosen |
| leadersheets.com | $11.25 | $11.25 | Closest .com; leadersheet.com is taken |
| leadersheet.org | $9.99 | $10.99 | Fits a free learning resource |
| leading.how | $25 | $25 | Short vanity link |
| leadersheet.fyi | $7 | $7 | Cheapest steady price |
| lead.how | $372.90 | $372.90 | Premium |
| lead.ing | $33,000 | $33,000 | Premium |

Unavailable through Vercel: leadersheet.com, leadersheet.so. Cheap first years can hide steep renewals (leadersheet.study $1.99 then $35.56). Prices change; recheck before buying.

Runners-up: **Moveset** (moveset.io and .so unregistered; a fighting-game combo app owns moveset.app) and **Orgbox** (orgbox.app and .io unregistered; a university research tool uses the name). Ruled out: Sandtable (a funded defense-AI company) and Orgami (two HR companies).

### Naming study (2 October 2026)

Method after Lexicon Branding (David Placek's interview on Lenny's Newsletter): generate wide before judging, use separate territories including unrelated categories ("naming by indirection"), weigh sound symbolism (V alive, B reliable, Z attention), prefer compounds that add up to more than their parts, treat the extension as an area code, and test names as if a competitor had launched them.

About 45 names across seven territories: practice, leading in motion (cycling, flight), wayfinding, sheets and study, tennis, coined, compounds. Every evocative real word is taken on .com, .app, .co and .io.

| Name | Story | Best domain (first year, renewal) | Conflict |
|---|---|---|---|
| Leadersheet | The cheat sheet for leading people | leadersheet.io (chosen) | None found |
| Sandlot | The lot where you learn the game by playing, no stakes | sandlot.page ($11.99, $11.99) or sandlot.school ($9.99, $30) | Game studio, health IT; no learning product |
| Paceline | Riders take turns at the front and the group goes faster | paceline.page ($11.99, $11.99) | Fitness rewards app |
| Waymark | A mark that shows the path to those behind you | waymark.club ($6.99, $18.46) | AI video company |
| ChalkTalk | The coach's whiteboard session | Several | Ruled out: K-12 learning platform |

Decision: keep Leadersheet. Sandlot is the strongest bold alternative and the closest to the original Sandbox idea. A leadership app called Leaderly uses "Learn to Lead", so the wordmark line changed to "Leadership, one sheet at a time" (shown from 640 px up; phones show the name alone).

## Audience

Anyone who wants to learn to lead. Leadersheet is a standalone product: the site is timeless, with no schedule and no dates.

## Voice

Register: a sharp colleague's notes. Short, concrete, a little dry, never cute.

- Uses: sheet, move, mark, check, play
- Never: unlock, journey, empower, leverage, synergy
- Hero: "Learn leadership by doing." Under it: "24 hands-on lessons. Free, no sign-up."
- Error: "No lesson at this address. There are twenty-four."
- Confirmation: "Right." and the reason; the streak: "1 day in a row. Today counts."

(20 November 2026: these three lines now match the live site. The earlier hero line was rejected on 6 November and is not used anywhere; the /brand/ page takes its voice examples only from live copy.)

Less text is the default. A list item is a title, not a title and a summary; a number gets a two- or three-word label, not a sentence; a section gets a heading, not a paragraph explaining it. The lesson's own idea line appears once, on the lesson. When something needs explaining, the model or the question should do it.

## Color

Two spot inks on paper, like a Riso print. Paper and ink carry the page.

| Token | Light | Dark | Use |
|---|---|---|---|
| background | #f5f3f1 | #0c0e13 | Oat page and night |
| card | #ffffff | #14171d | Cards sit white on the page |
| foreground | #000000 | #f5f3ee | Ink |
| signal | #f1228f | #ff6fae | Hot pink: lines, data marks, focus, the logo fold. One thing per view. |
| signal-text | #ca0d76 | #ff6fae | Pink when it has to be small text |
| signal-2 | #ddf93c | #d4f73e | Lime. Since the redesign it appears only in one stroke of the win burst (the app icon is black, white and pink). |

`npm run contrast` checks every pair; all pass in both modes. Pink is never an error color; wrong answers get a strike and an X in ink.

Category check: Chegg's amber (#EB7100) was verified; from memory, not verified, Quizlet leans indigo, Duolingo green, Coursera blue and Kahoot purple. Hot pink and a lime highlighter match none of them. The lime is lighter and yellower than a grass green and only ever appears as a highlighter fill.

## Type

Noticia Text for headlines, Instrument Sans for text and numbers (its tabular figures stand in for a mono: `font-mono` points at it), Funnel Display for the wordmark, outlined, and Martian Mono for the labels in the home drawing. All SIL Open Font License, self-hosted by `next/font`.

The scale was set on 20 November 2026 from Brilliant's own, measured on its live problem player (its sizes, weights and colours read from the page's CSS). Before it the site used about 25 sizes, set most reading text at 15 px, and put explanations in small grey type. Brilliant's problem card uses three sizes you read. The roles:

| Role | Size | Where |
|---|---|---|
| Label | 14 px, sentence case, 500, grey (`.label-mono`) | "Question 1", "Lesson 11 of 24", grades, counts. Grey is for labels only. Never capitals (below) |
| Meta | 14 px (`text-sm`) | dates, sources, small print |
| Body | 16 px, line-height 1.5 (`text-base`) | choices, buttons, lists, table cells |
| Read | 20 px, line-height 1.5, full ink (`.t-read`) | a case's setup, an outcome, the reason in a feedback banner, a reading's key line |
| Question | Noticia 24 px (`.t-question`), 30 px on wide screens where it stands alone | every question you answer |
| Titles | Noticia 30, 36 and up | sections and pages |

The pieces that carry them, in `globals.css`:
- `.choice`: at least 52 px tall, 14 px radius, hairline border; picked is ink-bordered on the muted fill.
- `.feedback`: verdict first as a label, then the reason at 20 px in ink, then what happens next. The ok tint marks a strong or right answer; anything else is neutral. Never the pink accent, and never coloured text for the sentence itself: Brilliant's and Duolingo's green and red explanation text measured under 4.5:1.
- `.chip`: 36 px tall, full radius, hairline; the current one is filled.

Brilliant's own rules kept with them: one question per screen where there is a sequence, the explanation never smaller than the question it answers, and grey never on a sentence someone has to read.

**Sentence case, and a label only where it earns its place (22 November 2026).** Measured at 390 px that day: the live site set 67 labels in capitals on six pages, and 1,215 across every page and result. Apple and iPhone pages had 1 to 2 (a band's name, a phone number), Linear 2, Stripe 4 (inside a drawn product screen), Brilliant none on its home page and one repeated "New" badge on its courses page. Monte and Truffle had none. Material 3 sets every label in sentence case, Apple's HIG says to choose one style per kind of element, Stripe's components use sentence case, and GOV.UK says capitals are 13 to 18% harder to read (research notes kept outside the repo).
- No style sets text in capitals and nothing is typed in capitals, acronyms aside (BATNA, GROW, SPLIT, WCAG). A label is the meta size in sentence case, set apart by weight and grey. The label above a chart's axis, a chart's ends and the "You" in a dot follow the same rule.
- A label stays only when it says something the heading, number or control does not: where you are ("Lesson 11 of 24"), what a number is ("Days in a row"), a verdict ("Strong call"), or an axis. It goes when it repeats the heading, states the obvious ("Your result" over a result, "Your job" over a survey of your job), explains the interface ("Keys 1 to 7 answer", "Or drag across the ring"), or restates a number the drawing shows.
- `npm run voice` fails on an uppercase style in the source and on a word in capitals that is not on its acronym list, in the built pages and in copy that appears only after a tap.
## Grid (22 November 2026)

**Decision: one page grid, and every block on it.** Before it each page set its own width (thirty different `max-w` values, eight text measures, 81 one-off pixel sizes) and centred itself, so at 1440 px the left edge of the content sat at 124, 144, 148, 244, 254, 292, 304, 324, 338, 344 or 392 px depending on the page, while the header started at 117. Every move between pages shifted the page sideways.

The system is base-ui.com's, measured with a browser on its live site: equal columns, fixed gutters and margins, a label column on the left and the content from a column line, three type sizes. Material 3's window classes set the breakpoints, and the numbers were chosen so they come out whole:

| Window | Columns | Gutter | Margin | Between sections |
|---|---|---|---|---|
| under 640 px | 4 | 16 px | 16 px | 48 px |
| 640 to 1023 px | 8 | 24 px | 32 px | 56 px |
| 1024 px and up | 12 | 24 px | 48 px | 64 px |

The frame stops growing at 1200 px: twelve 78 px columns and eleven 24 px gutters. Every value is on the 8 px grid. They are design tokens (`layout` in `tokens/primitives.tokens.json`), so `tokens.css` sets `--cols`, `--gutter`, `--margin`, `--section` and `--frame` per window size, `tokens.ts` exports them as `LAYOUT`, and `/tokens.json` publishes them.

**How a page uses it** (`globals.css`). A page is a `page`: the frame, its columns, a section's height above and between its children. Each block takes one of six named spans, so its edges fall on column lines at every width:

| Span | Phone | 640 px | 1024 px | For |
|---|---|---|---|---|
| `span-wide` | 1 to 4 | 1 to 8 | 1 to 12 | index pages, the arcade |
| `span-head` | 1 to 4 | 1 to 6 | 1 to 8 | a page's title and intro |
| `span-center` | 1 to 4 | 2 to 7 | 3 to 10 | the home opening, Your sheet |
| `span-rail` | 1 to 4 | 1 to 8 | 1 to 3 | what a section is: its name, the way back, the lesson list |
| `span-main` | 1 to 4 | 1 to 8 | 4 to 12 | the section itself |
| `span-read` | 1 to 4 | 1 to 6 | 4 to 10 | running text, 690 px wide at most (about 70 characters) |

Rail and main are base-ui.com's label column: on a lesson, a framework, a game, Today's call, Built, Brand and every home section after the opening, the name sits in columns 1 to 3 and the content starts on column 4. A section that holds both is `grid-cols-subgrid`, so its children land on the page's own lines. Lessons and games keep to eight of the nine main columns (`max-w-cols-8`, 792 px), the width their models were drawn for. Card lists put the gutter between cards: the arcade is four cards of three columns on all twelve and three in a main column. `max-w-cols-N` gives a block the width of N columns anywhere inside a page, and `cols-label` makes a name-and-description row whose name is exactly three columns wide. The header bar and the footer use the same frame (`frame`), so their edges are the first and last column lines.

**Seeing it.** `?grid` on any address draws the columns over the page (`src/components/site/grid-overlay.tsx`), using the same grid, so the drawing cannot disagree with the page.

**Keeping it.** `npm run qa` measures every page at 320, 375, 768, 1024 and 1280 px in both themes. It fails when a placed block (`span-*`) or the header bar does not start and end on a column line within 1.5 px, and when a page has no page grid at all. A 7 px nudge to one block fails it at every width. `test/grid.test.ts` fails when a page centres a width of its own instead of using `page`, or when the layout tokens stop adding up (whole-pixel columns at 1200 px, 4, 8 and 12 columns, everything on 8 px).

**Components.** The interactive primitives are Base UI's (`@base-ui/react`): the search dialog, Practice's tabs, the models' sliders, checkboxes and segmented controls. Same team as Radix, Floating UI and Material UI, and the library base-ui.com documents. The wrappers in `src/components/ui/` keep the props they had, so nothing that uses them changed. A slider's thumb is now a native range input, which is what takes focus and keys. A checkbox is a span, which a wrapping label names only once the page's code runs, so `CheckRow` names it with `aria-labelledby` in the page as sent. Button's `asChild` uses Base UI's `mergeProps`, so it stays a server component.

## Devices

1. **Serif italic emphasis** on one phrase per view (the hero, each sheet's big idea), set in Noticia Text (`src/components/brand/emphasis.tsx`). It replaced the highlighter swipe.
2. **Sheets.** Every lesson is one sheet; sheet numbers survive in the search palette. The title blocks were removed on 6 November.
3. **Graph paper.** A faint grid behind the home drawing. Never behind body text.

## Motion

Press 120 ms, interface 200 ms, drawing 650 ms, all on `cubic-bezier(0.2, 0.7, 0.2, 1)`, as tokens (`--dur-press`, `--dur-ui`, `--dur-draw`, `--ease-draft`); no hand-set durations are left except the two timer bars, which move at their clock's tick. A move to another page crossfades at the interface speed (view transitions; nothing under reduced motion). The home hero shows a finished org chart, tours the four structures once, then hands them to the visitor: drag sideways, tap a structure or use the arrow keys, and an ink marker slides along the rail; a button pauses it. The sheet recap films were removed on 6 November. Reduced motion holds still frames and shows marks already drawn.

## Lessons first, games first

A header switch changes emphasis, never hides content. It was called Study and Play until 19 November 2026; "Play" sat beside the Play tab and read as the same thing, so it is now named for what it puts first. Games first leads with the arcade, swaps the hero to "by playing", puts each sheet's game first, and celebrates wins with a burst in the two inks. The stored values are still `study` and `play`, so saved progress carries over.

## Site map

Home, Learn, Play, Practice and Frameworks, the same five in the header and the phone tab bar.

- `/learn/` is the course as a path: seven parts as units, the twenty-four lessons as stops on one line, the next one outlined. A lesson runs See it, Your call, Readings (key points fold away), Frameworks, Check yourself.
- `/frameworks/` is every framework on one page; each of the 54 also has its own page (`/frameworks/<id>/`): the framework in a line, its parts, the lesson to try it in, the readings that lesson is built on (labeled as such, since they are not always where the framework began) and related frameworks. These are the pages people and answer engines find when they search a framework by name. Since 22 November 2026 a framework page's heading leads with the name people search ("Kotter’s 8 steps of change", not "Eight steps of change"; `FW_HEADING` in `src/lib/search-terms.ts`), the frameworks page links each card with that heading, and a framework a game plays links to it by the game's searched name ("Leadership style quiz").
- Search words lead (22 November 2026). Search visitors so far nearly all came on the name. Page one for a quiz or tool search is won by single pages whose title starts with the search ("Free Values Card Sort Online", "Free Conflict Style Test 2026, 20 Questions"), so a game's tab title and h1 lead with the searched name and keep its own title on screen ("Leadership style quiz: which of Goleman’s six is yours?"), its card in the arcade is labeled with that name instead of the kind ("Conflict style quiz · 2 min"), and under the game a line links the framework it plays and the lesson that teaches it. All in `src/lib/search-terms.ts`; `test/seo.test.ts` holds titles to the length a search result shows. No FAQ or HowTo markup: no page shows a FAQ, and Google dropped both kinds of result for sites like this.
- `/today/` is Today's call: one lesson case a day, the same for everyone on that calendar day, going round all 24 before any repeats. You choose, say how sure you are, then every call takes its mark where it stands: yours says what follows, the others open on a tap, and the framework's rail shows where each lands. The home page links it under the hero. One call keeps the streak.
- `/today/class/` runs today's call, or any lesson's case, with a room: everyone decides alone, a show of hands, two to four minutes talking to someone who chose differently, a second vote, then the reveal and how the room moved (Crouch and Mazur 2001). Big type, arrow keys, full screen, nothing stored.
- Checks: you pick, say how sure you are, then the right answer and yours say why, and every other option says why not on a tap. A right answer on a guess comes back for review; Practice shows how often "sure" was right.
- `/play/bounce/` is the Brief Resilience Scale, word for word, scored on PhenX's bands. `/play/network/` maps the people you talk work through with and scores Burt's network constraint (checked against his worked example); names stay in the browser.
- `/play/job/` is the Job Diagnostic Survey, scored against Hackman and Oldham's norms as bands, never percentiles. `/play/rewind/` is a feedback conversation you play line by line and can rewind.
- Review: a question missed in a lesson's check or a drill comes back the next day, then 3, 7 and 21 days after each right answer, and is learned after that; a miss starts it over (`src/lib/review.ts`). Practice opens on Review when something is due, and the home page says how many are back.
- `/play/` is the arcade; every quiz result has its own page and card. `/practice/` is the drill, the final test, matching and flashcards.
- `/sheet/` is Your sheet: everything you have done, on one page (see below). Reached from Practice, Play, the footer, search and every new result; it is not a sixth tab, so the five stay the same in the header and the phone tab bar.

## Streak

Days in a row with some learning (an answer, a decision, a lab or a game), counted in the visitor's own time zone and kept in their browser. It shows at the end of a check, under the home buttons, on Practice and, on wide screens, as a flame in the header. It says what keeps it going and never scolds: no lost-streak alarms, no freezes to buy.

## Your call

Every lesson has one decision case after its model: who you are, what just happened, and what you do. A choice says what follows and why, marks the row of the lesson's framework it uses, and, in the fifteen lessons whose model keeps state, moves that model. Before the first move the case saves whatever the visitor had entered, and "Put back what I had" restores it. Grades are Strong call, Trade-off and Costly; a costly choice gets an X in ink, never pink.

## Anti-template checks

1. Font: pass. Neither face is a template default.
2. Accent: pass. Not a study-category color, not a library default.
3. Layout: pass. Organized around the sheet grid and the arcade, not a hero plus three cards.
4. Device: pass. Cover the logo and the highlighter, sheet numbers and title blocks still say Leadersheet.
5. Decoration: pass. No gradients, glows or glass; shadows are 1 px rings on selected controls.
6. Voice: pass.
7. Concept: the highlighter (marking up a cheat sheet), sheets (one per lesson), the pink fold (a dog-eared page). All trace to the cheat sheet.

## Brand kit (20 November 2026)

**Decision: one generated kit, drawn from the preset, that cannot drift from the site.** `/brand/` shows it and `npm run brand:kit` makes it. The mark is not redrawn: every logo file is the preset's own `LogoMark` and `Wordmark` as the site renders them (`/og/brand/`), recoloured by role. Ink, paper and signal each map to a variant: colour (as drawn), reversed (the dark theme's ink, card and pink), and black and white in one colour, where the card is punched out so the ground shows through. The lockup sets the mark and the name side by side, the name's ascenders half the mark's height, a quarter of the mark apart; that quarter (the tile's own corner radius) is also the clear space. The banners use the home page's own lesson cards and headline, so the kit shows the product, not a template.

How it stays current: the build packs `kit.json` and `kit.zip` from the files the site serves (prebuild), every generated image is recorded with the hash of its sources in `src/brand/generated.json`, and `npm run brand:check` (in CI) fails when a source changed and its image did not, when an image was edited by hand, when `LogoMark` and `favicon.svg` disagree, when the maskable icon leaves the safe circle, or when `kit.json` and the served files differ. `-- --live <url>` checks the live site the same way, and the Live brand kit workflow runs that after every push to main and once a day. The tab-icon cache version is now the icons' own hash instead of a date someone had to bump.

The installed app's shortcuts (long-press the icon: Today's call, Lessons, Play, Practice) each have a 96 px icon of their own, the glyph the site's navigation uses for that section, white on the app icon's black (22 November). Same pattern as X's and Google's installed web apps. `npm run icons` draws them from lucide's own files, so they match what the site shows.

The first run found five share cards on the live site that still said "No style leads" after the result text had become "No clear lead"; they were redrawn.

## Share cards (22 November 2026)

**Every page people share has a card of its own; only the home page and the missing page use the site's.** A live check found the home page, Today's call, the values card sort and How it's built all sending the same `/og.png`. Now every game, Today's call, class mode, Practice, Learn, Frameworks, the values mirror, How it's built and Brand has its own card (`src/components/og/page-cards.tsx`, drawn from `/og/card/<id>/`), and every framework has one with its parts (`/og/framework/<id>/`) instead of borrowing its lesson's. `npm run previews` now fails a page that falls back to `/og.png`.
- One frame for all of them (`share-card.tsx`), the one Team math and the result cards use: wordmark, a kicker in the words people search, the title with one phrase in the serif italic, one line, a foot that says what you get; the page's own content on a white card at the right.
- The card shows the thing itself: a quiz's first question with its choices in the order the game deals them, the card sort's thirty-two values, the job survey's five scales with the typical job marked, the first lines of Rewind, the course's seven parts, the review schedule from `src/lib/review.ts`, the installed versions. Today's call changes daily, so its card shows what every call gets (its mark, how sure you were), not a case.
- Sentence case only, no all-caps text, and no word that does not earn its place (the owner, 22 November 2026). Pink only where the game itself uses it (you on the network map, the latest step climbed); grades are a green check, a dot and an ink X.


## Your sheet, Team math, How do you decide? (20 November 2026)

Built after opening 16Personalities, Spotify Wrapped, Duolingo's year in review, Nicky Case's Evolution of Trust and Parable of the Polygons, Bartosz Ciechanowski's Bicycle and Brilliant live at phone and desktop size (the research notes and screenshots are kept outside the repo); what was taken from each is below and in the pull request.

**Your sheet (`/sheet/`) makes the name true again, without the cheat-sheet costume.** No highlighter, no title blocks: one white sheet on the oat page, the tilted-card mark at its corner (the shape Leadersheet owns, now seen outside the browser tab), and four parts: your calls (one mark per lesson, Strong call in the ok green, Trade-off a filled dot, Costly an X in ink, never pink, plus how many of Today's calls you made), how you lead (every quiz and test result, "No single way" included), what you value (the five, whether last week agreed, and what the mirror said), and games. It is built from what the browser already keeps; nothing new is stored to make it.
- Empty, it shows what will appear and one action: Make your first call (lesson 1's decision).
- Send: Duolingo chose a card "that worked like an image" over sharing the page, and Wrapped cards are already the shape of where they go, so the sheet is drawn in the browser as one 1080 x 1350 image (4:5, the shape of a sheet, posted whole everywhere) and handed to the share sheet with `navigator.share({ files })` where the device can share files. The image is drawn before the tap because Safari opens the share sheet only straight from a tap. Elsewhere: copy the link, then a field to copy by hand.
- The link carries the sheet after `#`, as the values mirror does, so a copied link shows the same sheet (read-only, with Make your first call under it). Names of people who answered your mirror never travel in it.
- Print: the site chrome hides and the light theme prints even from dark mode.
- The address: `/sheet/` held the frameworks list until 19 November, then redirected to `/frameworks/`. Vercel sent that redirect with `cache-control: max-age=0, must-revalidate` (checked 20 November), so no browser keeps it; the redirect is gone and an old `/sheet/#<framework>` link still lands on that framework's page.

**The mirror closes its loop.** The values card sort's result now stays (it vanished when you left the page, and the mirror link with it). A friend who answers your mirror sends back a link to `/sheet/` carrying their five; opening it puts their answer on your sheet.

**Team math (`/play/team/`) is the piece built to be passed around.** Paced the way Nicky Case paces one idea: a bet first (six people have 15 lines; double the team: 30, 45 or 66?), the reveal as the team grows one person at a time with the newcomer's lines in pink (the one pink thing: what one more person costs), then the drag from 3 to 20 with a curve of lines against people, then a round with a plot twist: split three growing teams, measured by the busiest person, and too many pods drowns the leads. The drawing is the control, as in Ciechanowski's pieces; a slider does the same for keyboards. SVG, no new library: 190 lines at most.

**How do you decide? (`/play/decide/`) is honest by construction.** Ten situations, each a real trade-off, each offering one answer in each of four ways on Tannenbaum and Schmidt's continuum (Tell, Sell, Consult, Join). The same lead rule as every quiz (more than half of a way's chances and more than any other): a unit test shows random answers get a style about 8% of the time. On 16Personalities, answering every statement at random gave a confident type and a flattering page (checked 20 November 2026); "for fun, not a validated assessment" stays. The result shows every answer on the line, so a spread shows where you moved, and names two lessons that help.

## Show, don't tell (20 November 2026)

The owner, on 20 November: too much text. Every screen a visitor sees was counted at 390 and 1440 (words with a letter on the first screen, a closed fold not counted), the heaviest were reworked, and the references were opened live first (notes and screenshots are kept outside the repo). Rule for every result from now on: the picture first, one short line where words are needed, the explanation one tap away, never deleted.

- **A decision's result** (Today's call, a lesson's Your call, class mode) is drawn with `src/components/learn/call-parts.tsx`. The calls stay where they were picked and take their marks (NYT Games reveals in the grid you played; Brilliant explains where you answered). Yours says what follows; each other call's grade word is the control that opens its reason. **The framework rail** replaces the chips and the row sentence: one stop per row, every call's mark standing on its row, the row in focus named under its stop; opening another call slides the name along (OWID and ZoLa write the name on the thing). A lesson's case shows only your mark, so picking another moves it.
- **A check's reveal** keeps the feedback banner from the type scale (the verdict, your reason, the answer); under "Why not the others" each option opens its line on a tap.
- **A score against a norm** (the job survey) is a bar on its own scale with the norm's tick labeled on the bar (PageSpeed Insights draws every metric this way). A band word appears only when the difference is real.
- **A conversation's outcome** (Rewind) is a line from the dashed level where it started, a step per line, the line's mark on each step, drawn from the same `open` numbers that choose the ending (a chess review's evaluation graph).
- **Counts** are numbers with two- or three-word labels in a hairline row (no caption boxes), with a small drawing where it helps; records are rows of marks (GitHub, Wordle).
- **Steps** are stops on a line, never numbered pills; **progress** is a tick per question and its count, with no label over it.

Words, live site before (with the type scale) and this build after (words with a letter; a closed fold not counted; "whole" is the whole result):

| Screen | 390 first screen | 1440 first screen | Whole |
|---|---|---|---|
| Today's call, the result | 169 → 125 | 169 → 92 | 212 → 135 |
| Diagnose your job, the result | 85 → 42 | 147 → 56 | 195 → 108 |
| Diagnose your job, the intro | 99 → 73 | 151 → 79 | 164 → 141 |
| Rewind, finished | 103 → 90 | 103 → 90 | 381 → 276 |
| Rewind, the intro | 97 → 83 | 150 → 129 | 160 → 142 |
| Class mode, the reveal | 89 → 79 | 152 → 94 | 152 → 94 |
| A lesson's Your call, after a pick | 89 → 89 | 131 → 96 | 131 → 96 |
| A lesson's check, one question revealed | 86 → 60 | 86 → 60 | 86 → 60 |
| Practice | 60 → 39 | 83 → 59 | 89 → 65 |

## The system under the look (22 November 2026)

The owner asked for every site to be top tier in its systems as well as its look, with the look kept. Researched first (notes and sources kept outside the repo): the W3C Design Tokens format, GitHub Primer, Linear's 2024 redesign, Vercel Geist, APCA, Utopia, Next.js's view transitions guide and web.dev Baseline. What changed under the look, and why:

**One source for the tokens.** `src/brand/presets/leadersheet/tokens/` holds the DTCG 2025.10 files: `primitives.tokens.json` (raw values), `light` and `dark` (the semantic layer), `light-more` and `dark-more` (high contrast), tied together by `resolver.json` as the spec's Resolver module describes. `npm run tokens` writes `tokens.css` (what the page uses), `tokens.ts` (typed colours and motion for code that cannot read CSS: the sheet image, the theme-color meta, the web manifest) and `public/tokens.json` (every theme resolved, for people and agents building on the brand). `npm run tokens:check` in CI fails when any of the three is not what the source makes. Edit the JSON, never the CSS.
- **Two layers, as Primer does.** Primitives are raw values and never reach the page; the semantic layer (surface, text, action, border, accent, data, state) only aliases them, and the generator fails on a raw value there. Each semantic name is its CSS variable, so every class in the code kept working.
- **Primitives are OKLCH, named by lightness.** `paper.965` is OKLCH lightness 96.5%, so the gap between two names reads as their lightness gap (Linear moved its themes to a perceptual space for the same reason). Every value is the colour it was: the generator proves each OKLCH lands on its old hex. The CSS ships that exact sRGB, with the OKLCH beside it in a comment: the palette is all inside sRGB, and an `oklch()` value came out of the CSS minifier as hex plus a `lab()` copy that blended card corners a shade differently. With sRGB in the CSS, all 67 share cards and the kit's images rendered byte for byte as before.
- **Not taken:** Display P3 (Geist uses it). It would make the pink hotter on most phones and laptops, which is a brand decision, not a system one. `light-dark()`: the theme is a class, and one source for both blocks already removes the drift it prevents.

**High contrast.** Under `prefers-contrast: more` labels go near-ink, pink and green text darken to 7:1, hairlines show and control borders firm up (Primer's high-contrast themes aim at 7:1 for text). Ink on the pink fill goes to black, 5.4:1, as far as text on the brand pink can go.

**Every pair checked.** `npm run contrast` (in CI) reads the tokens and checks 120 pairs in four themes: every text colour on every surface it sits on, labels, the right-answer banner's tint, control borders, the focus ring, the pink marks. WCAG 2.2 is the gate. APCA's lightness contrast is printed beside each as a second look, since it is the candidate for WCAG 3 and still in beta. The full check found one real miss: night-mode control borders on a card were 2.98:1, so `--rule` and `--input` at night went from #5f636c to #676b74 (3.36:1).

**Today's call paints before JavaScript.** The day is the visitor's own, so the page cannot know it when it is built; it drew a blank card until the bundle ran (Lighthouse on a phone: the case painted at 4.3 s). The page now holds every case, hidden, and a few lines of script show the day's one as the page loads, using the same arithmetic as the live call (a unit test runs both over two years of days). The live call takes over with the same parts (`call-face.tsx`), so nothing moves.

**Labs fit their card.** The lesson models used window breakpoints, but in a lesson the card is 660 px wide at a 1024 px window (the lesson list takes the left) and 800 px at 900, so lesson 2's model split into two columns at 1024 and stayed in one at 900. They now use container queries: two columns when the card has room (672 px), one when it does not.

**Page changes crossfade.** React's `<ViewTransition>` keyed by the path (`page-transition.tsx`): only a move to another page animates, at the interface speed; the header, tab bar and footer take no part, so a quick second tap still lands. Nothing moves under reduced motion. Where the browser lacks view transitions the page swaps at once, as before.

**Lint.** `npm run lint` (Oxlint, in CI) fails on unused code, broken hook rules and Next.js mistakes. ESLint's TypeScript parser does not support TypeScript 7 yet; Oxlint parses on its own. Its first run removed five unused imports and a prop nobody read.

**Next step, not built:** a fluid type scale (Utopia's clamp() between a phone and a desktop size) for the display titles, which still jump at breakpoints. The reading sizes stay fixed, as Brilliant's are.
