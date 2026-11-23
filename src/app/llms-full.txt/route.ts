import { llmsText } from "@/lib/seo"

export const dynamic = "force-static"

/** /llms-full.txt for AI assistants, written from the course data at build time. */
export function GET() {
  return new Response(llmsText(true), { headers: { "Content-Type": "text/plain; charset=utf-8" } })
}
