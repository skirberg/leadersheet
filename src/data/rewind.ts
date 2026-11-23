/*
  Rewind: a hard conversation played line by line. At each of your turns you pick a line; the other person answers;
  any of your lines can be rewound and tried another way. Rehearsing a hard conversation with the chance to rewind
  and retry cut combative moves by 67% compared with a lecture (Rehearsal, CHI 2024; docs/PLAN.md).

  Each line lands on a row of one of the lesson's frameworks, like the decision cases do, and its "why" says what
  that row says. The replies and endings are a made-up script, a simplified model of how one person might take it,
  not a claim about how people react. `open` is that model: +1 when a line makes it easier for them to tell you
  what is going on, -1 when it shuts them down. The ending is chosen by the total. `npm run cases` walks every path.
  Kept free of imports so the checks can load it in plain Node. Nobody in it is a real person.
*/

export type TalkGrade = "strong" | "tradeoff" | "costly"

export type TalkLine = {
  /** What you say. */
  says: string
  grade: TalkGrade
  /** The framework and row the line puts to work (or trips over). */
  fw: string
  row: number
  /** Why, in the framework's own terms. */
  why: string
  /** What they say back. */
  reply: string
  /** Said instead when the line at that earlier turn (0-based) was not the strong one, so the reply is true on every path. */
  replyIf?: { turn: number; notStrong: string }
  /** +1 opens them up, 0 neither, -1 shuts them down. */
  open: -1 | 0 | 1
  /** For a line that is not strong: what it costs later, true whatever else was said. */
  later?: string
}

export type Talk = {
  id: string
  /** The lesson it practises. */
  sheet: string
  title: string
  /** Who you are, and the situation, in two sentences. */
  setup: string
  them: string
  /** Their first line, before your first turn. */
  opener: string
  /** Your turns, in order. Every line of a turn must read naturally after any reply to the turn before. */
  turns: { aim: string; lines: TalkLine[] }[]
  /** Endings by the total of `open`, highest first: the first whose `min` the total reaches. */
  endings: { min: number; title: string; then: string }[]
}

export const TALKS: Talk[] = [
  {
    id: "late-reports",
    sheet: "s11",
    title: "The late reports",
    setup:
      "You manage Alex, an analyst. The weekly status report has gone out two days late three weeks running, and last week's sent the client a wrong revenue figure. You have a one-to-one now.",
    them: "Alex",
    opener: "Hey. You wanted to talk?",
    turns: [
      {
        aim: "Open",
        lines: [
          {
            says: "Yes. The last three status reports went out on Wednesday, not Monday, and last week's had the wrong Q3 revenue in it when it reached the client.",
            grade: "strong",
            fw: "ladder",
            row: 4,
            why: "Data anyone could check, picked out and said plainly. You start low on the ladder of inference, so there is something specific to talk about.",
            reply: "Yeah. I know they've been late. I saw the revenue one too. It's been a rough few weeks.",
            open: 1,
          },
          {
            says: "I'll be blunt. You've been careless lately.",
            grade: "costly",
            fw: "five-flaws",
            row: 0,
            why: "Careless is a trait, not a behavior. Cannon and Witherspoon's first flaw: it attacks the person, so all Alex can do is defend.",
            reply: "Careless? I've been here till eight most nights. The reports are late, sure. That's not careless.",
            open: -1,
            later: "Alex remembers being called careless, and brings you less bad news for a while.",
          },
          {
            says: "Things have been a bit off with the reports. Just wanted to check in.",
            grade: "tradeoff",
            fw: "five-flaws",
            row: 1,
            why: "Gentle, and vague: Alex has to guess what you saw and what you want.",
            reply: "Off how? Is this about them being late? It's been a rough few weeks.",
            open: 0,
            later: "Alex had to guess what you meant before the real conversation could start.",
          },
        ],
      },
      {
        aim: "Find out why",
        lines: [
          {
            says: "Help me understand what's been happening on your end.",
            grade: "strong",
            fw: "rogers",
            row: 1,
            why: "Before you judge, get their view. Rogers: understand from their frame first.",
            reply:
              "The new dashboard times out on Mondays, so I've been pulling the numbers by hand. That's where the Q3 mistake came from. I didn't want to flag it and look like I couldn't handle it.",
            open: 1,
          },
          {
            says: "Whatever the reason, it can't keep happening.",
            grade: "costly",
            fw: "rogers",
            row: 0,
            why: "A verdict before you know why. Rogers' barrier: evaluating from your own frame.",
            reply: "Fine. Got it.",
            open: -1,
            later: "You never asked why, so whatever Alex knew about the cause came out only if Alex chose to say it.",
          },
          {
            says: "I get it, everyone's stretched. Let's not worry about it.",
            grade: "tradeoff",
            fw: "five-flaws",
            row: 4,
            why: "Kind, but it drops the issue: no impact named and no change asked for.",
            reply: "Thanks. It should calm down soon.",
            open: 0,
            later: "Saying not to worry made the change sound optional.",
          },
        ],
      },
      {
        aim: "Say the impact, ask for the change",
        lines: [
          {
            says: "When the client gets a wrong number, they start checking everything we send, and that costs us trust before the renewal. I need reports out Monday by noon, and if anything gets in the way, tell me by Friday so we can fix it together.",
            grade: "strong",
            fw: "five-flaws",
            row: 4,
            why: "The impact and the change, both said out loud. Cannon and Witherspoon's last flaw is leaving them out.",
            reply: "That's fair. Monday noon works. Honestly, the dashboard is the problem. Can you get IT to look at the timeout?",
            open: 1,
          },
          {
            says: "If it happens again, it goes in your review.",
            grade: "costly",
            fw: "ladder",
            row: 0,
            why: "A threat jumps to the top rung, deciding what to do, and skips the impact and any help.",
            reply: "Understood.",
            open: -1,
            later: "The threat got compliance, not candor: problems are more likely to be patched quietly than raised.",
          },
          {
            says: "Just try to be more careful going forward.",
            grade: "tradeoff",
            fw: "five-flaws",
            row: 1,
            why: "Careful how, and by when? There is no behavior or change Alex can act on.",
            reply: "Sure. I'll try.",
            open: 0,
            later: "“Be more careful” gave Alex nothing to do differently on Monday.",
          },
        ],
      },
      {
        aim: "Check it landed",
        lines: [
          {
            says: "To make sure I was clear, what will you do differently this week?",
            grade: "strong",
            fw: "transparency",
            row: 2,
            why: "What is clear to you can land as noise. The fix for the illusion of transparency: ask them to say back what they heard.",
            reply: "Report out Monday by noon. If something breaks, I tell you by Friday instead of patching it by hand.",
            // the deadlines are only Alex's to repeat if you set them at turn 3; otherwise saying it back shows what did not land
            replyIf: { turn: 2, notStrong: "Be more careful, I guess? Double-check the numbers before they go out." },
            open: 1,
          },
          {
            says: "Great, glad we're on the same page.",
            grade: "costly",
            fw: "transparency",
            row: 1,
            why: "You assume it landed. A message that is clear to you can still land as noise.",
            reply: "Yep. Same page.",
            open: -1,
            later: "You assumed it landed. What Alex heard may not be what you meant.",
          },
        ],
      },
    ],
    endings: [
      {
        min: 3,
        title: "The cause, not just a promise",
        then: "Next Monday the report is out by eleven. On Friday Alex messaged you that the dashboard had timed out again, and IT fixed it the same day. Data first, a real question, the impact and a clear ask got you the problem as well as the promise.",
      },
      {
        min: 1,
        title: "On time, for now",
        then: "The next report is on time, and for a few weeks the fix holds. Some of what you said worked and some of it cost you, listed below. Rewind one of those lines and see what changes.",
      },
      {
        min: -99,
        title: "Quiet, then late again",
        then: "Alex says less in meetings. The next report is on time and the one after is late again, with no warning. What each weaker line cost is below; rewind to the one where it turned.",
      },
    ],
  },
]

export const talkById = (id: string) => TALKS.find((t) => t.id === id)

/** What they say back to the line at turn k, given every line picked so far. */
export function replyFor(t: Talk, picks: number[], k: number) {
  const line = t.turns[k].lines[picks[k]]
  const c = line.replyIf
  if (c && t.turns[c.turn].lines[picks[c.turn]]?.grade !== "strong") return c.notStrong
  return line.reply
}

/** The ending for a set of picks (one line index per turn). */
export function talkEnding(t: Talk, picks: number[]) {
  const total = picks.reduce((s, p, k) => s + t.turns[k].lines[p].open, 0)
  return { total, ending: t.endings.find((e) => total >= e.min) ?? t.endings[t.endings.length - 1] }
}

/** Where the conversation stands after each turn: 0 at the start, then the running total of `open` (the trace Rewind draws). */
export function talkWalk(t: Talk, picks: number[]) {
  return picks.reduce<number[]>((a, p, k) => [...a, a[a.length - 1] + t.turns[k].lines[p].open], [0])
}

