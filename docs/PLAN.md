# Leadersheet: the plan

Written 20 November 2026 from three research briefs (how the best learning products are designed and built; what leadership learning offers and lacks; game and test design) and the site's own analytics. Read this before proposing work. Each bet below has its evidence, what it costs and how we know it worked. Replace a line when something changes; don't append a paragraph.

## Where we are

Leadersheet has the content: 24 lessons, 54 frameworks, 24 decision cases with 75 graded choices, 14 quizzes, games and self-checks (three of them published instruments), a Rewind conversation, Today's call with a class mode, and practice.

It has few outside readers yet. Without them there is no signal, so the work has circled on polish.

The counting works. On 22 November a preview of `/today/` sent its page view and its "Daily call" event, and both showed up in Vercel. Automated checks don't count: `npm run smoke` blocks the analytics script, and headless browsers are skipped.

Polish is not the gap. The gap is a reason to come back, a reason to share, and a way to see both.

## What we are

The free practice field for leading people: a few minutes a day, real calls with feedback, alone or with a class.

Not a course (Blinkist, MasterClass and LinkedIn Learning teach the gist and skip practice). Not a personality test.

Why practice:
- Leadership training transfers to the job (δ = .82). Practice, feedback and spaced sessions are what help; self-run training helps least ([Lacerenza 2017](https://psycnet.apa.org/doi/10.1037/apl0000241)).
- Simulated negotiation improved results only when it came with feedback (d = .38; none without it) ([ACE](https://arxiv.org/html/2410.01555)).
- Rewinding a hard conversation and trying another line cut combative moves by 67% compared with a lecture ([Rehearsal, CHI 2024](https://arxiv.org/abs/2309.12309)).
- Nobody gives this away free. Paid team simulations such as Everest charge per student.

## Rules for every page we build

1. **Act before the explanation.** A guess, a drag or a choice comes first ([Sinha & Kapur 2021](https://journals.sagepub.com/doi/10.3102/00346543211019105), g = 0.36; Brilliant; Nicky Case).
2. **Feedback shows the consequence and explains every wrong option.** Explanatory feedback (0.49) beats the right answer alone (0.32) and right/wrong alone (0.05) ([Van der Kleij 2015](https://journals.sagepub.com/doi/10.3102/0034654314564881)).
3. **Short loops that end.** One a day, not endless ([Wordle](https://techcrunch.com/2022/01/12/josh-wardle-interview-wordle)).
4. **Points are information, never pay.** No leaderboards that rank everyone; no lost-streak alarms ([Deci 1999](https://psycnet.apa.org/record/1999-01567-001); broken streaks cut returns from 61% to 45%).
5. **Every claim sourced.** Every scoring rule is a content claim, so source it or call it a simplified model.
6. **Built the way the best are built, on what we have:**
   - SVG in React, with d3 for the maths only
   - framer-motion under `MotionConfig reducedMotion="user"`
   - XState only where a game has many steps
   - no server until a bet needs one
   - Rive stays out: it needs WASM and an unpkg host, which the CSP blocks

## The bets, in order

Each bet ships in about a week, then gets two weeks of numbers. Keep it, change it, or cut it.

### 1. Today's call (return). Live 20 November.

**What it is:** one leadership decision a day, the same for everyone. Then:
- you say how sure you are;
- you see what follows and why each other option falls short;
- you get a line to share.

**What keeps it going:** one call keeps the streak.

**Content:** v1 rotates the 24 sourced lesson cases, so no new claims. New cases are added only with sources.

**Evidence:**
- Wordle's shared daily puzzle and spoiler-free share grid.
- Duolingo's one-lesson streak raised day-14 retention by 3.3%.
- Errors made with high confidence are the ones feedback corrects best ([Butterfield & Metcalfe 2001](https://psycnet.apa.org/record/2001-18940-014)).

**Watch:** daily plays, share taps, and visitors who return within 7 days.

### 2. Review that comes back (learning). Built 20 November.

**What it is:** missed check questions return on days 1, 3, 7 and 21. The home page says how many are due. An optional calendar file reminds you.

**Evidence:**
- Spaced retrieval beats massed practice (g = .74).
- Practice testing and spacing are the only two techniques rated "high utility" ([Dunlosky 2013](https://journals.sagepub.com/doi/10.1177/1529100612453266)).

**Watch:** reviews done and second-week returns.

### 3. Rewind (practice). First conversation built 20 November: /play/rewind/.

**What it is:** scripted hard conversations you play line by line, such as feedback, delegation and a former peer. You can rewind any turn and try another line.

**How it's built:** branches are JSON trees tagged to framework rows (SBI, interests and positions). `npm run cases` walks every path.

**Then:** "good take, bad take": two versions of one 1:1, and you tap where the bad one goes wrong.

**Watch:** rewinds per session and finished conversations.

### 4. Class mode (spread). v1 built 20 November: /today/class/.

**v1, projector mode (no network):**
- the host shows a case;
- the room votes, discusses and votes again;
- the host shows the reveal.

Vote, discuss and revote has the strongest classroom evidence ([Smith 2009](https://www.science.org/doi/10.1126/science.1165919)).

**v2, live phone voting:**
- runs on PartyServer on Cloudflare's free plan (PartyKit's hosted platform shut on 23 October 2026);
- needs a reviewed CSP change;
- nicknames only, and rooms store nothing.

**Also:** a hidden-profile room game. Each person opens a private brief by link, and the reveal shows which facts nobody shared ([Stasser & Titus 1985](https://psycnet.apa.org/record/1985-28037-001)). It is a free Everest, with no server.

**Watch:** class sessions, and the visitors they bring.

### 5. Better games (fun that teaches)

**Upgrades to the eight we have:**
- built 20 November: a "why not" on every check option (216 lines), and a confidence tap before each reveal in lesson checks and Practice; a right answer on a guess comes back for review, and Practice shows how often "sure" was right;
- built 20 November: bias blitz shows accuracy, a wrong answer costs three seconds so reading beats tapping, and each miss names what you said, the trap and the question that catches it;
- built 20 November: Kotter climb lists each step you slipped on with Kotter's matching error;
- the mirror's card shows the gap between your five values and theirs.

**New games**, each tied to a lesson's framework (S, M and L are rough size):

| Game | What you do | Size |
|---|---|---|
| Bounce | Listening: bet on a reply, then see its level | S |
| Who sounds rude? | Predict how two colleagues on Meyer's scales see each other | S |
| Fix the job | Spend points on the job characteristics; the motivating score multiplies, and pay changes nothing | M |
| Anchored? | Give ranges you're 90% sure of, with seeded anchors; see how far the anchors pulled you | M |
| Find the zone | Negotiate against a hidden walk-away price | M |
| Power ledger | Choose power moves; their costs land turns later | M |
| Small steps | Ethics: spot moral disengagement as requests escalate | M |
| Hand-off | Delegation over six weeks | L |
| Eight quarters | Change: a step skipped now fails two turns later | L |

**Validated self-checks, built 22 November:** the Job Diagnostic Survey (lesson 10), the Brief Resilience Scale (lesson 21) and a network map scored with Burt's constraint (lesson 19). Free to use; Edmondson's psychological safety items and Colquitt's justice scale wait on the authors' permission.

### 6. Tests that measure learning

**For readers:**
- mixed unit challenges that interleave look-alike frameworks (g = 0.42);
- transfer questions that keep the structure and change the surface;
- a one-line "why" prompt after a miss (self-explanation, g = 0.55);
- lesson levels that rise when you pass a check and fall when you miss a review (Khan Academy).

**For the code:**
- `npm run cases` walks every daily and branching path;
- a year of daily calls is generated and checked at build;
- the smoke tests play Today's call on a fixed date.

## What we count

Vercel Web Analytics: page views and these anonymous events, with no cookies and nothing that names a person. `npm test` fails if the code sends an event this table doesn't list.

| Event | Sent when | Tells us |
|---|---|---|
| `Daily call` | Today's call is made (number, grade, how sure) | Bet 1: daily plays |
| `Class mode reveal` | A class reaches the reveal | Bet 4: class sessions |
| `Rewind` | A line is taken back in a conversation | Bet 3: rewinds per session |
| `Rewind finished` | A conversation ends (strong lines, rewinds) | Bet 3: finished conversations |
| `Case decided` | A lesson's decision case is answered (grade) | Whether lessons get used past reading |
| `Check finished` | A lesson's three-question check ends (score) | Lessons finished |
| `Lab used` | A lesson's model is first moved | Whether the models get touched |
| `Game played` | A game or quiz is first started | Play: which games pull |
| `Job survey finished` | The Job Diagnostic Survey ends (motivating score) | Self-checks finished |
| `Resilience scale finished` | The Brief Resilience Scale ends (band) | Self-checks finished |
| `Network mapped` | A network map is scored (contacts, constraint) | Self-checks finished |
| `Shared` | A result or call is shared (method) | Distribution |
| `Sheet shared` | Your sheet is shared (method) | Distribution |
| `Sheet printed` | Your sheet is printed | The sheet is worth keeping |
| `Mirror sent` | The values mirror is sent to someone | Distribution |
| `Mirror answer opened` | Someone opens a mirror they were sent | Distribution: links that land |
| `Mirror answered` | They answer it (how many values match) | Distribution: links that convert |
| `Mirror answer sent` | Their answer is sent back | The loop closes |
| `Mode switched` | Lessons first or Games first is picked | Which way in people choose |

## How we work, so we stop circling

- **One bet a week.**
  - Monday: a one-page spec with its evidence.
  - Midweek: build.
  - Friday: ship it and read the numbers.
- **The next three bets come each week, ranked with evidence.**
- **No polish-only week** unless the numbers point at a problem.
- **Every bet names its metric before it's built.** It's cut if the metric doesn't move in two weeks.
- **Distribution is part of every bet:**
  - a share line or card;
  - one class or group that uses it first;
  - its own page that search can find.
