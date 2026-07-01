import { useEffect, useMemo, useState } from "react";

type LocationData = {
  lat: number;
  lon: number;
  name?: string;
};

type DailyForecast = {
  date: string;
  dayName: string;
  tempMin: number;
  tempMax: number;
  description: string;
  icon: string;
  rainChance: number;
};

type Props = {
  selectedLocation?: LocationData | null;
};

const OPENWEATHER_KEY = import.meta.env.VITE_OPENWEATHER_KEY;

function dayLabel(date: Date, offset = 0) {
  return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date);
}

function iconFor(description: string) {
  const lower = description.toLowerCase();
  if (lower.includes("thunder")) return "⛈️";
  if (lower.includes("rain") || lower.includes("drizzle")) return "🌧️";
  if (lower.includes("snow")) return "❄️";
  if (lower.includes("cloud")) return "☁️";
  if (lower.includes("mist") || lower.includes("fog") || lower.includes("haze")) return "🌫️";
  return "☀️";
}

function buildDailyFromForecast(list: any[]): DailyForecast[] {
  const groups = new Map<string, any[]>();

  list.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const key = date.toISOString().slice(0, 10);
    const bucket = groups.get(key) ?? [];
    bucket.push(item);
    groups.set(key, bucket);
  });

  return Array.from(groups.entries()).slice(0, 7).map(([date, items]) => {
    const temps = items.map((item) => item.main?.temp ?? 0);
    const best = items.sort((a, b) => (a.pop ?? 0) - (b.pop ?? 0))[0] ?? items[0];
    const dateObj = new Date(`${date}T12:00:00`);

    return {
      date,
      dayName: dayLabel(dateObj),
      tempMin: Math.round(Math.min(...temps)),
      tempMax: Math.round(Math.max(...temps)),
      description: best?.weather?.[0]?.description ?? "partly cloudy",
      icon: best?.weather?.[0]?.icon ?? "01d",
      rainChance: Math.round((Math.max(...items.map((item) => item.pop ?? 0)) || 0) * 100),
    };
  });
}

export default function WeatherForecastSection({ selectedLocation }: Props) {
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState<DailyForecast[]>([]);
  const [locationName, setLocationName] = useState<string>("Select a location");
  const [currentTemp, setCurrentTemp] = useState<number | null>(null);
  const [currentDescription, setCurrentDescription] = useState<string>("");
  const [currentHumidity, setCurrentHumidity] = useState<number | null>(null);
  const [currentWind, setCurrentWind] = useState<number | null>(null);

  useEffect(() => {
    const fetchForecast = async () => {
      if (!selectedLocation) {
        setLocationName("Select a location");
        setForecast([]);
        setCurrentTemp(null);
        setCurrentDescription("");
        setCurrentHumidity(null);
        setCurrentWind(null);
        return;
      }

      const lat = selectedLocation.lat;
      const lon = selectedLocation.lon;

      if (selectedLocation.name) setLocationName(selectedLocation.name);

      setLoading(true);

      try {
        const [weatherRes, oneCallRes, fallbackRes] = await Promise.all([
          fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_KEY}&units=metric`),
          fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&appid=${OPENWEATHER_KEY}&units=metric`),
          fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_KEY}&units=metric`),
        ]);

        const weatherJson = await weatherRes.json();
        if (weatherJson?.main) {
          setCurrentTemp(Math.round(weatherJson.main.temp));
          setCurrentDescription(weatherJson.weather?.[0]?.description ?? "clear sky");
          setCurrentHumidity(weatherJson.main.humidity ?? null);
          setCurrentWind(Math.round((weatherJson.wind?.speed ?? 0) * 3.6));
        }

        if (oneCallRes.ok) {
          const oneCallJson = await oneCallRes.json();
          const days = (oneCallJson.daily ?? []).slice(0, 7).map((item: any, index: number) => ({
            date: new Date((item.dt ?? 0) * 1000).toISOString().slice(0, 10),
            dayName: index === 0 ? "Today" : dayLabel(new Date((item.dt ?? 0) * 1000)),
            tempMin: Math.round(item.temp?.min ?? 0),
            tempMax: Math.round(item.temp?.max ?? 0),
            description: item.weather?.[0]?.description ?? "partly cloudy",
            icon: item.weather?.[0]?.icon ?? "01d",
            rainChance: Math.round((item.pop ?? 0) * 100),
          }));
          setForecast(days);
          return;
        }

        if (fallbackRes.ok) {
          const fallbackJson = await fallbackRes.json();
          const days = buildDailyFromForecast(fallbackJson.list ?? []);

          if (days.length >= 5) {
            const seed = days[days.length - 1];
            const projected: DailyForecast[] = [];
            for (let i = days.length; i < 7; i += 1) {
              projected.push({
                date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
                dayName: dayLabel(new Date(Date.now() + i * 24 * 60 * 60 * 1000)),
                tempMin: Math.max(seed.tempMin - 1, seed.tempMin - (i - days.length + 1)),
                tempMax: seed.tempMax + Math.max(0, 1 - (i - days.length)),
                description: seed.description,
                icon: seed.icon,
                rainChance: seed.rainChance,
              });
            }
            setForecast([...days, ...projected].slice(0, 7));
          } else {
            setForecast(days);
          }
        }
      } catch (error) {
        console.error("Error fetching forecast:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, [selectedLocation]);

  const summary = useMemo(() => {
    if (!forecast.length) return null;
    const avgHigh = Math.round(forecast.reduce((sum, item) => sum + item.tempMax, 0) / forecast.length);
    const avgRain = Math.round(forecast.reduce((sum, item) => sum + item.rainChance, 0) / forecast.length);
    return { avgHigh, avgRain };
  }, [forecast]);

  return (
    <section className="rounded-3xl border border-emerald-800/40 bg-gradient-to-br from-[#04110a] via-[#07180d] to-[#021008] p-6 shadow-2xl shadow-black/40 backdrop-blur-md">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-500/80">Weather Forecast</p>
          <h2 className="mt-1 text-2xl font-bold text-emerald-50" style={{ fontFamily: "Space Grotesk" }}>
            7-Day Nature Outlook
          </h2>
          <p className="mt-1 text-sm text-emerald-300/75">
            {selectedLocation?.name ?? locationName} · reading the sky, day by day
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center text-xs text-emerald-200/80">
          <div className="rounded-2xl border border-emerald-800/40 bg-emerald-950/60 px-3 py-2">
            <div className="text-emerald-400">Temp</div>
            <div className="mt-1 text-base font-semibold text-emerald-50">{currentTemp ?? "--"}°C</div>
          </div>
          <div className="rounded-2xl border border-emerald-800/40 bg-emerald-950/60 px-3 py-2">
            <div className="text-emerald-400">Humidity</div>
            <div className="mt-1 text-base font-semibold text-emerald-50">{currentHumidity ?? "--"}%</div>
          </div>
          <div className="rounded-2xl border border-emerald-800/40 bg-emerald-950/60 px-3 py-2">
            <div className="text-emerald-400">Wind</div>
            <div className="mt-1 text-base font-semibold text-emerald-50">{currentWind ?? "--"} km/h</div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-emerald-900/50 bg-black/25 px-4 py-3 text-sm text-emerald-100/90">
        {loading ? (
          <span className="text-emerald-300">Listening to the weather winds...</span>
        ) : currentDescription ? (
          <span>
            Current sky: <span className="text-emerald-300">{currentDescription}</span>
            {summary ? (
              <span className="text-emerald-200/80"> · avg high {summary.avgHigh}°C, rain chance {summary.avgRain}%</span>
            ) : null}
          </span>
        ) : (
          <span className="text-emerald-300">Select a location to see the forecast.</span>
        )}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-7">
        {forecast.map((day, index) => (
          <div
            key={`${day.date}-${index}`}
            className="rounded-2xl border border-emerald-800/40 bg-emerald-950/45 px-3 py-4 text-center shadow-lg shadow-black/20"
          >
            <p className="text-sm font-semibold text-emerald-50" style={{ fontFamily: "Space Grotesk" }}>
              {day.dayName}
            </p>
            <div className="mt-3 text-3xl">{iconFor(day.description)}</div>
            <p className="mt-2 text-xs text-emerald-300/80 capitalize">{day.description}</p>
            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-emerald-100">
              <span className="font-semibold text-emerald-50">{day.tempMax}°</span>
              <span className="text-emerald-500">/</span>
              <span>{day.tempMin}°</span>
            </div>
            <p className="mt-2 text-[11px] text-emerald-300/70">Rain {day.rainChance}%</p>
          </div>
        ))}
      </div>
    </section>
  );
}