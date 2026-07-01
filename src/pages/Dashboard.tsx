// src/pages/Dashboard.tsx
import { useEffect, useRef, useState } from "react";
import EmissionsSection from "../components/EmissionsSection";
import MetricsSection from "../components/MetricsSection";
import LivePollutantsTracker from "../components/LivePollutantsTracker";
import FloatingNatureBot from "../components/FloatingNatureBot";
import WeatherForecastSection from "../components/WeatherForecastSection";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState<{ lat: number; lon: number; name?: string } | null>(null);
  const [mapClickLocation, setMapClickLocation] = useState<{ lat: number; lon: number; name?: string } | null>(null);
  const [defaultLocationLoaded, setDefaultLocationLoaded] = useState(false);
  const emissionsSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setDefaultLocationLoaded(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          const apiKey = import.meta.env.VITE_OPENWEATHER_KEY;
          const response = await fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`
          );
          const data = await response.json();

          const location = {
            lat,
            lon,
            name: data?.length > 0 ? `${data[0].name}, ${data[0].country}` : "Your current location",
          };

          setSearchLocation(location);
          setMapClickLocation(location);
        } catch (error) {
          console.error("Error resolving current location:", error);
          const location = {
            lat,
            lon,
            name: "Your current location",
          };
          setSearchLocation(location);
          setMapClickLocation(location);
        } finally {
          setDefaultLocationLoaded(true);
        }
      },
      (error) => {
        console.warn("Geolocation unavailable, falling back to default city:", error);
        const fallback = { lat: 28.6139, lon: 77.2090, name: "Delhi, India" };
        setSearchLocation(fallback);
        setMapClickLocation(fallback);
        setDefaultLocationLoaded(true);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 }
    );
  }, []);

  useEffect(() => {
    if (!searchLocation || !defaultLocationLoaded) return;

    emissionsSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [searchLocation, defaultLocationLoaded]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      // Use OpenWeather Geocoding API
      const apiKey = import.meta.env.VITE_OPENWEATHER_KEY;
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(searchQuery)}&limit=1&appid=${apiKey}`
      );
      const data = await response.json();

      if (data.length > 0) {
        const location = {
          lat: data[0].lat,
          lon: data[0].lon,
          name: `${data[0].name}, ${data[0].country}`
        };
        setSearchLocation(location);
        setMapClickLocation(location); // Also update pollutants tracker
      } else {
        alert("Location not found. Please try another search.");
      }
    } catch (error) {
      console.error("Error searching location:", error);
      alert("Error searching location. Please try again.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* SEARCH BAR */}
      <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-2xl p-6 backdrop-blur-md shadow-xl shadow-black/30">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-3xl">🌍</span>
            <div>
              <h2 className="text-xl font-bold text-emerald-50" style={{fontFamily:'Space Grotesk'}}>Search Location</h2>
              <p className="text-sm text-slate-400">Find air quality data for any city worldwide</p>
            </div>
          </div>
          
          <form onSubmit={handleSearch} className="flex-1 flex gap-3 w-full md:w-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter city name (e.g., Paris, New York, Tokyo)..."
              className="flex-1 px-4 py-3 bg-black/30 border border-emerald-800/40 rounded-xl text-emerald-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-600/60 focus:border-emerald-600/60 transition"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-emerald-700 to-green-700 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all shadow-lg hover:shadow-emerald-900/50"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* GLOBAL EMISSIONS MAP SECTION */}
      <section ref={emissionsSectionRef} className="scroll-mt-24">
        <EmissionsSection
          searchLocation={searchLocation}
          onLocationSelect={setMapClickLocation}
        />
      </section>

      {/* TRACKED MOLECULES & POLLUTANTS */}
      <LivePollutantsTracker selectedLocation={mapClickLocation} />

      <WeatherForecastSection selectedLocation={mapClickLocation} />

      {/* ENVIRONMENTAL METRICS SECTION */}
      <MetricsSection />

      <FloatingNatureBot selectedLocation={mapClickLocation} />
    </div>
  );
}
