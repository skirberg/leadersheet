import type { Brand } from "../../types"
import { COLORS } from "./tokens.ts"

export const BRAND: Brand = {
  id: "leadersheet",
  name: "Leadersheet",
  shortName: "Leadersheet",
  descriptor: "Learn leadership by doing",
  title: "Leadersheet · Learn leadership by doing",
  description:
    "Twenty-four short, hands-on lessons on how leaders build teams, earn trust, shape culture and drive change. Free, no sign-up.",
  emphasis: "highlight",
  author: { name: "skirberg", url: "https://github.com/skirberg" },
  repo: "https://github.com/skirberg/leadersheet",
  url: "https://leadersheet.io",
  themeColor: { light: COLORS.light.background, dark: COLORS.dark.background },
  never: ["unlock", "journey", "empower", "leverage", "synergy", "game-changer", "supercharge", "unleash", "seamless"],
}
