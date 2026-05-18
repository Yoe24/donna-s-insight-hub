const LOGOS = [
  { src: "/logos/gmail.svg", alt: "Gmail" },
  { src: "/logos/outlook.svg", alt: "Outlook" },
  { src: "/logos/microsoft365.svg", alt: "Microsoft 365" },
  { src: "/logos/onedrive.svg", alt: "OneDrive" },
  { src: "/logos/googledrive.svg", alt: "Google Drive" },
  { src: "/logos/googlecalendar.svg", alt: "Google Calendar" },
  { src: "/logos/microsoftteams.svg", alt: "Teams" },
  { src: "/logos/microsoftword.svg", alt: "Word" },
]

export default function MarqueeIntegrations() {
  const items = [...LOGOS, ...LOGOS, ...LOGOS]
  return (
    <div className="marquee-mask">
      <div className="marquee-track">
        {items.map((logo, i) => (
          <div className="marquee-item" key={i}>
            <img src={logo.src} alt={logo.alt} loading="lazy" />
          </div>
        ))}
      </div>
      <style>{`
        .marquee-mask {
          width: 100%;
          overflow: hidden;
          mask-image: linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%);
          -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%);
        }
        .marquee-track {
          display: flex;
          gap: 72px;
          width: max-content;
          animation: marquee 38s linear infinite;
        }
        .marquee-item {
          height: 52px;
          display: flex;
          align-items: center;
          opacity: 0.78;
          transition: opacity 240ms ease;
        }
        .marquee-item:hover { opacity: 1; }
        .marquee-item img {
          height: 100%;
          width: auto;
          object-fit: contain;
          filter: grayscale(100%) brightness(0);
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.3333%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none; }
        }
      `}</style>
    </div>
  )
}
