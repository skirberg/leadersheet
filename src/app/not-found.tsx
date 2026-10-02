import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="mx-auto grid max-w-[720px] gap-5 px-4 pt-20 sm:px-6">
      <p className="label-mono">Sheet not found · 404</p>
      <h1 className="text-5xl leading-none font-semibold tracking-[-0.03em]">No sheet at this address. The set has twelve.</h1>
      <div>
        <Button asChild size="lg">
          <Link href="/learn/">See all twelve</Link>
        </Button>
      </div>
    </div>
  )
}
