import { useEffect, useRef } from "react";
import boyProfileImage from "../../boy.png";
import happyProfileImage from "../../happy.png";
import girlProfileImage from "../../laugh.png";
import studentProfileImage from "../../student.png";

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

const profiles = [
  { name: "AKP", role: "Full Stack Developer", focus: "Handled and managed the full stack implementation and overall product delivery. ", badge: "Full Stack", accent: "#b9d6d2", variant: "boy" as const, avatarSrc: boyProfileImage },
  { name: "Prashant", role: "Backend & Deployment", focus: "Built the backend logic and managed deployment with a stable workflow.", badge: "Backend", accent: "#c9d6d2", variant: "boy" as const, avatarSrc: happyProfileImage },
  { name: "Vedansh", role: "UI & Interface", focus: "Designed the interface polish, UI consistency, and user experience flow.", badge: "UI", accent: "#aab6b8", variant: "boy" as const, avatarSrc: studentProfileImage },
  { name: "Anshika", role: "Data, Information & Research", focus: "Managed data collection, research insights, and content quality.", badge: "Research", accent: "#9aa7ad", variant: "girl" as const, avatarSrc: girlProfileImage },
];

const IconLinkedIn = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4 shrink-0">
    <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM0 8h5v15H0V8zm8.5 0H13v2.05h.07C13.7 8.9 15.22 7.5 17.5 7.5c5.29 0 6.27 3.48 6.27 8.01V23h-5v-6.63c0-1.58-.03-3.61-2.2-3.61-2.2 0-2.54 1.72-2.54 3.5V23h-5V8z" />
  </svg>
);

const IconGitHub = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4 shrink-0">
    <path d="M12 .5C5.65.5.5 5.66.5 12.05c0 5.1 3.29 9.43 7.86 10.96.58.11.79-.25.79-.56v-2.03c-3.2.71-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.73.08-.71.08-.71 1.16.08 1.77 1.2 1.77 1.2 1.03 1.79 2.7 1.27 3.36.97.11-.76.4-1.27.73-1.56-2.56-.3-5.24-1.3-5.24-5.79 0-1.28.45-2.32 1.2-3.14-.12-.29-.52-1.49.11-3.1 0 0 .98-.32 3.21 1.2a11.2 11.2 0 0 1 5.83 0c2.23-1.52 3.21-1.2 3.21-1.2.63 1.61.23 2.81.11 3.1.75.82 1.2 1.86 1.2 3.14 0 4.5-2.69 5.48-5.25 5.78.41.36.78 1.08.78 2.18v3.23c0 .31.21.67.8.56A10.95 10.95 0 0 0 23.5 12.05C23.5 5.66 18.35.5 12 .5z" />
  </svg>
);

function ProfileCard({ name, role, focus, badge, accent, avatarSrc }: { name: string; role: string; focus: string; badge: string; accent: string; avatarSrc?: string }) {
  return (
    <div className="about-profile-card card mx-auto">
      <div className="card__img">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 540 450" preserveAspectRatio="none" aria-hidden="true">
          <rect fill="#f5f7f8" width="540" height="450" />
          <defs>
            <linearGradient id="about-card-gradient" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="0" y2="100%" gradientTransform="rotate(222,648,379)">
              <stop offset="0" stopColor="#f5f7f8" />
              <stop offset="1" stopColor={accent} />
            </linearGradient>
            <pattern patternUnits="userSpaceOnUse" id="about-card-pattern" width="300" height="250" x="0" y="0" viewBox="0 0 1080 900">
              <g fillOpacity="0.35">
                <polygon fill="#9aa7ad" points="90 150 0 300 180 300" />
                <polygon points="90 150 180 0 0 0" />
                <polygon fill="#c9d6d2" points="270 150 360 0 180 0" />
                <polygon fill="#e8ecec" points="450 150 360 300 540 300" />
                <polygon fill="#7f8f93" points="450 150 540 0 360 0" />
                <polygon points="630 150 540 300 720 300" />
                <polygon fill="#e8ecec" points="630 150 720 0 540 0" />
                <polygon fill="#9aa7ad" points="810 150 720 300 900 300" />
                <polygon fill="#ffffff" points="810 150 900 0 720 0" />
                <polygon fill="#e8ecec" points="990 150 900 300 1080 300" />
                <polygon fill="#9aa7ad" points="990 150 1080 0 900 0" />
                <polygon fill="#e8ecec" points="90 450 0 600 180 600" />
                <polygon points="90 450 180 300 0 300" />
                <polygon fill="#7f8f93" points="270 450 180 600 360 600" />
                <polygon fill="#c9d6d2" points="270 450 360 300 180 300" />
                <polygon fill="#e8ecec" points="450 450 360 600 540 600" />
                <polygon fill="#aab6b8" points="450 450 540 300 360 300" />
                <polygon fill="#aab6b8" points="630 450 540 600 720 600" />
                <polygon fill="#ffffff" points="630 450 720 300 540 300" />
                <polygon points="810 450 720 600 900 600" />
                <polygon fill="#e8ecec" points="810 450 900 300 720 300" />
                <polygon fill="#c9d6d2" points="990 450 900 600 1080 600" />
                <polygon fill="#9aa7ad" points="990 450 1080 300 900 300" />
                <polygon fill="#dbe4e2" points="90 750 0 900 180 900" />
                <polygon points="270 750 180 900 360 900" />
                <polygon fill="#e8ecec" points="270 750 360 600 180 600" />
                <polygon points="450 750 540 600 360 600" />
                <polygon points="630 750 540 900 720 900" />
                <polygon fill="#9aa7ad" points="630 750 720 600 540 600" />
                <polygon fill="#c9d6d2" points="810 750 720 900 900 900" />
                <polygon fill="#7f8f93" points="810 750 900 600 720 600" />
                <polygon fill="#aab6b8" points="990 750 900 900 1080 900" />
                <polygon fill="#aab6b8" points="180 0 90 150 270 150" />
                <polygon fill="#9aa7ad" points="360 0 270 150 450 150" />
                <polygon fill="#ffffff" points="540 0 450 150 630 150" />
                <polygon points="900 0 810 150 990 150" />
                <polygon fill="#7f8f93" points="0 300 -90 450 90 450" />
                <polygon fill="#ffffff" points="0 300 90 150 -90 150" />
                <polygon fill="#ffffff" points="180 300 90 450 270 450" />
                <polygon fill="#7f8f93" points="180 300 270 150 90 150" />
                <polygon fill="#9aa7ad" points="360 300 270 450 450 450" />
                <polygon fill="#ffffff" points="360 300 450 150 270 150" />
                <polygon fill="#c9d6d2" points="540 300 450 450 630 450" />
                <polygon fill="#7f8f93" points="540 300 630 150 450 150" />
                <polygon fill="#aab6b8" points="720 300 630 450 810 450" />
                <polygon fill="#7f8f93" points="720 300 810 150 630 150" />
                <polygon fill="#ffffff" points="900 300 810 450 990 450" />
                <polygon fill="#aab6b8" points="900 300 990 150 810 150" />
                <polygon points="0 600 -90 750 90 750" />
                <polygon fill="#7f8f93" points="0 600 90 450 -90 450" />
                <polygon fill="#c9d6d2" points="180 600 90 750 270 750" />
                <polygon fill="#9aa7ad" points="180 600 270 450 90 450" />
                <polygon fill="#9aa7ad" points="360 600 270 750 450 750" />
                <polygon fill="#aab6b8" points="360 600 450 450 270 450" />
                <polygon fill="#7f8f93" points="540 600 630 450 450 450" />
                <polygon fill="#7f8f93" points="720 600 630 750 810 750" />
                <polygon fill="#ffffff" points="900 600 810 750 990 750" />
                <polygon fill="#9aa7ad" points="900 600 990 450 810 450" />
                <polygon fill="#e8ecec" points="0 900 90 750 -90 750" />
                <polygon fill="#9aa7ad" points="180 900 270 750 90 750" />
                <polygon fill="#ffffff" points="360 900 450 750 270 750" />
                <polygon fill="#c9d6d2" points="540 900 630 750 450 750" />
                <polygon fill="#ffffff" points="720 900 810 750 630 750" />
                <polygon fill="#7f8f93" points="900 900 990 750 810 750" />
                <polygon fill="#7f8f93" points="1080 300 990 450 1170 450" />
                <polygon fill="#ffffff" points="1080 300 1170 150 990 150" />
                <polygon points="1080 600 990 750 1170 750" />
                <polygon fill="#9aa7ad" points="1080 600 1170 450 990 450" />
                <polygon fill="#e8ecec" points="1080 900 1170 750 990 750" />
              </g>
            </pattern>
          </defs>
          <rect x="0" y="0" fill="url(#about-card-gradient)" width="100%" height="100%" />
          <rect x="0" y="0" fill="url(#about-card-pattern)" width="100%" height="100%" />
        </svg>
      </div>

      <div className="card__avatar">
        <img src={avatarSrc} alt="Profile portrait" className="h-full w-full object-contain" />
      </div>

      <div className="card__body">
        <div className="card__title">{name}</div>
        <div className="card__subtitle">{role}</div>

        <p className="mx-6 mt-3 text-center text-sm leading-relaxed text-slate-600">{focus}</p>

        <div className="mt-3 mx-auto w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700">{badge}</div>
      </div>

      <div className="card__wrapper">
        <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" aria-label={`Open ${name}'s LinkedIn profile`} className="card__btn card__btn-solid inline-flex items-center justify-center gap-2">
          <span className="h-4 w-4"><IconLinkedIn /></span>
          LinkedIn
        </a>
        <a href="https://github.com" target="_blank" rel="noreferrer" aria-label={`Open ${name}'s GitHub profile`} className="card__btn inline-flex items-center justify-center gap-2">
          <span className="h-4 w-4"><IconGitHub /></span>
          GitHub
        </a>
      </div>
    </div>
  );
}

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
          <article key={card.title} className={`about-reveal ${index % 2 === 0 ? "about-reveal-left" : "about-reveal-right"} about-card group relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-slate-950/45 p-5 shadow-xl shadow-black/30 backdrop-blur-md md:p-6`} style={{ transitionDelay: `${index * 120}ms` }}>
            <div className={`absolute -right-14 -top-14 h-40 w-40 rounded-full bg-gradient-to-br ${card.accent} blur-2xl`} />
            <div className="about-card-shine" />
            <div className="relative z-10 flex items-center justify-between gap-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-200/80">{card.stat}</p>
              <span className="about-icon-wrap text-emerald-200">{card.icon}</span>
            </div>
            <h3 className="mt-3 text-xl font-semibold text-emerald-50" style={{ fontFamily: "Space Grotesk" }}>{card.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{card.description}</p>
          </article>
        ))}
      </div>

      <div className="about-reveal mt-6 rounded-3xl border border-emerald-500/20 bg-slate-950/40 p-4 backdrop-blur-md md:p-5">
        <p className="text-[11px] uppercase tracking-[0.26em] text-emerald-200/75">Operational Snapshot</p>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          {milestones.map((item) => (
            <div key={item.label} className="about-metric-card rounded-xl border border-white/10 bg-slate-900/50 p-3">
              <p className="text-lg font-semibold text-emerald-100" style={{ fontFamily: "Space Grotesk" }}>{item.value}</p>
              <p className="text-xs text-slate-400">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="about-reveal mt-6">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.26em] text-emerald-200/75">Coder Intro</p>
            <h3 className="mt-2 text-2xl font-semibold text-emerald-50" style={{ fontFamily: "Space Grotesk" }}>
              Engineering team spotlight
            </h3>
          </div>
          <p className="max-w-xl text-sm text-slate-400">

          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {profiles.map((profile, index) => (
            <div key={profile.name} style={{ transitionDelay: `${index * 80}ms` }}>
              <ProfileCard {...profile} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}