import { CULTURE_STYLES, TKI_MODES } from "./labs"
import { LEAD_STYLES, LISTEN_STYLES, POWER_BASES } from "./games"
import { WAYS, WAY_DESC, WAY_LESSONS, type Way } from "./decide"

/* Shareable quiz results: every outcome gets its own page and its own share image. */
export type ResultGame = "culture" | "conflict" | "style" | "power" | "listen" | "decide"

/* The result when no style leads, in any quiz (see leadOf in components/play/games.tsx). */
export const SPREAD = "Spread"

export const RESULT_GAMES: Record<
  ResultGame,
  {
    question: string
    /** Every result with a page and a card. */
    keys: string[]
    /** The named styles, for the row of links under a result. */
    styles: string[]
    /** The heading over that row. */
    all: string
    /** The line under a result page. */
    note: string
    sheet: string
    /** Lessons that help with this result, when the game names them (how you decide). */
    lessons?: (k: string) => string[]
    label: (k: string) => string
    desc: (k: string) => string
    /** The result as a headline: words before the emphasis, the emphasised word, words after. */
    heading: (k: string) => [string, string, string]
  }
> = {
  culture: {
    question: "Which culture fits you?",
    keys: [...Object.keys(CULTURE_STYLES), SPREAD],
    styles: Object.keys(CULTURE_STYLES),
    all: "All eight cultures",
    note: "For fun, not a validated assessment.",
    sheet: "s4",
    label: (k) => (k === SPREAD ? "No single culture" : `${k} culture`),
    desc: (k) => (k === SPREAD ? "No clear lead. Your answers spread across the map." : `${CULTURE_STYLES[k][2]}.`),
    heading: (k) => (k === SPREAD ? ["No ", "single", " culture"] : ["", k, " culture"]),
  },
  conflict: {
    question: "How do you fight?",
    keys: [...Object.keys(TKI_MODES), SPREAD],
    styles: Object.keys(TKI_MODES),
    all: "All five styles",
    note: "For fun, not a validated assessment.",
    sheet: "s7",
    label: (k) => (k === SPREAD ? "No go-to style" : k),
    desc: (k) => (k === SPREAD ? "No clear lead. Your answers spread across the chart." : TKI_MODES[k][2]),
    heading: (k) => (k === SPREAD ? ["No ", "go-to", " style"] : ["", k, ""]),
  },
  style: {
    question: "Which leadership style is yours?",
    keys: [...Object.keys(LEAD_STYLES), SPREAD],
    styles: Object.keys(LEAD_STYLES),
    all: "All six styles",
    note: "For fun, not a validated assessment. Based on Goleman (2000).",
    sheet: "s14",
    label: (k) => (k === SPREAD ? "No single style" : `${k} style`),
    desc: (k) => (k === SPREAD ? "No clear lead. Your answers spread across the six." : LEAD_STYLES[k]),
    heading: (k) => (k === SPREAD ? ["No ", "single", " style"] : ["", k, ""]),
  },
  power: {
    question: "Where does your power come from?",
    keys: [...Object.keys(POWER_BASES), SPREAD],
    styles: Object.keys(POWER_BASES),
    all: "All six bases",
    note: "For fun, not a validated assessment. Based on French and Raven (1959) and Raven (1965).",
    sheet: "s13",
    label: (k) => (k === SPREAD ? "No single base" : `${k} power`),
    desc: (k) => (k === SPREAD ? "No clear lead. Your answers spread across all six." : POWER_BASES[k]),
    heading: (k) => (k === SPREAD ? ["No ", "single", " base"] : ["", k, " power"]),
  },
  listen: {
    question: "What kind of listener are you?",
    keys: [...Object.keys(LISTEN_STYLES), SPREAD],
    styles: Object.keys(LISTEN_STYLES),
    all: "All four goals",
    note: "For fun, not the Listening Styles Profile. Based on its four goals (Bodie, Worthington and Gearhart, 2013).",
    sheet: "s9",
    label: (k) => (k === SPREAD ? "No single goal" : `${k} listener`),
    desc: (k) => (k === SPREAD ? "No clear lead. Your answers spread across all four." : LISTEN_STYLES[k]),
    heading: (k) => (k === SPREAD ? ["No ", "single", " goal"] : ["", k, " listener"]),
  },
  decide: {
    question: "How do you decide?",
    keys: [...WAYS, SPREAD],
    styles: [...WAYS],
    all: "All four ways",
    note: "For fun, not a validated assessment. Based on Tannenbaum and Schmidt (1958, 1973).",
    sheet: "s19",
    lessons: (k) => WAY_LESSONS[k === SPREAD ? "Spread" : (k as Way)] ?? WAY_LESSONS.Spread,
    label: (k) => (k === SPREAD ? "No single way" : k),
    desc: (k) => (k === SPREAD ? "No clear lead. Your answers moved along the line." : WAY_DESC[k as Way]),
    heading: (k) => (k === SPREAD ? ["No ", "single", " way"] : ["", k, ""]),
  },
}

export const resultSlug = (key: string) => key.toLowerCase().replaceAll(" ", "-")
export const resultKey = (game: ResultGame, slug: string) => RESULT_GAMES[game].keys.find((k) => resultSlug(k) === slug)
export const resultPath = (game: ResultGame, key: string) => `/play/results/${game}/${resultSlug(key)}/`
export const resultImage = (game: ResultGame, key: string) => `/og/${game}-${resultSlug(key)}.png`
export const allResults = () =>
  (Object.keys(RESULT_GAMES) as ResultGame[]).flatMap((g) => RESULT_GAMES[g].keys.map((k) => ({ game: g, key: k })))
