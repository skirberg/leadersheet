import { CULTURE_STYLES, TKI_MODES } from "./labs"

/* Shareable quiz results: every outcome gets its own page and its own share image. */
export type ResultGame = "culture" | "conflict"

export const RESULT_GAMES: Record<ResultGame, { question: string; keys: string[]; sheet: string; suffix: string; label: (k: string) => string; desc: (k: string) => string }> = {
  culture: {
    question: "Which culture fits you?",
    keys: Object.keys(CULTURE_STYLES),
    sheet: "s4",
    suffix: "culture",
    label: (k) => `${k} culture`,
    desc: (k) => `${CULTURE_STYLES[k][2]}.`,
  },
  conflict: {
    question: "How do you fight?",
    keys: Object.keys(TKI_MODES),
    sheet: "s7",
    suffix: "",
    label: (k) => k,
    desc: (k) => TKI_MODES[k][2],
  },
}

export const resultSlug = (key: string) => key.toLowerCase()
export const resultKey = (game: ResultGame, slug: string) => RESULT_GAMES[game].keys.find((k) => resultSlug(k) === slug)
export const resultPath = (game: ResultGame, key: string) => `/play/results/${game}/${resultSlug(key)}/`
export const resultImage = (game: ResultGame, key: string) => `/og/${game}-${resultSlug(key)}.png`
export const allResults = () =>
  (Object.keys(RESULT_GAMES) as ResultGame[]).flatMap((g) => RESULT_GAMES[g].keys.map((k) => ({ game: g, key: k })))
