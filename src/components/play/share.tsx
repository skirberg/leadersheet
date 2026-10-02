"use client"

import * as React from "react"
import { Check as CheckIcon, Download, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * Share a result. Phones get the native share sheet, with the result card attached when the
 * platform accepts files. Elsewhere the link is copied. The card can also be saved as an image.
 */
export function ShareResult({ text, path, image, fileName }: { text: string; path: string; image?: string; fileName?: string }) {
  const [status, setStatus] = React.useState<"" | "copied" | "shared" | "manual">("")
  const [link, setLink] = React.useState("")
  const share = async () => {
    const url = new URL(path, window.location.origin).toString()
    setLink(url)
    try {
      if (navigator.share) {
        let files: File[] | undefined
        if (image && navigator.canShare) {
          try {
            const blob = await (await fetch(image)).blob()
            const f = new File([blob], fileName ?? "leadersheet-result.png", { type: "image/png" })
            if (navigator.canShare({ files: [f] })) files = [f]
          } catch {}
        }
        await navigator.share(files ? { files, text: `${text} ${url}` } : { title: text, text, url })
        setStatus("shared")
        return
      }
    } catch (e) {
      if ((e as Error)?.name === "AbortError") return
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`)
      setStatus("copied")
    } catch {
      // Clipboard blocked: show the link to copy by hand, never a blocking dialog.
      setStatus("manual")
    }
  }
  return (
    <>
      <Button onClick={share}>
        {status ? <CheckIcon className="size-4" /> : <Share2 className="size-4" />}
        {status === "copied" ? "Link copied" : status === "shared" ? "Shared" : status === "manual" ? "Copy the link below" : "Share my result"}
      </Button>
      {image && (
        <Button asChild variant="outline">
          <a href={image} download={fileName ?? true}>
            <Download className="size-4" /> Save card
          </a>
        </Button>
      )}
      {status === "manual" && (
        <input
          readOnly
          aria-label="Result link"
          value={link}
          onFocus={(e) => e.currentTarget.select()}
          className="h-11 w-full min-w-0 basis-full rounded-md border border-rule/60 bg-card px-3 font-mono text-xs"
        />
      )}
      <span className="sr-only" role="status">
        {status === "copied" ? "Link copied" : status === "manual" ? "Copy the link from the field" : ""}
      </span>
    </>
  )
}
