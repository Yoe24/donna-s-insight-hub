const LOGOS = [
  { src: "/logos/gmail.svg", alt: "Gmail" },
  { src: "/logos/googlecalendar.svg", alt: "Google Calendar" },
  { src: "/logos/googledrive.svg", alt: "Google Drive" },
  { src: "/logos/outlook.svg", alt: "Outlook" },
  { src: "/logos/microsoft365.svg", alt: "Microsoft 365" },
  { src: "/logos/microsoftteams.svg", alt: "Microsoft Teams" },
  { src: "/logos/microsoftword.svg", alt: "Microsoft Word" },
  { src: "/logos/onedrive.svg", alt: "OneDrive" },
]

export default function MarqueeIntegrations() {
  const items = [...LOGOS, ...LOGOS, ...LOGOS]
  return (
    <div className="marquee-mask">
      <div className="marquee-track">
        {items.map((logo, i) => (
          <div className="marquee-item" key={i}>
            <img src={logo.src} alt={logo.alt} title={logo.alt} loading="lazy" />
            <span>{logo.alt}</span>
          </div>
        ))}
      </div>
      <style>{`
        .marquee-mask {
          width: 100%;
          overflow: hidden;
          mask-image: linear-gradient(90deg, transparent 0%, #000 10%, #000 90%, transparent 100%);
          -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 10%, #000 90%, transparent 100%);
        }
        .marquee-track {
          display: flex;
          gap: 72px;
          width: max-content;
          animation: marquee 42s linear infinite;
          align-items: center;
        }
        .marquee-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          flex-shrink: 0;
          width: 110px;
        }
        .marquee-item img {
          height: 52px;
          width: 52px;
          object-fit: contain;
          transition: transform 220ms ease;
        }
        .marquee-item:hover img { transform: scale(1.1); }
        .marquee-item span {
          font-size: 12px;
          color: #737373;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          white-space: nowrap;
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
