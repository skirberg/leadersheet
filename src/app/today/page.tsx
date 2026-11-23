import type { Metadata } from "next"
import { CallPreviews } from "@/components/play/call-face"
import { TodaysCall } from "@/components/play/todays-call"
import { shareCard } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Today's call",
  description: "One leadership decision a day. Make the call, say how sure you are, then see what follows and why the other calls fall short.",
  alternates: { canonical: "/today/" },
  ...shareCard("/og/today.png"),
}

export default function TodayPage() {
  return (
    // The page's name in the rail, the call from column 4 across seven columns (DESIGN.md, Grid).
    <div className="page">
      <div className="span-wide grid grid-cols-subgrid gap-y-6">
        <h1 className="span-rail text-[40px] leading-[1.08] sm:text-[52px] lg:text-[40px]">Today&apos;s call</h1>
        <div className="span-main grid gap-6 lg:max-w-cols-7">
          <TodaysCall>
            <CallPreviews />
          </TodaysCall>
        </div>
      </div>
    </div>
  )
}
