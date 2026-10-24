# Leadersheet: venture notes

The small source of truth for what Leadersheet is for and why it is built this way. Updated 24 October 2026.

## Objective now

Credibility and real usage, not revenue. A live, shareable leadership study tool that earns its place in a portfolio and proves the brand-site kit. Free, no sign-up.

## Customer hypothesis

1. Classmates and MBA peers who need quick prep and recall for a leadership course. They already sit in group chats and on LinkedIn.
2. New and aspiring managers who search for leadership frameworks (Kotter's eight steps, culture styles, conflict modes).

The user is the buyer; nothing is sold.

## Why they would come, share and return

- One sheet per idea with a model you can move beats rereading the articles.
- Quizzes about yourself (culture fit, conflict style) are identity content people like to post.
- Timed games and best scores give a reason to come back.

## Distribution loop

Take a quiz, get a result page and a result card, share the link. The link previews the card (result word, model, "Find yours"), and the next person lands one tap from the same quiz. Every result has its own page and image, so the loop works on any platform without a server.

First push: post one result card on LinkedIn with the question "Which culture fits you?". Sharing with classmates (with `?class`) is Sami's call; the site never touches case preparation.

Evidence to watch: shares and quiz completions, in Vercel Web Analytics (custom events: check finished, lab used, game played, shared, mode switched, class mode).

## Decisions

| Decision | Reason | Revisit if |
|---|---|---|
| Static site on Vercel from the public repo skirberg/leadersheet | Nothing to run or maintain | Accounts or progress across devices are needed |
| Shareable results as 13 static pages with pre-rendered cards | Works without a server; rich previews everywhere | Results need personal data on the card |
| Public site is timeless; class mode via `?class` | Strangers do not need a syllabus | The course ends |
| Name Leadersheet on leadersheet.io (bought 8 October 2026; leadersheet.xyz, www and leadersheet.vercel.app redirect) | lead.ing ($33,000) and lead.how ($372.90) are premium, so no vanity hack | A clearly better name and domain appear |
| Vercel Web Analytics, cookieless, a few anonymous events (added 8 October 2026) | Measure shares and completions without cookies or personal data | A question needs data it cannot answer |
| No external skills installed | The referrals skill targets paid referral programs; Vercel's interface guidelines can be read directly | A review or growth task needs one |

## Evidence so far

- Live at https://leadersheet.io (checked 24 October 2026).
- `npm run check`: 63 pages, 504 checks, all clear. `npm run smoke`: all behavior checks pass.
- Lighthouse, mobile, live (12 October 2026): accessibility, best practices and SEO 100; performance about 80.
- Usage: read Vercel Web Analytics before quoting any number.

## Unknowns

Whether people share; which quiz pulls more; whether classmates use class mode.

## Next action

Post one result card and link (Sami's call), then read shares and quiz completions in Vercel Web Analytics after two weeks.
