import type { Metadata } from "next"
import { SheetView } from "@/components/sheet/sheet-view"

// Everything on this page comes from the visitor's own browser (or from a shared link's #), so the server sends only
// the frame; the sheet draws itself once saved progress has loaded.
export const metadata: Metadata = {
  title: "Your sheet",
  description: "One page that fills in as you go: your calls and how they graded, how you lead, your five values and what people see in you, your best scores. Print it or send it.",
  openGraph: { title: "Your sheet", description: "It fills in as you go. Print it or send it.", url: "./", images: [{ url: "/og/sheet.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", images: ["/og/sheet.png"] },
}

export default function SheetPage() {
  return (
    // A document on the middle eight columns, like a page on a desk (DESIGN.md, Grid); paper size takes over in print.
    <div className="page print:block print:max-w-none print:p-0">
      <div className="span-center grid min-w-0 gap-8">
        <SheetView />
      </div>
    </div>
  )
}
