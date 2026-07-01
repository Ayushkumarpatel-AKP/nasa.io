import { useEffect, useRef } from "react";

const IconOrbit = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <circle cx="12" cy="12" r="2.5" />
    <ellipse cx="12" cy="12" rx="9" ry="4.5" />
    <path d="M4.5 8.5c2.2 2.5 4.6 3.9 7.5 3.9s5.3-1.4 7.5-3.9" />
  </svg>
);

const IconSignal = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M3 17h3l2-6 3 9 3-12 2 9h5" />
    <circle cx="18" cy="6" r="2" />
  </svg>
);

const IconImpact = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M12 3l7 4v5c0 4.4-2.9 7.5-7 9-4.1-1.5-7-4.6-7-9V7l7-4z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const cards = [
  {
    title: "Mission Pulse",
    description:
      "We track atmosphere, oceans, and biosphere in one cinematic data layer so teams can react faster.",
    stat: "24/7 Earth Watch",
    accent: "from-emerald-400/35 to-lime-400/0",
    icon: <IconOrbit />,
  },
  {
    title: "Signal to Action",
    description:
      "From raw satellite streams to actionable intel, NASA.io turns planetary noise into clear decisions.",
    stat: "3.2M+ data points/day",
    accent: "from-green-400/35 to-emerald-400/0",
    icon: <IconSignal />,
  },
  {
    title: "Built for Impact",
    description:
      "Designed for researchers, policy teams, and climate builders who need speed, trust, and elegance.",
    stat: "Global collaborative scope",
    accent: "from-lime-400/35 to-emerald-400/0",
    icon: <IconImpact />,
  },
];

const milestones = [
  { label: "Live Streams", value: "11+" },
  { label: "Regions Covered", value: "190" },
  { label: "Update Cadence", value: "Sub-minute" },
  { label: "Climate Signals", value: "42" },
];

type PixelAvatarProps = {
  palette: string[];
  hair: string;
  shirt: string;
  accent: string;
  variant: "boy" | "girl";
};

function PixelAvatar({ palette, hair, shirt, accent, variant }: PixelAvatarProps) {
  const skin = palette[0];
  const shadow = palette[1];
  const highlight = palette[2];
  const eye = "#0f172a";
  const mouth = shadow;
  const collar = "#e5e7eb";
  const bowColor = "#fb7185";

  const boyRows = [
    ["transparent", "transparent", hair, hair, hair, hair, hair, hair, hair, "transparent", "transparent", "transparent"],
    ["transparent", hair, hair, hair, hair, hair, hair, hair, hair, hair, "transparent", "transparent"],
    [hair, hair, skin, skin, skin, skin, skin, skin, skin, hair, hair, "transparent"],
    [hair, skin, skin, eye, skin, skin, skin, eye, skin, skin, hair, "transparent"],
    [hair, skin, skin, skin, skin, skin, skin, skin, skin, skin, hair, "transparent"],
    [hair, skin, highlight, skin, skin, skin, skin, highlight, skin, skin, hair, "transparent"],
    [hair, skin, skin, mouth, skin, skin, mouth, skin, skin, skin, hair, "transparent"],
    [hair, skin, collar, shirt, shirt, shirt, shirt, shirt, collar, skin, hair, "transparent"],
    ["transparent", skin, shadow, shirt, shirt, shirt, shirt, shirt, shadow, skin, "transparent", "transparent"],
    ["transparent", shadow, shadow, shirt, shirt, shirt, shirt, shirt, shadow, shadow, "transparent", "transparent"],
    ["transparent", "transparent", shadow, shadow, shadow, shadow, shadow, shadow, shadow, "transparent", "transparent", "transparent"],
    ["transparent", "transparent", "transparent", shadow, "transparent", "transparent", shadow, "transparent", "transparent", "transparent", "transparent", "transparent"],
  ];

  const girlRows = [
    ["transparent", "transparent", hair, hair, hair, hair, hair, hair, hair, "transparent", "transparent", "transparent"],
    ["transparent", hair, hair, skin, skin, skin, skin, skin, skin, hair, hair, "transparent"],
    [hair, hair, skin, skin, eye, skin, skin, eye, skin, skin, hair, hair],
    [hair, skin, skin, skin, skin, skin, skin, skin, skin, skin, skin, hair],
    [hair, skin, highlight, skin, skin, bowColor, bowColor, skin, highlight, skin, skin, hair],
    [hair, skin, skin, mouth, skin, skin, mouth, skin, skin, skin, skin, hair],
    [hair, skin, hair, hair, skin, collar, shirt, shirt, collar, skin, hair, hair],
    [hair, hair, hair, shirt, shirt, shirt, shirt, shirt, shirt, hair, hair, hair],
    ["transparent", hair, hair, shirt, shirt, shirt, shirt, shirt, hair, hair, "transparent", "transparent"],
    ["transparent", "transparent", hair, hair, shadow, shadow, shadow, hair, hair, "transparent", "transparent", "transparent"],
    ["transparent", "transparent", "transparent", hair, hair, hair, hair, hair, "transparent", "transparent", "transparent", "transparent"],
    ["transparent", "transparent", "transparent", "transparent", hair, "transparent", hair, "transparent", "transparent", "transparent", "transparent", "transparent"],
  ];

  const rows = variant === "girl" ? girlRows : boyRows;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[200px] overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/70 p-3 shadow-2xl shadow-black/30">
      <div className="absolute inset-x-4 top-4 h-12 rounded-full blur-2xl" style={{ background: accent }} />
      <div className="relative grid h-full w-full grid-cols-12 grid-rows-12 gap-[1px] rounded-[20px] bg-slate-900/75 p-2">
        {rows.flatMap((row, rowIndex) =>
          row.map((color, columnIndex) =>
            <span
              key={`${rowIndex}-${columnIndex}`}
              className="block aspect-square rounded-[1px]"
              style={{ backgroundColor: color === "transparent" ? "transparent" : color }}
            />
          )
        )}
      </div>
    </div>
  );
}

const contributors = [
  {
    name: "Boy 01",
    role: "Frontend Development",
    note: "UI screens, layout polish, and responsive interaction work",
    accent: "linear-gradient(135deg, rgba(34,197,94,0.45), rgba(16,185,129,0.08))",
    avatar: {
      palette: ["#f2c9a0", "#a87147", "#ffd9ba"],
      hair: "#2f2b46",
      shirt: "#1f8f6b",
      accent: "linear-gradient(135deg, rgba(74,222,128,0.35), rgba(34,197,94,0.05))",
      variant: "boy" as const,
    },
    linkedin: "https://www.linkedin.com/in/",
  },
  {
    name: "Boy 02",
    role: "Frontend Development",
    note: "Component structure, cards, and interactive states",
    accent: "linear-gradient(135deg, rgba(59,130,246,0.35), rgba(16,185,129,0.05))",
    avatar: {
      palette: ["#ebc49b", "#9e6941", "#ffd4ab"],
      hair: "#28344f",
      shirt: "#2563eb",
      accent: "linear-gradient(135deg, rgba(59,130,246,0.40), rgba(14,165,233,0.05))",
      variant: "boy" as const,
    },
    linkedin: "https://www.linkedin.com/in/",
  },
  {
    name: "Boy 03",
    role: "Frontend Development",
    note: "Responsive polish, spacing, and visual consistency",
    accent: "linear-gradient(135deg, rgba(250,204,21,0.35), rgba(16,185,129,0.05))",
    avatar: {
      palette: ["#f1c8a5", "#996643", "#ffe0bf"],
      hair: "#5a341f",
      shirt: "#ca8a04",
      accent: "linear-gradient(135deg, rgba(250,204,21,0.35), rgba(249,115,22,0.05))",
      variant: "boy" as const,
    },
    linkedin: "https://www.linkedin.com/in/",
  },
  {
    name: "Girl 01",
    role: "Frontend Development",
    note: "Visual storytelling, spacing, and premium UI feel",
    accent: "linear-gradient(135deg, rgba(244,114,182,0.35), rgba(16,185,129,0.05))",
    avatar: {
      palette: ["#f0c7a5", "#a06a47", "#ffd7ba"],
      hair: "#6d28d9",
      shirt: "#ec4899",
      accent: "linear-gradient(135deg, rgba(244,114,182,0.42), rgba(236,72,153,0.05))",
      variant: "girl" as const,
    },
    linkedin: "https://www.linkedin.com/in/",
  },
];

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const nodes = sectionRef.current.querySelectorAll<HTMLElement>(".about-reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("about-reveal-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -40px 0px" }
    );

    nodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" ref={sectionRef} className="relative py-12 md:py-16">
      <div className="absolute inset-0 -z-10 rounded-[40px] bg-gradient-to-br from-emerald-900/35 via-slate-900/15 to-lime-900/20 blur-2xl" />

      <div className="about-reveal relative overflow-hidden rounded-[30px] border border-emerald-400/20 bg-slate-950/50 p-6 shadow-2xl shadow-black/35 backdrop-blur-xl md:p-8">
        <div className="absolute -left-16 top-0 h-48 w-48 rounded-full bg-emerald-400/18 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-56 w-56 rounded-full bg-lime-400/10 blur-3xl" />

        <div className="relative z-10 grid items-end gap-7 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">About NASA.io</p>
            <h2 className="mt-3 text-3xl font-semibold text-emerald-50 md:text-5xl" style={{ fontFamily: "Space Grotesk" }}>
              We design climate intelligence that feels alive
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 md:text-base">
              NASA.io blends scientific monitoring with cinematic interaction. The goal is simple: make Earth signals clear, urgent, and impossible to ignore.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-300/20 bg-slate-900/55 p-5">
            <p className="text-[11px] uppercase tracking-[0.22em] text-emerald-200/80">Core Philosophy</p>
            <p className="mt-2 text-sm text-slate-200">
              Beautiful interfaces are not decoration here. They are decision tools that help teams identify risk, act faster, and communicate impact.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3 md:gap-5">
        {cards.map((card, index) => (
          <article
            key={card.title}
            className={`about-reveal ${index % 2 === 0 ? "about-reveal-left" : "about-reveal-right"} about-card group relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-slate-950/45 p-5 shadow-xl shadow-black/30 backdrop-blur-md md:p-6`}
            style={{ transitionDelay: `${index * 120}ms` }}
          >
            <div className={`absolute -right-14 -top-14 h-40 w-40 rounded-full bg-gradient-to-br ${card.accent} blur-2xl`} />
            <div className="about-card-shine" />
            <div className="relative z-10 flex items-center justify-between gap-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-200/80">{card.stat}</p>
              <span className="about-icon-wrap text-emerald-200">{card.icon}</span>
            </div>
            <h3 className="mt-3 text-xl font-semibold text-emerald-50" style={{ fontFamily: "Space Grotesk" }}>
              {card.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{card.description}</p>
          </article>
        ))}
      </div>

      <div className="about-reveal mt-6 rounded-3xl border border-emerald-500/20 bg-slate-950/40 p-4 backdrop-blur-md md:p-5">
        <p className="text-[11px] uppercase tracking-[0.26em] text-emerald-200/75">Operational Snapshot</p>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          {milestones.map((item) => (
            <div key={item.label} className="about-metric-card rounded-xl border border-white/10 bg-slate-900/50 p-3">
              <p className="text-lg font-semibold text-emerald-100" style={{ fontFamily: "Space Grotesk" }}>
                {item.value}
              </p>
              <p className="text-xs text-slate-400">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="about-reveal mt-6 rounded-3xl border border-emerald-500/20 bg-slate-950/45 p-5 backdrop-blur-md md:p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.26em] text-emerald-200/75">Contribution Team</p>
            <h3 className="mt-2 text-2xl font-semibold text-emerald-50" style={{ fontFamily: "Space Grotesk" }}>
              Frontend development contributors
            </h3>
          </div>
          <p className="max-w-xl text-sm text-slate-400">
            Pixel-style avatars keep the section playful while the roles stay clear and professional.
          </p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {contributors.map((contributor, index) => (
            <article
              key={contributor.name}
              className="group overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/45 p-4 shadow-xl shadow-black/25 transition-transform duration-300 hover:-translate-y-1"
              style={{ transitionDelay: `${index * 90}ms` }}
            >
              <div className="flex items-center justify-center rounded-[24px] border border-white/10 bg-slate-950/75 p-3">
                <PixelAvatar {...contributor.avatar} />
              </div>

              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-lg font-semibold text-emerald-50" style={{ fontFamily: "Space Grotesk" }}>
                    {contributor.name}
                  </h4>
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/75">{contributor.role}</p>
                </div>
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.85)]" />
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                {contributor.note}
              </p>

              <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              <div className="mt-3 rounded-2xl border border-white/8 bg-white/5 px-3 py-2 text-xs text-emerald-200/80" style={{ backgroundImage: contributor.accent }}>
                Frontend work focused on layout clarity, user flow, and interactive polish.
              </div>

              <a
                href={contributor.linkedin}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1.5 text-xs font-medium text-emerald-200 transition hover:border-emerald-400/50 hover:bg-emerald-900/50"
              >
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#0A66C2] text-[10px] font-bold text-white">in</span>
                LinkedIn
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
