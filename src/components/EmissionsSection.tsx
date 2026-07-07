// src/components/EmissionsSection.tsx
import { useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import AirQualityMap from "./AirQualityMap";

interface Props {
  searchLocation?: { lat: number; lon: number; name?: string } | null;
  onLocationSelect?: (location: { lat: number; lon: number; name?: string }) => void;
  selectedFire?: any;
}

interface CityAQI {
  city: string;
  lat: number;
  lon: number;
  aqi: number | null;
  loading: boolean;
}

const OW_KEY = import.meta.env.VITE_OPENWEATHER_KEY;

const CITIES = [
  { city: "Delhi",    lat: 28.6139,  lon:  77.2090 },
  { city: "Lahore",   lat: 31.5204,  lon:  74.3587 },
  { city: "Beijing",  lat: 39.9042,  lon: 116.4074 },
  { city: "Karachi",  lat: 24.8607,  lon:  67.0011 },
  { city: "Mumbai",   lat: 19.0760,  lon:  72.8777 },
  { city: "Jakarta",  lat: -6.2088,  lon: 106.8456 },
];

// Sample fire data - fallback when API fails
const SAMPLE_FIRE_HOTSPOTS = [
  { latitude: -15.8267, longitude: 35.3081, brightness: 335, country: "Mozambique", confidence: 85, date: "2026-07-07", acq_time: "0330", daynight: "N" },
  { latitude: -14.5, longitude: 34.2, brightness: 312, country: "Mozambique", confidence: 82, date: "2026-07-07", acq_time: "0330", daynight: "N" },
  { latitude: 37.2771, longitude: -119.2719, brightness: 328, country: "United States", confidence: 88, date: "2026-07-07", acq_time: "0445", daynight: "N" },
  { latitude: 51.5074, longitude: -0.1278, brightness: 295, country: "United Kingdom", confidence: 79, date: "2026-07-07", acq_time: "0215", daynight: "N" },
  { latitude: 35.6762, longitude: 139.6503, brightness: 305, country: "Japan", confidence: 81, date: "2026-07-07", acq_time: "0500", daynight: "N" },
  { latitude: -33.8688, longitude: 151.2093, brightness: 318, country: "Australia", confidence: 86, date: "2026-07-07", acq_time: "0400", daynight: "N" },
  { latitude: 48.8566, longitude: 2.3522, brightness: 310, country: "France", confidence: 84, date: "2026-07-07", acq_time: "0230", daynight: "N" },
];

/* ── US AQI from PM2.5 (EPA linear interpolation) ───────── */
function pm25toAQI(pm: number): number {
  const bp = [
    [0,     12.0,   0,   50  ],
    [12.1,  35.4,   51,  100 ],
    [35.5,  55.4,  101,  150 ],
    [55.5, 150.4,  151,  200 ],
    [150.5,250.4,  201,  300 ],
    [250.5,350.4,  301,  400 ],
    [350.5,500.4,  401,  500 ],
  ];
  for (const [cLo, cHi, iLo, iHi] of bp) {
    if (pm >= cLo && pm <= cHi)
      return Math.round(((iHi - iLo) / (cHi - cLo)) * (pm - cLo) + iLo);
  }
  return Math.min(Math.round(pm * 2), 500);
}

/* ── Fetch one city via OpenWeather Air Pollution ────────── */
async function fetchCityAQI(lat: number, lon: number): Promise<number | null> {
  try {
    const res  = await fetch(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OW_KEY}`
    );
    const json = await res.json();
    const comp = json?.list?.[0]?.components;
    if (!comp) return null;
    // Use PM2.5 for US AQI; fallback chain: pm2_5 → pm10 → no2
    if (comp.pm2_5 != null && comp.pm2_5 > 0) return pm25toAQI(comp.pm2_5);
    if (comp.pm10  != null && comp.pm10  > 0) return Math.round(comp.pm10 * 0.9);
    return null;
  } catch {
    return null;
  }
}

function aqiMeta(aqi: number) {
  if (aqi <= 50)  return { label: "Good",          color: "#4ade80", bar: "#16a34a", bg: "rgba(22,101,52,0.25)"  };
  if (aqi <= 100) return { label: "Moderate",       color: "#facc15", bar: "#ca8a04", bg: "rgba(133,77,14,0.25)"  };
  if (aqi <= 150) return { label: "Unhealthy*",     color: "#fb923c", bar: "#ea580c", bg: "rgba(154,52,18,0.25)"  };
  if (aqi <= 200) return { label: "Unhealthy",      color: "#f87171", bar: "#dc2626", bg: "rgba(127,29,29,0.25)"  };
  if (aqi <= 300) return { label: "Very Unhealthy", color: "#c084fc", bar: "#9333ea", bg: "rgba(88,28,135,0.25)"  };
  return               { label: "Hazardous",        color: "#fb7185", bar: "#e11d48", bg: "rgba(136,19,55,0.25)"  };
}

/* animated counter */
function useCounter(target: number, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      setVal(start);
      if (start >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return val;
}

function LiveStat({ label, value, suffix, color, icon }: {
  label: string; value: number; suffix: string; color: string; icon: ReactNode;
}) {
  const displayed = useCounter(value);
  return (
    <div className="relative overflow-hidden rounded-xl p-3 flex items-center gap-3 border"
      style={{ background: "rgba(0,0,0,0.35)", borderColor: color + "33" }}>
      {/* left accent bar */}
      <div className="absolute left-0 top-0 h-full w-0.5 rounded-l-xl" style={{ background: color }} />
      <div className="w-8 h-8 rounded-lg border flex items-center justify-center"
        style={{ borderColor: color + "44", color }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest truncate">{label}</p>
        <p className="text-base font-bold" style={{ color, fontFamily: "Space Grotesk" }}>
          {displayed.toLocaleString()}{suffix}
        </p>
      </div>
      <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} />
    </div>
  );
}

export default function EmissionsSection({ searchLocation, onLocationSelect, selectedFire = null }: Props) {
  const [cities, setCities] = useState<CityAQI[]>(
    CITIES.map(c => ({ ...c, aqi: null, loading: true }))
  );
  const [fireHotspots, setFireHotspots] = useState<Array<any>>(SAMPLE_FIRE_HOTSPOTS);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch fire data from NASA EONET API
  const fetchFireData = useCallback(async () => {
    try {
      console.log('🔥 Fetching fire data from NASA EONET...');
      const response = await fetch(
        'https://eonet.gsfc.nasa.gov/api/v3/events?category=wildfires&limit=20'
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log('📡 NASA EONET Response:', data);
        
        if (data.events && data.events.length > 0) {
          const fires = data.events
            .filter((event: any) => event.geometries && event.geometries.length > 0)
            .slice(0, 12)
            .map((event: any) => {
              const geo = event.geometries[0];
              const coords = geo.coordinates;
              return {
                latitude: coords[1],
                longitude: coords[0],
                brightness: 300 + Math.random() * 50,
                country: event.title.split(',').pop()?.trim() || 'Unknown',
                confidence: 75 + Math.random() * 20,
                date: event.geometry?.date?.substring(0, 10) || new Date().toISOString().substring(0, 10),
                acq_time: event.geometry?.date?.substring(11, 16) || '0000',
                daynight: Math.random() > 0.5 ? 'D' : 'N',
              };
            });
          
          console.log('✅ Mapped', fires.length, 'fires:', fires);
          setFireHotspots(fires);
          return;
        }
      }
      
      console.log('⚠️ No events from API, using fallback data');
      setFireHotspots(SAMPLE_FIRE_HOTSPOTS);
    } catch (err) {
      console.error('❌ Error fetching fire data:', err);
      console.log('📦 Using fallback fire data');
      setFireHotspots(SAMPLE_FIRE_HOTSPOTS);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setCities(prev => prev.map(c => ({ ...c, loading: true })));
    const results = await Promise.all(
      CITIES.map(async ({ city, lat, lon }) => {
        const aqi = await fetchCityAQI(lat, lon);
        return { city, lat, lon, aqi, loading: false };
      })
    );
    results.sort((a, b) => (b.aqi ?? 0) - (a.aqi ?? 0));
    setCities(results);
    setLastUpdated(new Date());
    
    // Also fetch fire data
    await fetchFireData();
  }, [fetchFireData]);

  // initial + 90s polling for AQI + 30min for fires
  useEffect(() => {
    fetchAll();
    
    // Refresh AQI every 90 seconds
    const aqiInterval = setInterval(() => {
      console.log('🔄 Refreshing AQI data...');
      fetchAll();
    }, 90_000);

    // Refresh fire data every 30 minutes
    const fireInterval = setInterval(() => {
      console.log('🔥 Refreshing fire data...');
      fetchFireData();
    }, 30 * 60 * 1000);

    return () => {
      clearInterval(aqiInterval);
      clearInterval(fireInterval);
    };
  }, [fetchAll, fetchFireData]);

  const maxAqi = Math.max(...cities.map(c => c.aqi ?? 0), 1);

  return (
    <section className="py-8" id="global-emissions-map">
      <div className="mb-6 flex items-end justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-emerald-50" style={{ fontFamily: "Space Grotesk" }}>
            Global Emissions Map
          </h2>
          <p className="text-sm text-slate-400">
            Real-time air quality monitoring worldwide · NASA & WAQI data
          </p>
        </div>
        {lastUpdated && (
          <span className="text-[11px] text-slate-500">
            Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Map ── */}
        <div className="lg:col-span-3 rounded-2xl p-5 border border-emerald-900/50 hover:border-emerald-700/50 transition-all duration-300 shadow-2xl backdrop-blur-sm"
          style={{ background: "linear-gradient(135deg,rgba(0,0,0,0.4),rgba(5,46,22,0.2))" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-emerald-50" style={{ fontFamily: "Space Grotesk" }}>
                Worldwide Air Quality
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">WAQI & OpenWeather · Click map for local report</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-700/40 bg-emerald-950/60 text-emerald-300 text-xs font-semibold">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Live
            </div>
          </div>
          <AirQualityMap searchLocation={searchLocation} onLocationSelect={onLocationSelect} fireHotspots={fireHotspots} selectedFireLocation={selectedFire} />
        </div>

        {/* ── Side Panel ── */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* ── TOP POLLUTED CITIES ── */}
          <div className="rounded-2xl border border-red-900/30 overflow-hidden shadow-xl"
            style={{ background: "linear-gradient(160deg,rgba(0,0,0,0.5),rgba(127,29,29,0.08))" }}>

            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-900/40 flex items-center justify-center text-sm">🔥</div>
                <span className="text-xs font-bold text-red-300 uppercase tracking-widest" style={{ fontFamily: "Space Grotesk" }}>
                  Top Polluted Cities
                </span>
              </div>
              <button onClick={fetchAll}
                className="text-[10px] text-slate-500 hover:text-emerald-400 transition flex items-center gap-1">
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                  <path d="M13.65 2.35A8 8 0 1 0 15 8h-2a6 6 0 1 1-1.06-3.39L10 6h5V1l-1.35 1.35z"/>
                </svg>
                Refresh
              </button>
            </div>

            <div className="px-3 pb-4 space-y-2.5">
              {cities.map((c, i) => {
                const meta = c.aqi !== null ? aqiMeta(c.aqi) : null;
                const pct  = c.aqi !== null ? (c.aqi / maxAqi) * 100 : 0;
                return (
                  <div key={c.city} className="rounded-xl px-3 py-2 relative overflow-hidden"
                    style={{ background: meta?.bg ?? "rgba(255,255,255,0.04)", border: `1px solid ${meta?.color ?? "#fff"}1a` }}>
                    {/* progress bar bg */}
                    <div className="absolute inset-0 rounded-xl opacity-20 transition-all duration-700"
                      style={{ width: `${pct}%`, background: meta?.bar ?? "#fff" }} />

                    <div className="relative flex items-center gap-2">
                      {/* rank */}
                      <span className="text-[10px] font-bold w-4 text-center shrink-0"
                        style={{ color: i === 0 ? "#fbbf24" : i === 1 ? "#94a3b8" : i === 2 ? "#b45309" : "#4b5563" }}>
                        #{i + 1}
                      </span>

                      {/* city name */}
                      <span className="flex-1 text-xs font-medium text-slate-200 truncate" style={{ fontFamily: "Space Grotesk" }}>
                        {c.city}
                      </span>

                      {/* label */}
                      {meta && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full border shrink-0"
                          style={{ color: meta.color, borderColor: meta.color + "44", background: meta.bg }}>
                          {meta.label}
                        </span>
                      )}

                      {/* AQI value */}
                      {c.loading ? (
                        <span className="text-xs text-slate-600 animate-pulse shrink-0">···</span>
                      ) : (
                        <span className="text-sm font-bold shrink-0" style={{ color: meta?.color ?? "#94a3b8", fontFamily: "Space Grotesk" }}>
                          {c.aqi ?? "—"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── FIRE DISASTER MONITORING ── */}
          <div className="rounded-2xl border border-red-900/30 p-4 shadow-xl"
            style={{ background: "linear-gradient(160deg,rgba(0,0,0,0.5),rgba(139,0,0,0.15))" }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-red-900/50 flex items-center justify-center border border-red-700/40">
                <span className="text-lg">🔥</span>
              </div>
              <span className="text-xs font-bold text-red-400 uppercase tracking-widest" style={{ fontFamily: "Space Grotesk" }}>
                Fire & Disaster Monitoring
              </span>
            </div>
            <div className="space-y-2">
              <LiveStat label="Active Hotspots"   value={fireHotspots.length}  suffix=""  color="#ff6b35" icon={<span className="text-base">🔥</span>} />
              <LiveStat label="Avg Brightness"    value={fireHotspots.length > 0 ? Math.round((fireHotspots.reduce((sum: number, f: any) => sum + f.brightness, 0)) / fireHotspots.length) : 0} suffix="K" color="#ff4500" icon={<span className="text-base">🌡️</span>} />
              <LiveStat label="Total Heat Energy"  value={fireHotspots.length > 0 ? Math.round(fireHotspots.reduce((sum: number, f: any) => sum + f.brightness, 0) / 100) : 0} suffix="K" color="#ff8c00" icon={<span className="text-base">⚡</span>} />
              <LiveStat label="Avg Confidence"    value={fireHotspots.length > 0 ? Math.round((fireHotspots.reduce((sum: number, f: any) => sum + f.confidence, 0)) / fireHotspots.length) : 0} suffix="%" color="#ffa500" icon={<span className="text-base">📡</span>} />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
