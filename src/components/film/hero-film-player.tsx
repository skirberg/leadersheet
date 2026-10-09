"use client"

import * as React from "react"
import { Player, type PlayerRef } from "@remotion/player"
import { HeroFilm } from "./hero-film"
import { HERO } from "./hero-spec"

/** The hero film: plays muted on loop while on screen; a still frame for reduced motion. HeroPlayer loads it after the page paints. */
export default function HeroFilmPlayer({ rm }: { rm: boolean }) {
  // The player mounts with this component, so the ref is set before the effects below run.
  const ref = React.useRef<PlayerRef>(null)

  // Reduced motion: hold a still, fully drawn frame even if the setting changes while open.
  React.useEffect(() => {
    if (rm) {
      ref.current?.pause()
      ref.current?.seekTo(100)
    }
  }, [rm])

  React.useEffect(() => {
    const node = ref.current?.getContainerNode()
    if (rm || !node) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) ref.current?.play()
      else ref.current?.pause()
    })
    io.observe(node)
    return () => io.disconnect()
  }, [rm])

  return (
    <Player
      ref={ref}
      component={HeroFilm}
      durationInFrames={HERO.durationInFrames}
      fps={HERO.fps}
      compositionWidth={HERO.width}
      compositionHeight={HERO.height}
      style={{ width: "100%", height: "100%" }}
      loop
      // The film is silent. Muted and with no shared audio tags, Remotion skips setting up Web Audio (about 130 ms of main thread on a laptop, four times that on a phone).
      initiallyMuted
      numberOfSharedAudioTags={0}
      autoPlay={!rm}
      initialFrame={rm ? 100 : 0}
      controls={false}
      clickToPlay={false}
      doubleClickToFullscreen={false}
      spaceKeyToPlayOrPause={false}
      acknowledgeRemotionLicense
    />
  )
}
