import { useEffect, useRef } from "react"

export default function HeroOrb() {
  const parallaxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = parallaxRef.current
    if (!el) return
    let raf = 0
    let tx = 0, ty = 0
    let cx = 0, cy = 0

    function onMove(e: PointerEvent) {
      const w = window.innerWidth
      const h = window.innerHeight
      tx = (e.clientX / w - 0.5) * 2
      ty = (e.clientY / h - 0.5) * 2
    }

    function tick() {
      cx += (tx - cx) * 0.05
      cy += (ty - cy) * 0.05
      const scroll = window.scrollY
      const py = scroll * -0.18
      el!.style.transform = `translate3d(${cx * 18}px, ${py + cy * 14}px, 0)`
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
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        ref={parallaxRef}
        style={{
          width: "100%",
          height: "100%",
          willChange: "transform",
          filter: "drop-shadow(0 60px 80px rgba(13,13,13,0.25))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          className="hero-orb-breathe"
          style={{
            width: "100%",
            height: "100%",
            willChange: "transform",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src="/hero-orb.jpg"
            alt=""
            loading="eager"
            decoding="async"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              mixBlendMode: "multiply",
            }}
          />
        </div>
      </div>
      <style>{`
        .hero-orb-breathe {
          animation: heroBreathe 7s ease-in-out infinite alternate;
        }
        @keyframes heroBreathe {
          0%   { transform: scale(1) rotate(0deg); }
          100% { transform: scale(1.035) rotate(-2deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-orb-breathe { animation: none; }
        }
      `}</style>
    </div>
  )
}
