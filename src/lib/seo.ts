import type { Metadata } from "next"
import { BRAND } from "@/brand"
import { SITE_URL } from "@/lib/site-url"
import { FRAMEWORKS, SESSIONS, fwById, type Framework, type Session } from "@/data/course"
import { lessonHref } from "@/lib/paths"
import { GRADE_LABEL, caseFor } from "@/data/cases"
import { GAMES } from "@/data/games"
import { GAME_SEARCH, frameworkPath, frameworkSearchTitle, lessonSearchTitle } from "@/lib/search-terms"

export { GAME_SEARCH, frameworkDescription, frameworkHeading, frameworkPath, frameworkSearchTitle, gamesForFramework, lessonSearchTitle } from "@/lib/search-terms"

export const abs = (path: string) => `${SITE_URL}${path}`

/**
 * A page's own share card in its metadata. A page's openGraph replaces the layout's whole, so the site name, type and
 * address go back in here; the title and description are the page's own unless given (Next fills them in).
 */
export function shareCard(image: string, og: { title?: string; description?: string; type?: "website" | "article" } = {}): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: { url: "./", siteName: BRAND.name, type: og.type ?? "website", ...(og.title && { title: og.title }), ...(og.description && { description: og.description }), images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", images: [image] },
  }
}

const COURSE_NAME = `${BRAND.name}: leadership in twenty-four lessons`

/** The course as a whole, for the lessons index. */
export function courseJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: COURSE_NAME,
    description: BRAND.description,
    url: abs("/learn/"),
    inLanguage: "en",
    isAccessibleForFree: true,
    educationalLevel: "Introductory",
    provider: { "@type": "Organization", name: BRAND.name, url: `${SITE_URL}/` },
    offers: { "@type": "Offer", price: 0, priceCurrency: "USD", category: "Free" },
    hasCourseInstance: { "@type": "CourseInstance", courseMode: "Online" },
    hasPart: SESSIONS.map((s) => ({ "@type": "LearningResource", name: lessonSearchTitle(s), url: abs(lessonHref(s)), position: s.n })),
  }
}

/** One lesson: what it teaches (its frameworks) and what it summarizes (its readings), and where it sits in the site. */
export function lessonJsonLd(s: Session) {
  return {
    "@context": "https://schema.org",
    "@graph": [lessonResource(s), breadcrumbs([["Home", "/"], ["Lessons", "/learn/"], [s.title, lessonHref(s)]])],
  }
}

/** The trail search results can show above a page's title. */
export function breadcrumbs(trail: [name: string, path: string][]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: abs(path) })),
  }
}

function lessonResource(s: Session) {
  return {
    "@type": "LearningResource",
    name: lessonSearchTitle(s),
    description: s.idea,
    url: abs(lessonHref(s)),
    learningResourceType: "Lesson",
    position: s.n,
    inLanguage: "en",
    isAccessibleForFree: true,
    teaches: s.fw.map((id) => fwById(id)?.name).filter(Boolean),
    citation: s.readings.map((r) => ({
      "@type": "CreativeWork",
      name: r.t,
      author: r.a,
      publisher: r.src,
      ...(r.url ? { url: r.url } : {}),
    })),
    isPartOf: { "@type": "Course", name: COURSE_NAME, url: abs("/learn/") },
  }
}

/** The site itself, for the home page. No SearchAction: search is a menu in the page, not a URL. */
export function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND.name,
    url: `${SITE_URL}/`,
    description: BRAND.description,
    inLanguage: "en",
  }
}

/** Plain text for AI assistants (llms.txt and llms-full.txt), built from the same course data as the pages. */
export function llmsText(full: boolean) {
  const lines = [
    `# ${BRAND.name}`,
    "",
    `> ${BRAND.name} (${SITE_URL}) is a free leadership course in twenty-four short lessons: the idea, a model you can move, a decision to make, the frameworks, a three question check and a game. Summaries are for learning; read the originals.`,
    "",
  ]
  if (!full) {
    lines.push(
      "## Start here",
      "",
      `- [Home](${abs("/")}): what the site is`,
      `- [Twenty-four lessons](${abs("/learn/")}): every lesson in order`,
      `- [Frameworks](${abs("/frameworks/")}): every framework on one page, each with its own page`,
      `- [Today's call](${abs("/today/")}): one leadership decision a day, the same for everyone; run it with a room at ${abs("/today/class/")}`,
      `- [Play](${abs("/play/")}): quizzes, games and published self-checks built on the frameworks`,
      `- [Practice](${abs("/practice/")}): a drill of what you missed, coming back on days 1, 3, 7 and 21`,
      `- [Full text](${abs("/llms-full.txt")}): every lesson and framework as plain text in one file`,
      "",
      "## Lessons",
      "",
      ...SESSIONS.map((s) => `- [${lessonSearchTitle(s)}](${abs(lessonHref(s))}): ${s.idea}`),
      "",
      "## Frameworks",
      "",
      ...FRAMEWORKS.map((f) => `- [${frameworkSearchTitle(f)}](${abs(frameworkPath(f.id))}): ${f.one}`),
      "",
      "## Play",
      "",
      // written from the arcade's own list, so a new game is listed the day it ships
      ...GAMES.map((g) => `- [${GAME_SEARCH[g.id].title}](${abs(`/play/${g.id}/`)}): ${GAME_SEARCH[g.id].description}`),
    )
    return lines.join("\n") + "\n"
  }
  for (const s of SESSIONS) {
    lines.push(`## ${s.n}. ${lessonSearchTitle(s)}`, "", `Page: ${abs(lessonHref(s))}`, "", s.idea, "")
    for (const r of s.readings) {
      lines.push(`Reading: ${r.t}, ${r.a}, ${r.src}, ${r.y}.${r.url ? ` ${r.url}` : ""}`, "", r.idea, "", ...r.points.map((p) => `- ${p}`), "")
    }
    for (const f of s.fw.map(fwById)) {
      if (!f) continue
      lines.push(`### ${f.name} (${f.by})`, "", `Page: ${abs(frameworkPath(f.id))}`, "", f.one, "", ...f.rows.map(([k, v]) => `- ${k}: ${v}`), "")
    }
    const cs = caseFor(s.id)
    if (cs) {
      lines.push(`Your call: ${cs.role} ${cs.setup} ${cs.ask}`, "")
      for (const ch of cs.choices) lines.push(`- ${ch.says} (${GRADE_LABEL[ch.grade]}.) ${ch.then}`)
      lines.push("")
    }
    if (s.checks.length) {
      lines.push("Check yourself:", "")
      for (const c of s.checks) lines.push(`- ${c.q.replace(/\s*$/, "")}${/[?.:]$/.test(c.q.trim()) ? "" : ":"} ${c.o[c.a]}. ${c.why}`)
      lines.push("")
    }
  }
  const shown = new Set(SESSIONS.flatMap((s) => s.fw))
  const rest = FRAMEWORKS.filter((f) => !shown.has(f.id))
  if (rest.length) {
    lines.push("## More frameworks", "")
    for (const f of rest) lines.push(`### ${f.name} (${f.by})`, "", f.one, "", ...f.rows.map(([k, v]) => `- ${k}: ${v}`), "")
  }
  return lines.join("\n").replace(/\n{3,}/g, "\n\n") + "\n"
}


const FW_SET = { "@type": "DefinedTermSet", name: `${BRAND.name} leadership frameworks`, url: abs("/frameworks/") }

/** One framework as a defined term, tied to the lesson that teaches it, plus its breadcrumb trail. */
export function frameworkJsonLd(f: Framework, s: Session) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "DefinedTerm",
        name: f.name,
        alternateName: frameworkSearchTitle(f),
        description: f.one,
        url: abs(frameworkPath(f.id)),
        inDefinedTermSet: FW_SET,
        subjectOf: { "@type": "LearningResource", name: lessonSearchTitle(s), url: abs(lessonHref(s)) },
      },
      breadcrumbs([["Home", "/"], ["Frameworks", "/frameworks/"], [f.name, frameworkPath(f.id)]]),
    ],
  }
}

/** Every framework as one set, for the frameworks index. */
export function frameworksJsonLd() {
  return {
    "@context": "https://schema.org",
    ...FW_SET,
    description: `Every leadership framework from all twenty-four ${BRAND.name} lessons, each with its own page.`,
    hasDefinedTerm: FRAMEWORKS.map((f) => ({ "@type": "DefinedTerm", name: f.name, url: abs(frameworkPath(f.id)) })),
  }
}
