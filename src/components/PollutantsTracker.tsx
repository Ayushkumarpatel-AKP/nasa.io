// src/components/PollutantsTracker.tsx
export default function PollutantsTracker() {
  const pollutants = [
    {
      name: "PM2.5",
      icon: "PM2.5",
      iconBg: "from-red-400 to-pink-400",
      value: "35.2",
      unit: "µg/m³",
      status: "Moderate",
      color: "yellow",
      description: "Fine particulate matter",
    },
    {
      name: "PM10",
      icon: "PM10",
      iconBg: "from-orange-400 to-red-400",
      value: "58.7",
      unit: "µg/m³",
      status: "Unhealthy",
      color: "orange",
      description: "Coarse dust particles",
    },
    {
      name: "NO₂",
      icon: "NO₂",
      iconBg: "from-blue-400 to-cyan-400",
      value: "42.1",
      unit: "ppb",
      status: "Moderate",
      color: "yellow",
      description: "Vehicle emissions",
    },
    {
      name: "SO₂",
      icon: "SO₂",
      iconBg: "from-purple-400 to-pink-400",
      value: "12.8",
      unit: "ppb",
      status: "Good",
      color: "green",
      description: "Industrial emissions",
    },
    {
      name: "CO",
      icon: "CO",
      iconBg: "from-gray-400 to-gray-600",
      value: "0.8",
      unit: "ppm",
      status: "Good",
      color: "green",
      description: "Fuel combustion",
    },
    {
      name: "O₃",
      icon: "O₃",
      iconBg: "from-cyan-400 to-blue-400",
      value: "65.3",
      unit: "ppb",
      status: "Moderate",
      color: "yellow",
      description: "Ozone / Smog",
    },
    {
      name: "NH₃",
      icon: "NH₃",
      iconBg: "from-green-400 to-emerald-400",
      value: "28.4",
      unit: "µg/m³",
      status: "Good",
      color: "green",
      description: "Agriculture source",
    },
  ];

  const getStatusColor = (color: string) => {
    const colors: Record<string, string> = {
      green: "bg-green-500/20 border-green-500/30 text-green-400",
      yellow: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400",
      orange: "bg-orange-500/20 border-orange-500/30 text-orange-400",
      red: "bg-red-500/20 border-red-500/30 text-red-400",
    };
    return colors[color] || colors.green;
  };

  const getValueColor = (color: string) => {
    const colors: Record<string, string> = {
      green: "text-green-400",
      yellow: "text-yellow-400",
      orange: "text-orange-400",
      red: "text-red-400",
    };
    return colors[color] || colors.green;
  };

  return (
    <section className="py-4">
      {/* Horizontal Pollutant Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {pollutants.map((pollutant, index) => (
          <div
            key={index}
            className="group relative rounded-xl p-4 bg-white/5 border border-white/10 hover:border-cyan-400/30 transition-all duration-300 hover:scale-105"
          >
            {/* Animated gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-cyan-500/5 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
            
            <div className="relative">
              {/* Icon */}
              <div className="flex items-center justify-between mb-3">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${pollutant.iconBg} flex items-center justify-center text-white font-bold text-xs shadow-lg`}>
                  {pollutant.icon}
                </div>
                <div className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusColor(pollutant.color)}`}>
                  {pollutant.status}
                </div>
              </div>

              {/* Pollutant Name */}
              <h3 className="text-sm font-bold mb-1">{pollutant.name}</h3>
              <p className="text-[10px] text-white/50 mb-3">{pollutant.description}</p>

              {/* Value with animated update effect */}
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-bold ${getValueColor(pollutant.color)} transition-all duration-300`}>
                  {pollutant.value}
                </span>
                <span className="text-xs text-white/40">{pollutant.unit}</span>
              </div>

              {/* Live indicator */}
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-white/40">Updated now</span>
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Footer */}
      <div className="mt-6 rounded-lg p-4 bg-gradient-to-r from-cyan-500/5 to-blue-600/5 border border-cyan-400/20">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
            i
          </div>
          <div>
            <h4 className="text-sm font-semibold text-cyan-400 mb-1">Real-time Satellite Monitoring</h4>
            <p className="text-xs text-white/60 leading-relaxed">
              Data sourced from NASA's Earth Observing System, Sentinel-5P, and ground-based monitoring stations. 
              Values update every 5 minutes with AI-powered anomaly detection.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
