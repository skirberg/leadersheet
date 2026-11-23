/*
  "How do you decide?" Ten situations, each a real trade-off, scored on Tannenbaum and Schmidt's leadership continuum
  ("How to Choose a Leadership Pattern", HBR 1958, reissued 1973; lesson 18 and /frameworks/continuum-7/). Every option
  is one of the line's seven points, and every situation offers one option in each of four ways to decide, grouped the
  way the line is often taught (US Civil Service Commission supervisor training, 1975): Tell (point 1), Sell (2 and 3),
  Consult (4 and 5) and Join (6 and 7). Each way has ten chances, so the lead rule in lib/lead.ts needs six of ten and
  more than any other way. All situations are original. For fun, not a validated assessment.
*/
import { chancesIn, leadOf, tallyOf } from "@/lib/lead"

export const WAYS = ["Tell", "Sell", "Consult", "Join"] as const
export type Way = (typeof WAYS)[number]

/** The points on the continuum (1 to 7) each way covers. */
export const WAY_POINTS: Record<Way, number[]> = { Tell: [1], Sell: [2, 3], Consult: [4, 5], Join: [6, 7] }

export const WAY_DESC: Record<Way, string> = {
  Tell: "You decide and announce. Fast and clear, and people carry out a call they had no part in.",
  Sell: "You decide, then win people over. They hear why; the call is still yours alone.",
  Consult: "You hear people out, then decide. Better information and more buy-in, at the cost of time.",
  Join: "You set the limits and the team decides. The most ownership, the slowest, and you answer for their choice.",
}

/** Lesson ids that help, for each result and for a spread (the last). */
export const WAY_LESSONS: Record<Way | "Spread", [string, string]> = {
  Tell: ["s19", "s23"],
  Sell: ["s5", "s19"],
  Consult: ["s9", "s8"],
  Join: ["s8", "s6"],
  Spread: ["s19", "s6"],
}

export type Situation = { tag: string; q: string; o: [says: string, way: Way, point: number][] }

export const DECIDE_QUIZ: Situation[] = [
  {
    tag: "Outage",
    q: "The payment system is down and customers are noticing. You know a fix.",
    o: [
      ["Tell each person what to do. Explain later.", "Tell", 1],
      ["Give the fix and the reason in one line, then go.", "Sell", 2],
      ["Take two minutes of ideas, then call it.", "Consult", 5],
      ["Let the on-call engineers pick the fix. You keep everyone else off their backs.", "Join", 7],
    ],
  },
  {
    tag: "Team day",
    q: "Next month’s team day: where it is, and what you do there.",
    o: [
      ["Pick it and send the invite.", "Tell", 1],
      ["Pick it, and tell them why they’ll like it.", "Sell", 2],
      ["Share your plan as a draft and change it if they push back.", "Consult", 4],
      ["Give them the budget and the date. They plan it.", "Join", 6],
    ],
  },
  {
    tag: "Cut a project",
    q: "The budget fell. One of three projects has to stop, and the team built all three.",
    o: [
      ["Choose which one stops and announce it.", "Tell", 1],
      ["Choose, then walk them through the numbers until they see it.", "Sell", 2],
      ["Hear the case for each, then choose.", "Consult", 5],
      ["One has to stop. Let the team choose which.", "Join", 6],
    ],
  },
  {
    tag: "New tool",
    q: "The team is switching to a new tool that everyone will use every day.",
    o: [
      ["Choose it and switch on Monday.", "Tell", 1],
      ["Choose it, then show why it beats the old one.", "Sell", 2],
      ["Propose one, run a trial week, and drop it if they hate it.", "Consult", 4],
      ["Set the must-haves. The team tries a few and picks.", "Join", 6],
    ],
  },
  {
    tag: "The expert",
    q: "A senior engineer knows this problem far better than you do.",
    o: [
      ["Decide. It is still your call.", "Tell", 1],
      ["Decide, then take her questions.", "Sell", 3],
      ["Ask for her view, then decide.", "Consult", 5],
      ["Let her decide, inside the budget.", "Join", 7],
    ],
  },
  {
    tag: "New policy",
    q: "Legal says the travel policy must change by Friday. People will dislike it.",
    o: [
      ["Announce the new policy.", "Tell", 1],
      ["Announce it with the reason and what it protects.", "Sell", 2],
      ["Ask how to make the switch least painful, then pick the plan.", "Consult", 5],
      ["Give them the rule it must meet. They write the policy.", "Join", 6],
    ],
  },
  {
    tag: "Hiring",
    q: "Two strong candidates, one job. The team will work with whoever you hire.",
    o: [
      ["Pick one and tell the team.", "Tell", 1],
      ["Pick one, then tell the team why.", "Sell", 2],
      ["Have the team meet both, hear them out, then pick.", "Consult", 5],
      ["The team meets both and picks.", "Join", 6],
    ],
  },
  {
    tag: "Late again",
    q: "Your team keeps missing deadlines. You have a theory why.",
    o: [
      ["Fix the process your way, starting today.", "Tell", 1],
      ["Present your fix and take questions.", "Sell", 3],
      ["Share your theory as a draft and ask what it misses.", "Consult", 4],
      ["Ask them to find the cause and fix it this quarter.", "Join", 7],
    ],
  },
  {
    tag: "Due tonight",
    q: "Next year’s budget is due tonight at six.",
    o: [
      ["Write it yourself and send it.", "Tell", 1],
      ["Write it, send it, and explain your choices tomorrow.", "Sell", 2],
      ["Ask each lead for their top need by four, then write it.", "Consult", 5],
      ["Give each lead a number to fill in, then add them up.", "Join", 6],
    ],
  },
  {
    tag: "New team",
    q: "Your team formed last week. It needs a way to run its weekly meeting.",
    o: [
      ["Set the agenda and the rules yourself.", "Tell", 1],
      ["Set them, and say why each one is there.", "Sell", 2],
      ["Propose a format and revise it after two weeks of their feedback.", "Consult", 4],
      ["Let them design it. You join as a member.", "Join", 7],
    ],
  },
]

const decideChances = chancesIn(DECIDE_QUIZ)

/** The result for a set of picks (one option per situation, as [way, point]). */
export function decideResult(picks: { way: Way; point: number }[]) {
  const { tally, ranked } = tallyOf([...WAYS], picks.map((p) => p.way))
  const lead = leadOf(ranked, tally, decideChances) as Way | undefined
  const mean = picks.length ? picks.reduce((a, p) => a + p.point, 0) / picks.length : 4
  return { lead, tally, ranked, mean }
}

export const isWay = (k: unknown): k is Way => typeof k === "string" && (WAYS as readonly string[]).includes(k)
