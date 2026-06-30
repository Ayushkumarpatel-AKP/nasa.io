// src/components/EmissionsSection.tsx
import { useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import AirQualityMap from "./AirQualityMap";

interface Props {
  searchLocation?: { lat: number; lon: number; name?: string } | null;
  onLocationSelect?: (location: { lat: number; lon: number; name?: string }) => void;
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

const RadarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-emerald-200">
    <circle cx="12" cy="12" r="8" opacity="0.8" />
    <circle cx="12" cy="12" r="4" opacity="0.65" />
    <path d="M12 12L18 8" />
    <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
  </svg>
);

const SatelliteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="10" y="10" width="4" height="4" rx="1" />
    <rect x="3" y="10" width="4" height="4" rx="0.8" opacity="0.85" />
    <rect x="17" y="10" width="4" height="4" rx="0.8" opacity="0.85" />
    <path d="M7 12h3M14 12h3M12 10V6" />
    <circle cx="12" cy="5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const BarsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M4 20V12M10 20V8M16 20V5M20 20H3" />
    <path d="M4 12h2M10 8h2M16 5h2" />
  </svg>
);

const PinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10z" />
    <circle cx="12" cy="11" r="2.2" />
  </svg>
);

const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.6 2.3 4 5.7 4 9s-1.4 6.7-4 9c-2.6-2.3-4-5.7-4-9s1.4-6.7 4-9z" />
  </svg>
);

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

export default function EmissionsSection({ searchLocation, onLocationSelect }: Props) {
  const [cities, setCities] = useState<CityAQI[]>(
    CITIES.map(c => ({ ...c, aqi: null, loading: true }))
  );
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

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
  }, []);

  // initial + 90s polling
  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, 90_000);
    return () => clearInterval(id);
  }, [fetchAll]);

  const maxAqi = Math.max(...cities.map(c => c.aqi ?? 0), 1);

  return (
    <section className="py-8">
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
          <AirQualityMap searchLocation={searchLocation} onLocationSelect={onLocationSelect} />
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

          {/* ── LIVE MONITORING ── */}
          <div className="rounded-2xl border border-emerald-900/30 p-4 shadow-xl"
            style={{ background: "linear-gradient(160deg,rgba(0,0,0,0.5),rgba(5,46,22,0.15))" }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-900/50 flex items-center justify-center border border-emerald-700/40">
                <RadarIcon />
              </div>
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest" style={{ fontFamily: "Space Grotesk" }}>
                Live Monitoring
              </span>
            </div>
            <div className="space-y-2">
              <LiveStat label="NASA Satellites"   value={2456}  suffix=""  color="#60a5fa" icon={<SatelliteIcon />} />
              <LiveStat label="Data Points / Day" value={14200} suffix="K" color="#a78bfa" icon={<BarsIcon />} />
              <LiveStat label="Ground Stations"   value={9800}  suffix="+" color="#34d399" icon={<PinIcon />} />
              <LiveStat label="Global Coverage"   value={987}   suffix="‰" color="#fb923c" icon={<GlobeIcon />} />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
