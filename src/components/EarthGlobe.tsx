// src/components/EarthGlobe.tsx

function Star({ style }: { style: React.CSSProperties }) {
  return (
    <div style={style}>
      <div className="curved-corner-star">
        <div className="star-corner star-br" />
        <div className="star-corner star-bl" />
      </div>
      <div className="curved-corner-star">
        <div className="star-corner star-tr" />
        <div className="star-corner star-tl" />
      </div>
    </div>
  );
}

export default function EarthGlobe() {
  const stars: React.CSSProperties[] = [
    { position: 'absolute', left:  20, top:  30, animation: 'twinkling 3s   infinite' },
    { position: 'absolute', left:  55, top:  80, animation: 'twinkling 2s   infinite' },
    { position: 'absolute', right: 30, top: 110, animation: 'twinkling 4s   infinite' },
    { position: 'absolute', left: 140, top: 330, animation: 'twinkling 3s   infinite' },
    { position: 'absolute', left:  40, top: 310, animation: 'twinkling 1.5s infinite' },
    { position: 'absolute', right: 50, top:  20, animation: 'twinkling 4s   infinite' },
    { position: 'absolute', right: 15, top:  70, animation: 'twinkling 2s   infinite' },
    { position: 'absolute', left:  80, top: 220, animation: 'twinkling 2.5s infinite' },
    { position: 'absolute', right: 70, top: 260, animation: 'twinkling 3.5s infinite' },
    { position: 'absolute', left: 200, top:  50, animation: 'twinkling 1.8s infinite' },
  ];

  return (
    <div
      className="relative rounded-2xl border border-emerald-900/40 overflow-hidden"
      style={{
        height: 480,
        background: 'radial-gradient(ellipse at 30% 30%, #0d2a40 0%, #030d15 60%, #000 100%)',
      }}
    >
      {/* Deep space subtle star field */}
      <div className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.35) 0%, transparent 100%),' +
            'radial-gradient(1px 1px at 72% 38%, rgba(255,255,255,0.25) 0%, transparent 100%),' +
            'radial-gradient(1px 1px at 48% 72%, rgba(255,255,255,0.2)  0%, transparent 100%),' +
            'radial-gradient(1px 1px at 85% 88%, rgba(255,255,255,0.3)  0%, transparent 100%),' +
            'radial-gradient(1px 1px at 22% 55%, rgba(255,255,255,0.2)  0%, transparent 100%),' +
            'radial-gradient(1px 1px at 60% 10%, rgba(255,255,255,0.25) 0%, transparent 100%),' +
            'radial-gradient(1px 1px at 33% 90%, rgba(255,255,255,0.15) 0%, transparent 100%)',
        }}
      />

      {/* Twinkling star shapes */}
      {stars.map((s, i) => <Star key={i} style={s} />)}

      {/* Outer glow halo behind earth */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(50,170,255,0.08) 0%, transparent 70%)' }}
      />

      {/* Spinning Earth */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="earth-globe" />
      </div>

      {/* Atmosphere ring */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{
          width: 296, height: 296,
          boxShadow: '0 0 40px 12px rgba(80, 200, 255, 0.10)',
          border: '1px solid rgba(100, 200, 255, 0.08)',
        }}
      />

      {/* Floating data chips */}
      <div className="absolute top-6 right-6 bg-black/40 backdrop-blur-md border border-emerald-800/50 rounded-xl px-3 py-2">
        <p className="text-[10px] text-slate-500">Active Monitors</p>
        <p className="text-base font-bold text-cyan-400" style={{ fontFamily: 'Space Grotesk' }}>12,456</p>
      </div>
      <div className="absolute bottom-6 left-6 bg-black/40 backdrop-blur-md border border-emerald-800/50 rounded-xl px-3 py-2">
        <p className="text-[10px] text-slate-500">Data Points</p>
        <p className="text-base font-bold text-emerald-400" style={{ fontFamily: 'Space Grotesk' }}>2.4M</p>
      </div>
      <div className="absolute bottom-6 right-6 bg-black/40 backdrop-blur-md border border-emerald-800/50 rounded-xl px-3 py-2">
        <p className="text-[10px] text-slate-500">Satellites</p>
        <p className="text-base font-bold text-purple-400" style={{ fontFamily: 'Space Grotesk' }}>847</p>
      </div>
    </div>
  );
}
