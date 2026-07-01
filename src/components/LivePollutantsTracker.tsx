// src/components/LivePollutantsTracker.tsx
import { useEffect, useState } from "react";

interface PollutantData {
  name: string;
  icon: string;
  iconBg: string;
  value: string;
  unit: string;
  status: string;
  color: string;
  description: string;
  trend?: "up" | "down" | "stable";
}

interface WeatherData {
  temp: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
}

interface Props {
  selectedLocation?: { lat: number; lon: number; name?: string } | null;
}

export default function LivePollutantsTracker({ selectedLocation }: Props) {
  const [locationName, setLocationName] = useState<string>("Your current location");
  const [overallAQI, setOverallAQI] = useState<number>(0);
  const [aqiStatus, setAqiStatus] = useState<string>("Loading...");
  const [aqiColor, setAqiColor] = useState<string>("gray");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [pollutants, setPollutants] = useState<PollutantData[]>([
    {
      name: "PM2.5",
      icon: "PM2.5",
      iconBg: "from-red-400 to-pink-400",
      value: "...",
      unit: "µg/m³",
      status: "Loading",
      color: "gray",
      description: "Fine particulate matter",
      trend: "stable",
    },
    {
      name: "PM10",
      icon: "PM10",
      iconBg: "from-orange-400 to-red-400",
      value: "...",
      unit: "µg/m³",
      status: "Loading",
      color: "gray",
      description: "Coarse dust particles",
      trend: "stable",
    },
    {
      name: "NO₂",
      icon: "NO₂",
      iconBg: "from-blue-400 to-cyan-400",
      value: "...",
      unit: "ppb",
      status: "Loading",
      color: "gray",
      description: "Vehicle emissions",
      trend: "stable",
    },
    {
      name: "SO₂",
      icon: "SO₂",
      iconBg: "from-purple-400 to-pink-400",
      value: "...",
      unit: "ppb",
      status: "Loading",
      color: "gray",
      description: "Industrial emissions",
      trend: "stable",
    },
    {
      name: "CO",
      icon: "CO",
      iconBg: "from-gray-400 to-gray-600",
      value: "...",
      unit: "ppm",
      status: "Loading",
      color: "gray",
      description: "Fuel combustion",
      trend: "stable",
    },
    {
      name: "O₃",
      icon: "O₃",
      iconBg: "from-cyan-400 to-blue-400",
      value: "...",
      unit: "ppb",
      status: "Loading",
      color: "gray",
      description: "Ozone / Smog",
      trend: "stable",
    },
    {
      name: "NH₃",
      icon: "NH₃",
      iconBg: "from-green-400 to-emerald-400",
      value: "...",
      unit: "µg/m³",
      status: "Loading",
      color: "gray",
      description: "Agriculture source",
      trend: "stable",
    },
  ]);

  const getAQIStatus = (aqi: number) => {
    if (aqi <= 50) return { status: "Good", color: "green" };
    if (aqi <= 100) return { status: "Moderate", color: "yellow" };
    if (aqi <= 150) return { status: "Unhealthy for Sensitive", color: "orange" };
    if (aqi <= 200) return { status: "Unhealthy", color: "red" };
    if (aqi <= 300) return { status: "Very Unhealthy", color: "purple" };
    return { status: "Hazardous", color: "maroon" };
  };

  const getHealthRecommendation = (aqi: number) => {
    if (aqi <= 50) return "Air quality is good. Ideal for outdoor activities! 🌟";
    if (aqi <= 100) return "Air quality is acceptable. Sensitive individuals should limit prolonged outdoor activity.";
    if (aqi <= 150) return "Sensitive groups should reduce outdoor activities. Consider wearing a mask. 😷";
    if (aqi <= 200) return "Everyone should limit prolonged outdoor exertion. Wear a mask outdoors. ⚠️";
    if (aqi <= 300) return "Health alert! Avoid outdoor activities. Stay indoors with air purification. 🚨";
    return "Health emergency! Everyone should avoid all outdoor activities. Stay indoors! 🆘";
  };

  /* ── US AQI from PM2.5 (EPA) ─────────────────────────── */
  const pm25toAQI = (pm: number): number => {
    const bp = [
      [0,     12.0,   0,   50 ],
      [12.1,  35.4,  51,  100 ],
      [35.5,  55.4, 101,  150 ],
      [55.5, 150.4, 151,  200 ],
      [150.5,250.4, 201,  300 ],
      [250.5,350.4, 301,  400 ],
      [350.5,500.4, 401,  500 ],
    ];
    for (const [cLo, cHi, iLo, iHi] of bp)
      if (pm >= cLo && pm <= cHi)
        return Math.round(((iHi - iLo) / (cHi - cLo)) * (pm - cLo) + iLo);
    return Math.min(Math.round(pm * 2), 500);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!selectedLocation) {
          setLocationName("Select a location to load local air data");
          return;
        }

        const openWeatherKey = import.meta.env.VITE_OPENWEATHER_KEY;
        const lat = selectedLocation.lat;
        const lon = selectedLocation.lon;

        if (selectedLocation.name) setLocationName(selectedLocation.name);

        // Parallel fetch: air pollution + weather
        const [apRes, wxRes] = await Promise.all([
          fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${openWeatherKey}`),
          fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeatherKey}&units=metric`),
        ]);
        const [apJson, wxJson] = await Promise.all([apRes.json(), wxRes.json()]);

        // ── Pollutant components (all µg/m³ from OW) ──
        const c = apJson?.list?.[0]?.components ?? {};
        // Unit conversions: NO₂, SO₂, O₃ → ppb; CO → ppm; NH₃, PM stays µg/m³
        const pm25  = c.pm2_5  ?? 0;
        const pm10  = c.pm10   ?? 0;
        const no2   = (c.no2   ?? 0) / 1.912;   // µg/m³ → ppb
        const so2   = (c.so2   ?? 0) / 2.663;   // µg/m³ → ppb
        const co    = (c.co    ?? 0) / 1145.45;  // µg/m³ → ppm
        const o3    = (c.o3    ?? 0) / 1.9957;   // µg/m³ → ppb
        const nh3   = c.nh3    ?? 0;

        const computedAQI = pm25toAQI(pm25);
        setOverallAQI(computedAQI);
        const { status, color } = getAQIStatus(computedAQI);
        setAqiStatus(status);
        setAqiColor(color);
        setLastUpdated(new Date().toLocaleTimeString());

        const getStatus = (value: number, type: string) => {
          if (type === "pm25") {
            if (value <= 12)   return { status: "Good",          color: "green",  trend: "down"   as const };
            if (value <= 35.4) return { status: "Moderate",      color: "yellow", trend: "stable" as const };
            if (value <= 55.4) return { status: "Unhealthy",     color: "orange", trend: "up"     as const };
            return                    { status: "Very Unhealthy", color: "red",    trend: "up"     as const };
          }
          if (type === "pm10") {
            if (value <= 54)  return { status: "Good",          color: "green",  trend: "down"   as const };
            if (value <= 154) return { status: "Moderate",      color: "yellow", trend: "stable" as const };
            if (value <= 254) return { status: "Unhealthy",     color: "orange", trend: "up"     as const };
            return                   { status: "Very Unhealthy", color: "red",    trend: "up"     as const };
          }
          if (type === "no2") {
            if (value <= 53)  return { status: "Good",          color: "green",  trend: "down"   as const };
            if (value <= 100) return { status: "Moderate",      color: "yellow", trend: "stable" as const };
            if (value <= 360) return { status: "Unhealthy",     color: "orange", trend: "up"     as const };
            return                   { status: "Very Unhealthy", color: "red",    trend: "up"     as const };
          }
          if (type === "so2") {
            if (value <= 35)  return { status: "Good",          color: "green",  trend: "down"   as const };
            if (value <= 75)  return { status: "Moderate",      color: "yellow", trend: "stable" as const };
            if (value <= 185) return { status: "Unhealthy",     color: "orange", trend: "up"     as const };
            return                   { status: "Very Unhealthy", color: "red",    trend: "up"     as const };
          }
          if (type === "co") {
            if (value <= 4.4)  return { status: "Good",          color: "green",  trend: "down"   as const };
            if (value <= 9.4)  return { status: "Moderate",      color: "yellow", trend: "stable" as const };
            if (value <= 12.4) return { status: "Unhealthy",     color: "orange", trend: "up"     as const };
            return                    { status: "Very Unhealthy", color: "red",    trend: "up"     as const };
          }
          if (type === "o3") {
            if (value <= 54) return { status: "Good",          color: "green",  trend: "down"   as const };
            if (value <= 70) return { status: "Moderate",      color: "yellow", trend: "stable" as const };
            if (value <= 85) return { status: "Unhealthy",     color: "orange", trend: "up"     as const };
            return                  { status: "Very Unhealthy", color: "red",    trend: "up"     as const };
          }
          return { status: "Good", color: "green", trend: "stable" as const };
        };

        setPollutants([
          { name: "PM2.5", icon: "PM2.5", iconBg: "from-red-400 to-pink-400",
            value: pm25 > 0 ? pm25.toFixed(1) : "N/A", unit: "µg/m³",
            ...getStatus(pm25, "pm25"), description: "Fine particulate matter" },
          { name: "PM10",  icon: "PM10",  iconBg: "from-orange-400 to-red-400",
            value: pm10 > 0 ? pm10.toFixed(1) : "N/A", unit: "µg/m³",
            ...getStatus(pm10, "pm10"), description: "Coarse dust particles" },
          { name: "NO₂",   icon: "NO₂",   iconBg: "from-blue-400 to-cyan-400",
            value: no2 > 0 ? no2.toFixed(1) : "N/A", unit: "ppb",
            ...getStatus(no2, "no2"), description: "Vehicle emissions" },
          { name: "SO₂",   icon: "SO₂",   iconBg: "from-purple-400 to-pink-400",
            value: so2 > 0 ? so2.toFixed(1) : "N/A", unit: "ppb",
            ...getStatus(so2, "so2"), description: "Industrial emissions" },
          { name: "CO",    icon: "CO",    iconBg: "from-gray-400 to-gray-600",
            value: co > 0 ? co.toFixed(2) : "N/A", unit: "ppm",
            ...getStatus(co, "co"), description: "Fuel combustion" },
          { name: "O₃",    icon: "O₃",    iconBg: "from-cyan-400 to-blue-400",
            value: o3 > 0 ? o3.toFixed(1) : "N/A", unit: "ppb",
            ...getStatus(o3, "o3"), description: "Ozone / Smog" },
          { name: "NH₃",   icon: "NH₃",   iconBg: "from-green-400 to-emerald-400",
            value: nh3 > 0 ? nh3.toFixed(1) : "N/A", unit: "µg/m³",
            status: "Good", color: "green", description: "Agriculture source", trend: "stable" as const },
        ]);

        // Weather
        if (wxJson.cod === 200) {
          setWeather({
            temp:        Math.round(wxJson.main.temp),
            humidity:    wxJson.main.humidity,
            windSpeed:   Math.round(wxJson.wind.speed * 3.6),
            description: wxJson.weather[0].description,
            icon:        wxJson.weather[0].icon,
          });
        }
      } catch (error) {
        console.error("Error fetching pollutants:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedLocation]);

  const getStatusColor = (color: string) => {
    const colors: Record<string, string> = {
      green: "bg-green-500/20 border-green-500/30 text-green-400",
      yellow: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400",
      orange: "bg-orange-500/20 border-orange-500/30 text-orange-400",
      red: "bg-red-500/20 border-red-500/30 text-red-400",
      purple: "bg-purple-500/20 border-purple-500/30 text-purple-400",
      maroon: "bg-rose-900/20 border-rose-900/30 text-rose-400",
      gray: "bg-gray-500/20 border-gray-500/30 text-gray-400",
    };
    return colors[color] || colors.green;
  };

  const getValueColor = (color: string) => {
    const colors: Record<string, string> = {
      green: "text-green-400",
      yellow: "text-yellow-400",
      orange: "text-orange-400",
      red: "text-red-400",
      purple: "text-purple-400",
      maroon: "text-rose-400",
      gray: "text-gray-400",
    };
    return colors[color] || colors.green;
  };

  return (
    <section className="py-4">
      {/* Header with AQI + Weather */}
      <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Title */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-1 text-emerald-50" style={{fontFamily:'Space Grotesk'}}>🌿 Live Pollutants Tracker</h2>
          <p className="text-sm text-slate-400 mb-4">📍 {locationName}</p>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-900/40 border border-emerald-700/40 rounded-lg px-3 py-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs text-emerald-300 font-medium">Live Data</span>
            </div>
            {lastUpdated && (
              <span className="text-xs text-slate-500">Updated: {lastUpdated}</span>
            )}
          </div>
        </div>

        {/* Right: Overall AQI and Weather */}
        <div className="grid grid-cols-2 gap-3">
          {/* Overall AQI */}
          <div className="rounded-xl p-4 bg-black/30 border border-emerald-800/40 hover:border-emerald-600/60 hover:scale-105 transition-all shadow-lg backdrop-blur-sm">
            <p className="text-xs text-slate-400 mb-1">Overall AQI</p>
            <p className={`text-4xl font-bold mb-2 ${getValueColor(aqiColor)}`}>{overallAQI}</p>
            <div className={`px-2 py-1 rounded-full border text-[10px] font-semibold inline-block ${getStatusColor(aqiColor)}`}>
              {aqiStatus}
            </div>
          </div>

          {/* Weather */}
          {weather && (
            <div className="rounded-xl p-4 bg-black/30 border border-emerald-800/40 hover:border-emerald-600/60 hover:scale-105 transition-all shadow-lg backdrop-blur-sm">
              <p className="text-xs text-slate-400 mb-1">Weather</p>
              <div className="flex items-center gap-2 mb-1">
                <img
                  src={`https://openweathermap.org/img/wn/${weather.icon}.png`}
                  alt={weather.description}
                  className="w-8 h-8"
                />
                <p className="text-3xl font-bold text-sky-300">{weather.temp}°C</p>
              </div>
              <p className="text-[10px] text-slate-400 capitalize">{weather.description}</p>
              <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                <span>💨 {weather.windSpeed} km/h</span>
                <span>💧 {weather.humidity}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Health Recommendation */}
      <div className={`mb-6 rounded-xl p-4 border backdrop-blur-sm ${
        aqiColor === 'green' ? 'bg-emerald-950/50 border-emerald-700/40' :
        aqiColor === 'yellow' ? 'bg-yellow-950/50 border-yellow-700/40' :
        aqiColor === 'orange' ? 'bg-orange-950/50 border-orange-700/40' :
        'bg-red-950/50 border-red-700/40'
      }`}>
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="text-sm font-semibold mb-1 text-emerald-100" style={{fontFamily:'Space Grotesk'}}>Health Advisory</h3>
            <p className="text-sm text-slate-300">{getHealthRecommendation(overallAQI)}</p>
          </div>
        </div>
      </div>

      {/* Horizontal Pollutant Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {pollutants.map((pollutant, index) => (
          <div
            key={index}
            className="rounded-xl p-4 bg-black/25 border border-emerald-900/50 hover:border-emerald-600/60 transition-all duration-300 hover:scale-105 group relative overflow-hidden shadow-lg backdrop-blur-sm hover:bg-emerald-950/30"
          >
            {/* Trend Indicator */}
            {pollutant.trend && (
              <div className="absolute top-2 right-2">
                {pollutant.trend === "up" && <span className="text-red-400 text-xs">↗</span>}
                {pollutant.trend === "down" && <span className="text-green-400 text-xs">↘</span>}
                {pollutant.trend === "stable" && <span className="text-gray-400 text-xs">→</span>}
              </div>
            )}

            {/* Icon with gradient */}
            <div
              className={`w-12 h-12 rounded-lg bg-gradient-to-br ${pollutant.iconBg} flex items-center justify-center mb-3 group-hover:rotate-6 transition-transform shadow-lg`}
            >
              <span className="text-white text-xs font-bold">{pollutant.icon}</span>
            </div>

            {/* Name */}
            <h3 className="text-sm font-semibold mb-1 text-emerald-100">{pollutant.name}</h3>

            {/* Value */}
            <div className="mb-2">
              <span className={`text-2xl font-bold ${getValueColor(pollutant.color)}`}>
                {pollutant.value}
              </span>
              <span className="text-xs text-slate-500 ml-1">{pollutant.unit}</span>
            </div>

            {/* Status Badge */}
            <div
              className={`px-2 py-1 rounded-full border text-[10px] font-semibold inline-block mb-2 ${getStatusColor(
                pollutant.color
              )}`}
            >
              {pollutant.status}
            </div>

            {/* Description */}
            <p className="text-[10px] text-slate-500 leading-tight">{pollutant.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
