import { llmsText } from "@/lib/seo"

export const dynamic = "force-static"

/** /llms.txt for AI assistants, written from the course data at build time. */
export function GET() {
  return new Response(llmsText(false), { headers: { "Content-Type": "text/plain; charset=utf-8" } })
}
