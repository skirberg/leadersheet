export type Brand = {
  id: string
  name: string
  shortName: string
  /** Small line under the wordmark. */
  descriptor: string
  /** Default page title. */
  title: string
  description: string
  /** How the brand emphasizes a phrase: a drawn underline or a highlighter swipe. */
  emphasis: "underline" | "highlight"
  author: { name: string; url: string }
  repo: string
  /** Canonical address, used when the build host does not provide one. */
  url: string
  themeColor: { light: string; dark: string }
}
