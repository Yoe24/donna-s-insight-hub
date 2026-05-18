import { useEffect, useRef, ReactNode } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

interface Props {
  children: ReactNode
  delay?: number
  y?: number
  stagger?: number
  className?: string
}

export default function ScrollReveal({ children, delay = 0, y = 40, stagger = 0, className }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const targets = stagger > 0 ? Array.from(el.children) : el
    const ctx = gsap.context(() => {
      gsap.from(targets, {
        y,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        delay,
        stagger: stagger || 0,
        scrollTrigger: {
          trigger: el,
          start: "top 82%",
          toggleActions: "play none none none",
        },
      })
    }, el)
    return () => ctx.revert()
  }, [delay, y, stagger])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
