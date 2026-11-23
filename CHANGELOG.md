# Changelog

What changed on leadersheet.io, newest first.

## 22 November 2026

- **Fixed: four lessons' checklists had no names until the page's code ran.** Since the move to Base UI, a checkbox is a span, and its label names it only once the code arrives. A screen reader on a slow phone met 33 unnamed boxes in Collaborative decision making, Integrating it all, Influence and driving change and Leading through design. Each box now carries its name in the page as sent.
- Checks: `npm run qa` checks a page once it has loaded, its fonts are in and its code is idle, with entrance animations at their end. It used to look 900 ms after asking for the page, so on a busy machine it read pages still arriving: a skip link with no text yet, no main yet, arcade cards mid-fade. It also leaves out the 156 share-card sources under `/og/`, pictures that `npm run brand:check` already compares with their PNGs, which halves the run.

- **Sentence case everywhere, and fewer labels.** Nothing on the site is set in capitals any more: 1,215 labels in capitals across 143 pages and 10 results before, 0 after, acronyms aside. Labels are small grey text in sentence case. The ones that repeated a heading, said the obvious or explained the controls are gone: "Your result" over a result, a name over every line in Rewind, "Keys 1 to 7 answer", "Or drag across the ring", "From lesson 1" over Today's call, "Reading" before every reading under "Readings and talks", a second name on every other-game link, the count under every part of the course (the green stops show it), and counts at zero ("0 of 24 lessons passed", "0 of 3 answered"). Words on those screens: 34,335 before, 33,252 after.
- **Fixed: a decision's result scrolled sideways on phones.** The framework rail under a call grew to fit a long row name and pushed past the screen: 59 of 150 calls at 320 px (every lesson's call and 24 days of Today's call, every choice), by up to 296 px. The rail now stays inside its card and the name wraps. After the fix, every page and 13 results fit at 320, 360, 375, 390, 414 and 430 px, and all 150 calls fit at 320 and 360.
- Checks: `npm run voice` fails on an uppercase style or a word typed in capitals that is not an acronym. `npm run smoke` fails if any page, today's result, a test result, a quiz result or any choice in any lesson's call is wider than a 320 px screen, and `npm run qa` holds every page to the same rule at its widths.
- The decision, culture and conflict share cards are redrawn in sentence case.

- **Today's call shows the day's case at once.** It used to draw a blank card until the page's code arrived; now the case is on the page as it loads (Lighthouse on a phone: the case painted at 4.3 s, now 1.2 s).
- **More contrast when your device asks for it.** With "increase contrast" on, labels, pink text and right-answer text reach 7:1 and lines show more.
- Night mode's control borders are a shade lighter, so they pass 3:1 on a card.
- Moving to another page fades the new one in over the last; nothing moves with reduced motion on.
- A lesson's model fits its card: two columns when the card has room, one when it does not, whatever the window.
- The design tokens (every colour, duration, easing and corner) have one source in the W3C format, published at [/tokens.json](https://leadersheet.io/tokens.json).
- Checks: the tokens' CSS and types must match their source; every text and mark pair in four themes must pass WCAG 2.2 AA, with APCA shown beside it; Oxlint fails on unused code and hook mistakes; the smoke test loads Today's call with its code blocked and counts view transitions.

- **Found by what people search.** Framework pages lead with the name people type: [Kotter’s 8 steps of change](https://leadersheet.io/frameworks/kotter-8/), [Goleman’s six leadership styles](https://leadersheet.io/frameworks/goleman-6/), [Thomas-Kilmann conflict modes](https://leadersheet.io/frameworks/tki/), [Management vs leadership](https://leadersheet.io/frameworks/kotter-lm/), [Hackman and Oldham’s job characteristics model](https://leadersheet.io/frameworks/jcm/) and 25 more. The frameworks page links each card the same way.
- Games say what they are in a search result: [Leadership style quiz](https://leadersheet.io/play/style/), [Conflict style quiz](https://leadersheet.io/play/conflict/), [Values card sort](https://leadersheet.io/play/values/), [Job Diagnostic Survey](https://leadersheet.io/play/job/), [Cognitive bias quiz](https://leadersheet.io/play/bias/) and the rest. Arcade cards carry the same names.
- A game's page links the framework it plays and its lesson, and a framework's page links its quiz.
- Checks: `test/seo.test.ts` holds every search title to the length a result shows and checks each game's framework is taught in the game's own lesson.

- **A share card for every page people share.** Every game shows its first question or its own drawing, every framework its parts, and Today's call, Practice, Learn, Frameworks, the arcade, the values mirror, How it's built and Brand each have their own. Before, most of them sent the home page's card. Checks: a page that falls back to the site's card fails `npm run previews`.

## 20 November 2026

- **Show, don't tell.** The wordiest screens now say it with a picture first, and every sentence that carries the explanation is one tap away instead of deleted.
  - Today's call, a lesson's Your call and class mode's reveal: the calls stay where you picked them and take their marks; yours says what follows, the others open on a tap; the framework is a rail with every call's mark on the row it uses, in place of chips and a sentence.
  - Checks: the right answer and yours explain themselves; every other option says why not on a tap. "Review tomorrow" with an icon replaces the sentence.
  - Diagnose your job: the score sits on its 1 to 343 scale with the typical job's tick; each bar writes the typical value on its tick and names a band only when the difference is real; the caveats fold under "How to read it". The intro draws the bars you will get.
  - Rewind: the ending is a line of how far Alex opened up, turn by turn, a mark on every step. The log keeps each line's grade; the framework row and the why open on a tap. The intro shows Alex's first line instead of instructions.
  - Practice: four numbers with short labels and their own small drawings (the 1, 3, 7 and 21 day schedule as dots) instead of caption boxes. Your sheet's link shows the sheet's marks in miniature.
  - Class mode's steps are stops on a line, without numbers; every game's progress is a tick per question and its count.
- Checks: the smoke test opens another call's reason, checks the rail marks every call, folds and opens a check's other options, and moves a lesson's call along the rail.

- **Your sheet** at `/sheet/`: your calls and how they graded (Today's call included), how you lead, your five values and what the mirror said, your best scores, on one page that fills in as you go. Send it as one image (or a link that carries it), save the image, or print it.
- **Team math**, a new game: bet on how many lines twelve people keep up, drag a team from 3 to 20, then split three growing teams. Its own share card.
- **How do you decide?**, a new test: ten calls on Tannenbaum and Schmidt's line from deciding alone to letting the team decide. Names a way only when one leads, shows every answer on the line, links the lessons that help. Five results, each with a page and a card.
- The values card sort keeps its result and the mirror link after you leave the page; a friend's answer to your mirror comes back as a link that lands on your sheet.
- Fixed: a missing address under /learn/, /play/ or /frameworks/ threw React error #418 on the 404 page (the phone tab bar marked the section from the address bar, while the page had been built with no section marked).
- Checks: unit tests (`npm test`), the smoke test plays all three new pieces through, the voice check also reads copy that only appears after a click and fails on the rejected hero line, and the share-card checks cover the new cards.

- **Brand kit.** `/brand/` shows the mark and the name in colour, reversed, black and white, clear space and smallest sizes, what not to do, colours to copy, type and voice, and every banner; one zip holds all 90 files. Linked from the footer.
- The kit cannot go stale: the build packs it from the files the site serves, and a check fails when an icon, share card or kit file no longer matches its source.
- Fixed: five quiz share cards ("No single culture" and the other no-lead results) showed old wording; links, back buttons and lab buttons that were under 44 px tall on phones; the light and dark switch announced itself as "paper and blueprint"; the Bias blitz result read "Time 13" instead of "13 spotted"; /built listed two library versions the site no longer runs (it now reads them from the build); a maskable home-screen icon of its own.

## 19 November 2026

- **A page for every framework.** 54 pages at `/frameworks/<id>/`: the framework in a line, its parts, where to try it, the lesson's readings, related frameworks. The frameworks list moved from `/sheet/` to `/frameworks/`.
- **The course as a path.** `/learn/` lays out seven parts and 24 lessons, with finished lessons filled in and the next one marked.
- **A streak** for days in a row with an answer, a decision, a lab or a game. It never scolds.
- **Your call.** Every lesson has a decision case; in 15 lessons the choice moves the model.
- Lessons first / Games first replaces the Study and Play switch. Counters say what they count. The motivation score reads "64 out of 343" as real text, and tied levers are named together.
- Security: a strict Content-Security-Policy, HSTS and other headers; `security.txt`; a disclosure policy.
- Checks: decision cases, link previews and voice rules run with every build; QA covers 320 px phones.
- Fixed: share images hidden from X and LinkedIn by robots.txt; a dead "The lessons" button; sideways scroll on 320 px phones.

## 14 November 2026

- Twelve new lessons in three new parts, bringing the set to 24. Listening built out with a reply game and a timed pairs exercise. A final test across every lesson.
- Three style quizzes (power, listening, leadership style) and a values card sort.

## 13 November 2026

- The culture and conflict quizzes say so when no style leads, instead of naming one anyway.
- Lessons open on the model; the readings follow it.

## 11 November 2026

- Lesson titles name their frameworks for search; Course structured data and `llms.txt`.
- Every page submitted to search engines on each deploy.
- Leadersheet became a standalone product for anyone.

## 6 November 2026

- Redesign: oat page, white cards, serif headlines (Noticia Text), Instrument Sans text, the Funnel wordmark and a new icon.

## October 2026

- Shareable results with their own pages and cards; share cards for every lesson.
- The smoke test for site behavior; QA at phone, tablet and desktop widths with axe.
- Moved to leadersheet.io; cookieless Web Analytics.
- First version: lessons with interactive models, the arcade and practice.
