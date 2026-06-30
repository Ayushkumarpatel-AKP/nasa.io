// src/components/HeroIntro.tsx
import EarthGlobe from "./EarthGlobe";
import ARVisionButton from "./ARVisionButton";
import AnimatedText from "./AnimatedText";

export default function HeroIntro() {
  return (
    <section className="pt-6 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* LEFT - 3D Earth Globe */}
        <div className="order-2 lg:order-1">
          <EarthGlobe />
        </div>

        {/* RIGHT - Hero Text */}
        <div className="order-1 lg:order-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </span>
            Live Data from NASA Satellites
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
            <AnimatedText />
            <br />
            <span className="text-white">Understand Our Planet.</span>
          </h1>

          {/* AR Vision Button - Right below heading */}
          <div className="mb-8">
            <ARVisionButton link="https://ar-wheatherforcasting.netlify.app/" />
          </div>
          
          <p className="text-lg text-white/70 leading-relaxed mb-8">
            A next-generation environmental intelligence dashboard powered by real-time Earth observation, 
            satellite imagery, and AI-driven climate analytics.
          </p>
          
          <div className="flex flex-wrap items-center gap-6 text-sm text-white/50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Real-time Monitoring</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              <span>AI Analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>AR Visualization</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
