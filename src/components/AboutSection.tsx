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
    </section>
  );
}
