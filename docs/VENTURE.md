# Leadersheet: venture notes

The small source of truth for what Leadersheet is for and why it is built this way. Updated 2 October 2026.

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

Evidence to watch: shares and quiz completions. Needs analytics (decision pending).

## Decisions

| Decision | Reason | Revisit if |
|---|---|---|
| Static site on Vercel Hobby from the public repo skirberg/leadersheet | Nothing to run or maintain; free | Accounts or progress across devices are needed |
| Shareable results as 13 static pages with pre-rendered cards | Works without a server; rich previews everywhere | Results need personal data on the card |
| Public site is timeless; class mode via `?class` | Strangers do not need a syllabus | The course ends |
| Name Leadersheet; domain pending | leadersheet.app unregistered; lead.ing or lead.how as a vanity redirect if not premium | A clearly better name and domain appear |
| No analytics yet | It is a tracking decision on a public site | Sami says yes (Vercel Web Analytics, cookieless) |
| No external skills installed | The referrals skill targets paid referral programs; Vercel's interface guidelines can be read directly | A review or growth task needs one |

## Evidence so far

- Live at leadersheet.vercel.app (checked 2 October 2026); link previews and sitemap resolve on the live host.
- `npm run check`: 51 pages, 204 checks, all clear.
- Share flow tested: native share with the card attached, copy link, blocked clipboard fallback, card download.
- No usage data yet.

## Unknowns

Whether people share; which quiz pulls more; whether classmates use class mode.

## Next action

Push this commit from GitHub Desktop, then post one result card and link. Decide on analytics.
