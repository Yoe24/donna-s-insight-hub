import { useEffect, useRef } from "react"

export default function InteractiveBackground() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    let tx = 50, ty = 35
    let cx = 50, cy = 35

    function onMove(e: PointerEvent) {
      tx = (e.clientX / window.innerWidth) * 100
      ty = (e.clientY / window.innerHeight) * 100
    }

    function tick() {
      cx += (tx - cx) * 0.06
      cy += (ty - cy) * 0.06
      el!.style.setProperty("--mx", `${cx}%`)
      el!.style.setProperty("--my", `${cy}%`)
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener("pointermove", onMove, { passive: true })
    raf = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener("pointermove", onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        background:
          "radial-gradient(900px 700px at var(--mx,50%) var(--my,35%), rgba(37,99,235,0.12), transparent 60%), radial-gradient(700px 500px at calc(100% - var(--mx,50%)) calc(100% - var(--my,35%)), rgba(99,102,241,0.08), transparent 70%)",
        transition: "background 100ms linear",
      }}
    >
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.35, mixBlendMode: "multiply" }}>
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.08 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>
    </div>
  )
}
