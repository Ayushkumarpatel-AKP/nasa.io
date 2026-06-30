// src/components/MapPreview.tsx
export default function MapPreview() {
  return (
    <div className="rounded-xl p-6 bg-white/5 border border-white/10 hover:border-cyan-400/30 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">
            Global Emissions Map
          </h3>
          <p className="text-xs text-white/50">
            Updated 5 mins ago
          </p>
        </div>
        <div className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold">
          High Alert
        </div>
      </div>
      
      <p className="text-sm text-white/60 mb-4">
        Explore worldwide air-quality data and emission hotspots in real-time.
      </p>
      
      <div className="relative mt-4 h-40 rounded-lg bg-gradient-to-br from-red-500/10 via-orange-500/10 to-yellow-500/10 border border-white/5 overflow-hidden group">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <span className="text-4xl mb-2 block">🗺️</span>
            <span className="text-white/30 text-xs">Interactive Map (Leaflet/Mapbox)</span>
          </div>
        </div>
        
        {/* Hotspot indicators */}
        <div className="absolute top-4 left-4 w-3 h-3 bg-red-500 rounded-full animate-ping" />
        <div className="absolute top-4 left-4 w-3 h-3 bg-red-500 rounded-full" />
        
        <div className="absolute bottom-6 right-6 w-2 h-2 bg-orange-500 rounded-full animate-ping" />
        <div className="absolute bottom-6 right-6 w-2 h-2 bg-orange-500 rounded-full" />
      </div>
      
      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="text-white/40">Legend:</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-white/50">Good</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-400 rounded-full" />
            <span className="text-white/50">Moderate</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-400 rounded-full" />
            <span className="text-white/50">Poor</span>
          </div>
        </div>
      </div>
    </div>
  );
}
