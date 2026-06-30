// src/pages/Home.tsx
import HeroIntro from "../components/HeroIntro";
import StatsCard from "../components/StatsCard";
import FeatureCard from "../components/FeatureCard";

// ── Custom SVG Icons ────────────────────────────────

const IconSatellite = () => (
  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    {/* body */}
    <rect x="18" y="18" width="12" height="12" rx="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor"/>
    <circle cx="24" cy="24" r="2.5" fill="currentColor"/>
    {/* solar panels */}
    <rect x="2" y="19" width="12" height="10" rx="1.5" fill="currentColor" fillOpacity="0.3"/>
    <rect x="34" y="19" width="12" height="10" rx="1.5" fill="currentColor" fillOpacity="0.3"/>
    <line x1="14" y1="24" x2="18" y2="24"/>
    <line x1="30" y1="24" x2="34" y2="24"/>
    {/* antenna */}
    <line x1="24" y1="18" x2="24" y2="8"/>
    <circle cx="24" cy="6" r="2" fill="currentColor" fillOpacity="0.5"/>
    {/* orbit arc */}
    <path d="M8 40 Q24 12 40 40" strokeDasharray="3 3" opacity="0.5"/>
  </svg>
);

const IconAnalytics = () => (
  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    {/* axes */}
    <line x1="8" y1="40" x2="8" y2="8"/>
    <line x1="8" y1="40" x2="42" y2="40"/>
    {/* bars */}
    <rect x="12" y="26" width="6" height="14" rx="1" fill="currentColor" fillOpacity="0.25"/>
    <rect x="21" y="18" width="6" height="22" rx="1" fill="currentColor" fillOpacity="0.4"/>
    <rect x="30" y="10" width="6" height="30" rx="1" fill="currentColor" fillOpacity="0.6"/>
    {/* trend line */}
    <polyline points="15,28 24,20 33,12" strokeWidth="1.5" opacity="0.7"/>
    <circle cx="33" cy="12" r="2" fill="currentColor"/>
    {/* arrow tip */}
    <polyline points="30,9 33,12 36,9" strokeWidth="1.5"/>
  </svg>
);

const IconGlobe = () => (
  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <circle cx="24" cy="24" r="18"/>
    {/* latitude lines */}
    <ellipse cx="24" cy="24" rx="10" ry="18"/>
    <line x1="6" y1="24" x2="42" y2="24"/>
    <path d="M9 14 Q24 20 39 14" strokeDasharray="2 2"/>
    <path d="M9 34 Q24 28 39 34" strokeDasharray="2 2"/>
    {/* location dot */}
    <circle cx="30" cy="18" r="2.5" fill="currentColor" fillOpacity="0.7"/>
    <line x1="30" y1="20" x2="30" y2="25" strokeWidth="1.5"/>
  </svg>
);

const IconRealtime = () => (
  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    {/* pulse wave left */}
    <polyline points="4,24 10,24 13,12 16,36 19,24 24,24"/>
    {/* lightning bolt */}
    <polyline points="28,8 20,26 26,26 18,42" strokeWidth="2.5" fill="currentColor" fillOpacity="0.2"/>
    {/* signal rings */}
    <path d="M34 18 Q42 24 34 30" strokeDasharray="3 2"/>
    <path d="M37 14 Q48 24 37 34" strokeDasharray="3 2" opacity="0.5"/>
  </svg>
);

const IconCrossplatform = () => (
  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    {/* desktop */}
    <rect x="4" y="8" width="26" height="18" rx="2" fill="currentColor" fillOpacity="0.1"/>
    <line x1="4" y1="22" x2="30" y2="22"/>
    <line x1="17" y1="26" x2="17" y2="30"/>
    <line x1="12" y1="30" x2="22" y2="30"/>
    {/* mobile */}
    <rect x="32" y="14" width="12" height="20" rx="2" fill="currentColor" fillOpacity="0.1"/>
    <line x1="32" y1="30" x2="44" y2="30"/>
    <circle cx="38" cy="32.5" r="1" fill="currentColor"/>
    {/* tablet  */}
    <rect x="10" y="32" width="20" height="12" rx="2" fill="currentColor" fillOpacity="0.1"/>
    <line x1="10" y1="40" x2="30" y2="40"/>
    <circle cx="20" cy="41.5" r="1" fill="currentColor"/>
  </svg>
);

const IconSecure = () => (
  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    {/* shield */}
    <path d="M24 4 L40 10 L40 26 Q40 38 24 44 Q8 38 8 26 L8 10 Z" fill="currentColor" fillOpacity="0.1"/>
    {/* lock body */}
    <rect x="17" y="22" width="14" height="11" rx="2" fill="currentColor" fillOpacity="0.3"/>
    {/* lock shackle */}
    <path d="M19 22 L19 17 Q19 12 24 12 Q29 12 29 17 L29 22"/>
    {/* keyhole */}
    <circle cx="24" cy="27" r="2" fill="currentColor" fillOpacity="0.7"/>
    <line x1="24" y1="29" x2="24" y2="31"/>
    {/* checkmark accent */}
    <polyline points="16,36 20,40 32,28" strokeWidth="2" opacity="0.6"/>
  </svg>
);

const IconEarth = () => (
  <svg viewBox="0 0 32 32" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <circle cx="16" cy="16" r="12"/>
    <ellipse cx="16" cy="16" rx="6" ry="12"/>
    <line x1="4" y1="16" x2="28" y2="16"/>
    <path d="M6 10 Q16 14 26 10" strokeDasharray="1.5 1.5"/>
    <path d="M6 22 Q16 18 26 22" strokeDasharray="1.5 1.5"/>
  </svg>
);

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-6 space-y-16">
      {/* HERO SECTION */}
      <HeroIntro />

      {/* STATS OVERVIEW */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          icon="🌡️"
          title="Avg Temperature"
          value="+1.2°C"
          subtitle="Above 1950-1980 baseline"
          trend="↑ 0.3%"
        />
        <StatsCard
          icon="💨"
          title="CO₂ Levels"
          value="421 ppm"
          subtitle="Parts per million"
          trend="↑ 2.1%"
        />
        <StatsCard
          icon="🌊"
          title="Sea Level"
          value="+101 mm"
          subtitle="Since 1993"
          trend="↑ 3.4 mm/yr"
        />
        <StatsCard
          icon="🌲"
          title="Forest Loss"
          value="10M ha"
          subtitle="Annually"
        />
      </section>

      {/* FEATURES SECTION */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Advanced Earth Intelligence</h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Powered by real-time satellite data and AI-driven analytics
          </p>
        </div>

        {/* Pyramid Tree Structure */}
        <div className="relative max-w-5xl mx-auto">
          {/* Root node at top */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-2xl shadow-primary-500/50 border-4 border-primary-400/30 animate-pulse">
              <div className="w-8 h-8">
                <IconEarth />
              </div>
            </div>
          </div>

          {/* Pyramid layers - Compact */}
          <div className="relative space-y-4">
            {/* Level 1 - 1 card (Top of pyramid) */}
            <div className="flex justify-center">
              <FeatureCard
                icon={<IconSatellite />}
                title="Satellite Imaging"
                description="Access real-time imagery from NASA's Earth observation satellites including MODIS, Landsat, and Sentinel."
              />
            </div>

            {/* Level 2 - 2 cards (Middle) */}
            <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
              <FeatureCard
                icon={<IconAnalytics />}
                title="Data Analytics"
                description="AI-powered analytics to track pollution patterns, deforestation, and climate change indicators."
              />
              <FeatureCard
                icon={<IconGlobe />}
                title="Global Coverage"
                description="Monitor environmental changes across every continent with comprehensive global data coverage."
              />
            </div>

            {/* Level 3 - 3 cards (Base of pyramid) */}
            <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
              <FeatureCard
                icon={<IconRealtime />}
                title="Real-time Updates"
                description="Get instant notifications about critical environmental events and air quality changes."
              />
              <FeatureCard
                icon={<IconCrossplatform />}
                title="Cross-platform"
                description="Access your environmental dashboard from any device - desktop, mobile, or AR headset."
              />
              <FeatureCard
                icon={<IconSecure />}
                title="Secure & Private"
                description="Enterprise-grade security ensures your research data and insights remain protected."
              />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
