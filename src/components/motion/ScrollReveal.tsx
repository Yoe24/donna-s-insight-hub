import { useEffect, useRef, ReactNode } from "react"

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

    const targets: HTMLElement[] = stagger > 0
      ? Array.from(el.children).filter((c): c is HTMLElement => c instanceof HTMLElement)
      : [el]

    targets.forEach((t, i) => {
      t.style.opacity = "0"
      t.style.transform = `translateY(${y}px)`
      t.style.transition = `opacity 800ms cubic-bezier(0.22,1,0.36,1) ${delay + i * stagger}s, transform 900ms cubic-bezier(0.22,1,0.36,1) ${delay + i * stagger}s`
      t.style.willChange = "opacity, transform"
    })

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement
            target.style.opacity = "1"
            target.style.transform = "translateY(0)"
            io.unobserve(target)
          }
        })
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    )

    targets.forEach((t) => io.observe(t))

    return () => io.disconnect()
  }, [delay, y, stagger])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
