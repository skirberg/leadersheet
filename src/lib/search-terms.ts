/*
  The words people type into a search box, for each lesson, framework and game, kept apart from the structured data in
  seo.ts so the tests can load them in plain Node (seo.ts reads the brand, which draws a logo in TSX). Volumes,
  difficulty and who ranks were checked on 22 November 2026; the first words of a title or heading are the searched name.
*/
import type { Framework, Session } from "@/data/course"
import { GAMES, type GameId } from "@/data/games"
/**
 * What people type into a search box for each lesson. Only the browser tab and the search result read
 * this; the page heading keeps the lesson's own title.
 */
const SEARCH: Record<string, string> = {
  s1: "management vs leadership",
  s2: "emotional intelligence and psychological safety",
  s3: "organization design and the congruence model",
  s4: "the eight culture styles",
  s5: "Kotter’s eight steps and persuasion",
  s6: "team tensions and team conflict",
  s7: "the five conflict modes",
  s8: "decision traps and better group decisions",
  s9: "listening and the illusion of transparency",
  s10: "two-factor theory and self-determination",
  s11: "the ladder of inference and actionable feedback",
  s12: "manage your energy, not your time",
  s13: "the bases of power",
  s14: "Goleman’s six styles and situational leadership",
  s15: "transformational and servant leadership",
  s16: "the trust model and organizational justice",
  s17: "bounded ethicality and moral disengagement",
  s18: "BATNA, ZOPA and principled negotiation",
  s19: "the leadership continuum and GROW",
  s20: "weak ties and structural holes",
  s21: "the culture map and global teams",
  s22: "adaptive leadership and escalation of commitment",
  s23: "employee silence and speaking up",
  s24: "authentic leadership and your true north",
}

/** A lesson's title for search results: its title, then the words people search for. */
export const lessonSearchTitle = (s: Pick<Session, "id" | "title">) => (SEARCH[s.id] ? `${s.title}: ${SEARCH[s.id]}` : s.title)

/**
 * What people type to find each framework. The page heading keeps the framework's own name; the browser tab
 * and the search result use this. Frameworks not listed use "Name (Author)".
 */
const FW_SEARCH: Record<string, string> = {
  "kotter-lm": "Management vs leadership: Kotter’s three differences",
  "goleman-ei": "Goleman’s 5 components of emotional intelligence",
  "psych-safety": "Psychological safety at work: Edmondson’s four zones",
  mindset: "Growth mindset versus fixed mindset (Dweck)",
  "nine-tests": "Goold and Campbell’s nine tests of organization design",
  congruence: "The Nadler-Tushman congruence model",
  structures: "Functional, divisional, matrix and flat structures",
  "culture-8": "Groysberg’s 8 culture styles, with a quiz",
  "kotter-8": "Kotter’s 8 steps of change, and the mistake at each step",
  "conger-4": "Conger’s four steps of persuasion",
  cialdini: "Cialdini’s 6 principles of influence",
  "hill-tensions": "Linda Hill’s four team tensions",
  "conflict-types": "Task, relationship and process conflict",
  tki: "Thomas-Kilmann conflict modes: the five styles, with a quiz",
  k12: "Kahneman’s 12 questions before a big decision",
  traps: "Hidden traps in decision making (Hammond, Keeney and Raiffa)",
  herzberg: "Herzberg’s two-factor theory: hygiene factors and motivators",
  expectancy: "Vroom’s expectancy theory",
  jcm: "Job characteristics model: the five traits and the MPS formula",
  sdt: "Self-determination theory (Deci and Ryan)",
  ladder: "Ladder of inference: the six rungs from data to action",
  "power-bases": "French and Raven’s 6 bases of power, with a quiz",
  "goleman-6": "Goleman’s 6 leadership styles, and when each works",
  slt: "Situational leadership (Hersey and Blanchard)",
  "full-range": "The full range leadership model",
  "four-i": "The four I’s of transformational leadership",
  abi: "The ABI trust model: ability, benevolence, integrity",
  "justice-4": "Four kinds of organizational justice (Colquitt)",
  disengage: "Bandura’s moral disengagement",
  principled: "Principled negotiation and BATNA (Getting to Yes)",
  zone: "BATNA and ZOPA: the zone of possible agreement",
  "continuum-7": "Tannenbaum and Schmidt leadership continuum: 7 steps",
  grow: "GROW model: coaching questions for each step",
  ties: "The strength of weak ties (Granovetter)",
  brokerage: "Structural holes and brokerage (Burt)",
  "culture-map": "Erin Meyer’s culture map: the eight scales",
  split: "SPLIT: social distance on global teams (Neeley)",
  adaptive: "Adaptive leadership (Heifetz and Laurie)",
  escalation: "Escalation of commitment (Staw)",
  "energy-4": "Manage your energy, not your time: four sources",
  "true-north": "Finding your true north: authentic leadership",
  hundred: "Christensen’s 100% rule",
  "five-barriers": "Five barriers to an ethical organization (Bazerman)",
  silence: "Employee silence: why people stay quiet at work",
}

export const frameworkSearchTitle = (f: Pick<Framework, "id" | "name" | "by">) => FW_SEARCH[f.id] ?? `${f.name} (${f.by})`

/**
 * A framework page's heading, and its link text on /frameworks/, when the framework's own name does not carry the words
 * people search: "Eight steps of change" is searched as Kotter’s 8 steps. The first words say what it is.
 */
const FW_HEADING: Record<string, string> = {
  "kotter-lm": "Management vs leadership: Kotter’s three differences",
  "goleman-ei": "Goleman’s five components of emotional intelligence",
  "psych-safety": "Psychological safety: Edmondson’s four zones",
  congruence: "The Nadler-Tushman congruence model",
  "culture-8": "Groysberg’s eight culture styles",
  "kotter-8": "Kotter’s 8 steps of change",
  cialdini: "Cialdini’s six principles of influence",
  "hill-tensions": "Linda Hill’s four team tensions",
  "conflict-types": "Task, relationship and process conflict",
  tki: "Thomas-Kilmann conflict modes",
  traps: "Hidden traps in decision making",
  herzberg: "Herzberg’s two-factor theory",
  expectancy: "Vroom’s expectancy theory",
  jcm: "Hackman and Oldham’s job characteristics model",
  "power-bases": "French and Raven’s bases of power",
  "goleman-6": "Goleman’s six leadership styles",
  "full-range": "The full range leadership model",
  "four-i": "The four I’s of transformational leadership",
  abi: "The ABI trust model: ability, benevolence, integrity",
  "justice-4": "Four kinds of organizational justice",
  disengage: "Bandura’s moral disengagement",
  principled: "Principled negotiation and BATNA",
  zone: "ZOPA: the zone of possible agreement",
  "continuum-7": "Tannenbaum and Schmidt’s leadership continuum",
  grow: "The GROW coaching model",
  ties: "The strength of weak ties",
  brokerage: "Structural holes and brokerage",
  "culture-map": "Erin Meyer’s culture map",
  adaptive: "Adaptive leadership: Heifetz’s six principles",
  hundred: "Christensen’s 100% rule",
}

export const frameworkHeading = (f: Pick<Framework, "id" | "name">) => FW_HEADING[f.id] ?? f.name

/** A framework page's search description: what it is, its line, then its parts. */
export function frameworkDescription(f: Framework) {
  const parts = f.rows.map((r) => r[0].replace(/^\d+ /, "")).filter((x) => !/^\d+$/.test(x))
  const lead = FW_HEADING[f.id] ? `${FW_HEADING[f.id]}.` : `${f.name} (${f.by}).`
  const text = `${lead} ${f.one}${parts.length ? ` Its parts: ${parts.join(", ")}.` : ""}`
  return text.length > 300 ? `${text.slice(0, 297)}…` : text
}

/**
 * The arcade, the way people search for it (the research behind it, November 22 2026: volumes, difficulty and who ranks).
 * `title` is the browser tab, the search result's title link and the page's h1 (the game draws its own short title on
 * screen). `fw` is the framework the game plays, so the two pages link to each other.
 */
export const GAME_SEARCH: Record<GameId, { title: string; description: string; fw?: string }> = {
  team: {
    title: "Communication channels formula: team math from 3 to 20",
    description: "Grow a team from 3 to 20 and watch the lines between people multiply: n(n−1)/2 communication channels. Then split it into smaller teams.",
  },
  decide: {
    title: "Decision making style test: how much do you decide alone?",
    description: "Ten calls put you on Tannenbaum and Schmidt’s leadership continuum, from deciding alone to letting the team decide.",
    fw: "continuum-7",
  },
  culture: {
    title: "Culture quiz: which of the eight culture styles fits you?",
    description: "Eight questions place you among Groysberg’s eight culture styles: caring, purpose, learning, enjoyment, results, authority, safety and order. For fun.",
    fw: "culture-8",
  },
  conflict: {
    title: "Conflict style quiz: your Thomas-Kilmann mode",
    description: "A free conflict style quiz on the five Thomas-Kilmann modes: competing, collaborating, compromising, avoiding and accommodating. Six everyday clashes.",
    fw: "tki",
  },
  style: {
    title: "Leadership style quiz: which of Goleman’s six is yours?",
    description: "A free leadership style quiz: six situations show which of Goleman’s six styles you reach for, from coaching to pacesetting. For fun, not a validated test.",
    fw: "goleman-6",
  },
  power: {
    title: "Power quiz: which of French and Raven’s bases is yours?",
    description: "Six situations trace why people go along with you, across French and Raven’s bases of power: reward, coercive, legitimate, expert, referent and informational.",
    fw: "power-bases",
  },
  listen: {
    title: "Listening styles quiz: what kind of listener are you?",
    description: "Eight moments show what you listen for, based on the four goals of the Listening Styles Profile. For fun, not the profile itself.",
  },
  values: {
    title: "Values card sort: find your top five values, free online",
    description: "A free values card sort: pick ten values, rank your top five, then check them against how you spent your week.",
  },
  job: {
    title: "Job Diagnostic Survey: score your job’s motivating potential",
    description: "Hackman and Oldham’s Job Diagnostic Survey, online: score your own job on the five core characteristics and get its motivating potential score (MPS).",
    fw: "jcm",
  },
  rewind: {
    title: "Feedback practice: a hard conversation you can rewind",
    description: "Feedback practice: give hard feedback to an analyst whose reports keep coming in late, one line at a time. Rewind any line and try another.",
  },
  network: {
    title: "Network map: your network constraint and structural holes",
    description: "Map your professional network: name the people you talk work through with, mark who knows whom, and get Burt’s network constraint. Names stay in your browser.",
    fw: "brokerage",
  },
  bounce: {
    title: "Brief Resilience Scale: how fast do you bounce back?",
    description: "The Brief Resilience Scale, free online: six statements score how quickly you recover after stress, against the normal range. Smith and colleagues, 2008.",
  },
  bias: {
    title: "Cognitive bias quiz: spot the decision trap in 60 seconds",
    description: "A 60-second cognitive bias quiz: spot the trap in each pitch, from anchoring and sunk cost to groupthink, before the clock runs out.",
    fw: "traps",
  },
  climb: {
    title: "Kotter’s 8 steps quiz: tap them in order",
    description: "Tap Kotter’s eight steps of change in order and beat your time.",
    fw: "kotter-8",
  },
}

/** The games that play a framework, for its page. */
export const gamesForFramework = (id: string) => GAMES.filter((g) => GAME_SEARCH[g.id].fw === id)
export const frameworkPath = (id: string) => `/frameworks/${id}/`
