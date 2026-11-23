/*
  What the brand kit contains: the one list that the kit generator (scripts/make-brand-kit.ts), its check
  (scripts/brand-check.ts), the packer (scripts/brand-pack.ts) and the /brand page all read. Plain TypeScript with
  no imports, so Node runs it directly. Sizes follow the shared kit spec of 20 November 2026.
  Everything is drawn from the active preset: its LogoMark and Wordmark (logo.tsx), its app icon and its tokens.
*/

/** Where the kit lives under public/ and on the site. */
export const KIT_DIR = "brand"

export const LOGO_VARIANTS = ["color", "reversed", "black", "white"] as const
export const MARK_VARIANTS = ["color", "reversed", "black", "white", "tile"] as const
export type LogoVariant = (typeof LOGO_VARIANTS)[number]
export type MarkVariant = (typeof MARK_VARIANTS)[number]

/** PNG widths for the lockup and the wordmark, and PNG sizes for the mark. */
export const LOGO_WIDTHS = [512, 1024, 2048]
export const MARK_SIZES = [64, 128, 256, 512, 1024]

/** What each variant is for, in the words the /brand page shows. */
export const VARIANT_USE: Record<MarkVariant, string> = {
  color: "On light grounds",
  reversed: "On dark grounds",
  black: "One colour, black",
  white: "One colour, white",
  tile: "App icon and avatars",
}

/**
 * Social images. `safe` is the box (x, y, width, height) that holds every word and the cards, so a platform's crop or
 * its profile photo never covers them. `cards` picks lessons from the home strip (src/components/learn/hero-cards.tsx).
 */
export type Banner = {
  id: string
  w: number
  h: number
  theme: "light" | "dark"
  kind: "wide" | "tall" | "avatar"
  safe: [number, number, number, number]
  /** Headline size and wordmark height in px. */
  type: [number, number]
  cards: number[]
  use: string
}

const wide = (id: string, w: number, h: number, safe: Banner["safe"], type: Banner["type"], cards: number[], use: string): Banner[] => [
  { id, w, h, theme: "light", kind: "wide", safe, type, cards, use },
  { id: `${id}-dark`, w, h, theme: "dark", kind: "wide", safe, type, cards, use },
]

export const BANNERS: Banner[] = [
  { id: "avatar-400", w: 400, h: 400, theme: "light", kind: "avatar", safe: [0, 0, 400, 400], type: [0, 0], cards: [], use: "Avatar for X, LinkedIn, GitHub" },
  { id: "avatar-800", w: 800, h: 800, theme: "light", kind: "avatar", safe: [0, 0, 800, 800], type: [0, 0], cards: [], use: "Avatar for YouTube" },
  ...wide("x-header-1500x500", 1500, 500, [360, 80, 1080, 340], [64, 26], [2, 3, 4], "X header"),
  ...wide("linkedin-cover-1512x256", 1512, 256, [300, 34, 1100, 188], [44, 20], [2, 3, 4, 5], "LinkedIn page cover"),
  ...wide("linkedin-banner-1584x396", 1584, 396, [400, 56, 1100, 284], [56, 24], [2, 3, 4], "LinkedIn profile background"),
  ...wide("youtube-banner-2560x1440", 2560, 1440, [507, 509, 1546, 423], [84, 34], [1, 2, 3, 4, 5], "YouTube channel art"),
  ...wide("github-social-1280x640", 1280, 640, [80, 80, 1120, 480], [76, 30], [2, 3, 4], "GitHub social preview"),
  { id: "instagram-1080x1080", w: 1080, h: 1080, theme: "light", kind: "tall", safe: [90, 110, 900, 860], type: [84, 32], cards: [2, 3, 4], use: "Instagram post" },
  { id: "instagram-1080x1350", w: 1080, h: 1350, theme: "light", kind: "tall", safe: [90, 140, 900, 1070], type: [100, 36], cards: [2, 3, 4], use: "Instagram portrait post" },
  { id: "story-1080x1920", w: 1080, h: 1920, theme: "light", kind: "tall", safe: [90, 250, 900, 1330], type: [108, 38], cards: [2, 3, 4], use: "Instagram and TikTok story" },
]

export const bannerById = (id: string) => BANNERS.find((b) => b.id === id)

/** Clear space and minimum size, as the /brand page draws them and the kit's README states them. */
export const CLEAR_SPACE = 0.25 // of the mark's height, on every side
export const MIN_SIZE = { mark: 16, wordmark: 16, lockup: 24 } // px tall on screen
export const LOCKUP_RULES = {
  clearSpace: "keep a quarter of the mark's height clear on every side (the tile's own corner radius).",
  minimum: `mark ${MIN_SIZE.mark} px, wordmark ${MIN_SIZE.wordmark} px tall, lockup ${MIN_SIZE.lockup} px tall on screen.`,
}
