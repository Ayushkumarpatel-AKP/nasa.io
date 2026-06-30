// src/components/AirQualityMap.tsx
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface AirQualityData {
  city: string;
  lat: number;
  lon: number;
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  co: number;
  o3: number;
  status: string;
  color: string;
  pressure: number;
  humidity: number;
  temp: number;
  windSpeed: number;
  dominantPollutant: string;
}

interface LocationReport {
  lat: number;
  lon: number;
  address: string;
  countryCode: string;
  aqi: number;
  status: string;
  color: string;
  weather: any;
  timestamp: string;
}

type MapLayerType = "satellite" | "street" | "terrain";

// Custom marker icon based on AQI
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: 24px;
      height: 24px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(0,0,0,0.5);
      animation: pulse 2s infinite;
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const getAQIColor = (aqi: number): string => {
  if (aqi <= 50) return "#00e400"; // Good
  if (aqi <= 100) return "#ffff00"; // Moderate
  if (aqi <= 150) return "#ff7e00"; // Unhealthy for Sensitive
  if (aqi <= 200) return "#ff0000"; // Unhealthy
  if (aqi <= 300) return "#8f3f97"; // Very Unhealthy
  return "#7e0023"; // Hazardous
};

const getAQIStatus = (aqi: number): string => {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
};

// Map layers configuration
const mapLayers = {
  street: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; OpenStreetMap contributors',
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: 'Tiles &copy; Esri',
  },
  terrain: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: 'Map data: &copy; OpenTopoMap',
  },
};

// Component to handle map clicks
function MapClickHandler({ onLocationClick }: { onLocationClick: (lat: number, lon: number) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component to update map center when search location changes
function MapCenterUpdater({ searchLocation }: { searchLocation: { lat: number; lon: number } | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (searchLocation) {
      map.flyTo([searchLocation.lat, searchLocation.lon], 10, {
        duration: 2,
      });
    }
  }, [searchLocation, map]);
  
  return null;
}

interface Props {
  searchLocation?: { lat: number; lon: number; name?: string } | null;
  onLocationSelect?: (location: { lat: number; lon: number; name?: string }) => void;
}

/* EPA US AQI from PM2.5 -------------------------------------------------- */
const pm25toAQI = (pm: number): number => {
  const bp = [
    [0,     12.0,   0,   50],
    [12.1,  35.4,  51,  100],
    [35.5,  55.4, 101,  150],
    [55.5, 150.4, 151,  200],
    [150.5,250.4, 201,  300],
    [250.5,350.4, 301,  400],
    [350.5,500.4, 401,  500],
  ];
  for (const [cLo, cHi, iLo, iHi] of bp)
    if (pm >= cLo && pm <= cHi)
      return Math.round(((iHi - iLo) / (cHi - cLo)) * (pm - cLo) + iLo);
  return Math.min(Math.round(pm * 2), 500);
};

export default function AirQualityMap({ searchLocation, onLocationSelect }: Props) {
  const [airQualityData, setAirQualityData] = useState<AirQualityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapLayer, setMapLayer] = useState<MapLayerType>("street");
  const [locationReport, setLocationReport] = useState<LocationReport | null>(null);
  const [showReport, setShowReport] = useState(false);
  const openWeatherKey = import.meta.env.VITE_OPENWEATHER_KEY;
  // NASA Token available for future satellite imagery integration
  // const nasaToken = import.meta.env.VITE_NASA_EARTHDATA_TOKEN;

  // Major cities to track
  const cities = [
    { name: "Delhi", lat: 28.6139, lon: 77.209 },
    { name: "Beijing", lat: 39.9042, lon: 116.4074 },
    { name: "Los Angeles", lat: 34.0522, lon: -118.2437 },
    { name: "London", lat: 51.5074, lon: -0.1278 },
    { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
    { name: "Mumbai", lat: 19.076, lon: 72.8777 },
    { name: "New York", lat: 40.7128, lon: -74.006 },
    { name: "São Paulo", lat: -23.5505, lon: -46.6333 },
  ];

  useEffect(() => {
    const fetchAirQuality = async () => {
      try {
        const promises = cities.map(async (city) => {
          try {
            const [apRes, wxRes] = await Promise.all([
              fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${city.lat}&lon=${city.lon}&appid=${openWeatherKey}`),
              fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${openWeatherKey}&units=metric`),
            ]);
            const [apData, weatherData] = await Promise.all([apRes.json(), wxRes.json()]);

            const comp = apData?.list?.[0]?.components ?? {};
            const pm25 = comp.pm2_5 ?? 0;
            const aqi  = pm25toAQI(pm25);

            return {
              city: city.name,
              lat: city.lat,
              lon: city.lon,
              aqi,
              pm25,
              pm10: comp.pm10  ?? 0,
              no2:  (comp.no2  ?? 0) / 1.912,
              so2:  (comp.so2  ?? 0) / 2.663,
              co:   (comp.co   ?? 0) / 1145.45,
              o3:   (comp.o3   ?? 0) / 1.9957,
              status: getAQIStatus(aqi),
              color:  getAQIColor(aqi),
              pressure:  weatherData.main?.pressure  ?? 0,
              humidity:  weatherData.main?.humidity  ?? 0,
              temp:      Math.round(weatherData.main?.temp ?? 0),
              windSpeed: Math.round((weatherData.wind?.speed ?? 0) * 3.6),
              dominantPollutant: pm25 > 0 ? "PM2.5" : "N/A",
            };
          } catch (error) {
            console.error(`Error fetching data for ${city.name}:`, error);
          }
          return null;
        });

        const results = await Promise.all(promises);
        const validResults = results.filter((r): r is AirQualityData => r !== null);
        setAirQualityData(validResults);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching air quality data:", error);
        setLoading(false);
      }
    };

    fetchAirQuality();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchAirQuality, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [openWeatherKey]);

  const handleLocationClick = async (lat: number, lon: number) => {
    try {
      setLoading(true);
      
      // Get location name from reverse geocoding
      const geoResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${openWeatherKey}`
      );
      const geoData = await geoResponse.json();
      
      // Get air quality + weather in parallel
      const [apRes, weatherResponse] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${openWeatherKey}`),
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeatherKey}&units=metric`),
      ]);
      const [apData, weatherData] = await Promise.all([apRes.json(), weatherResponse.json()]);

      const comp = apData?.list?.[0]?.components ?? {};
      const pm25 = comp.pm2_5 ?? 0;

      const address = geoData.length > 0
        ? `${geoData[0].name}, ${geoData[0].country}`
        : `${lat.toFixed(4)}, ${lon.toFixed(4)}`;

      const countryCode = geoData.length > 0 ? geoData[0].country : "";
      const aqi = pm25toAQI(pm25);

      // Notify parent component about location selection
      if (onLocationSelect) {
        onLocationSelect({
          lat,
          lon,
          name: address
        });
      }

      setLocationReport({
        lat,
        lon,
        address,
        countryCode,
        aqi,
        status: getAQIStatus(aqi),
        color: getAQIColor(aqi),
        weather: weatherData,
        timestamp: new Date().toLocaleString(),
      });
      setShowReport(true);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching location data:", error);
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden border border-white/10">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: "100%", width: "100%", background: "#0a0f1e" }}
        className="z-0"
      >
        <TileLayer
          attribution={mapLayers[mapLayer].attribution}
          url={mapLayers[mapLayer].url}
        />
        
        <MapClickHandler onLocationClick={handleLocationClick} />
        {searchLocation && <MapCenterUpdater searchLocation={searchLocation} />}

        {airQualityData.map((location, index) => (
          <Marker
            key={index}
            position={[location.lat, location.lon]}
            icon={createCustomIcon(location.color)}
          >
            <Popup>
              <div className="text-black p-3 min-w-[250px]">
                <h3 className="font-bold text-xl mb-3 border-b pb-2">{location.city}</h3>
                
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">AQI:</span>
                    <span 
                      className="text-2xl font-bold px-3 py-1 rounded"
                      style={{ color: location.color, backgroundColor: `${location.color}20` }}
                    >
                      {location.aqi}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Status: <strong>{location.status}</strong></p>
                  <p className="text-xs text-gray-500 mt-1">Dominant: {location.dominantPollutant}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                  <div>
                    <p className="text-gray-600">PM2.5</p>
                    <p className="font-bold">{location.pm25.toFixed(1)} µg/m³</p>
                  </div>
                  <div>
                    <p className="text-gray-600">PM10</p>
                    <p className="font-bold">{location.pm10.toFixed(1)} µg/m³</p>
                  </div>
                  <div>
                    <p className="text-gray-600">NO₂</p>
                    <p className="font-bold">{location.no2.toFixed(1)} ppb</p>
                  </div>
                  <div>
                    <p className="text-gray-600">O₃</p>
                    <p className="font-bold">{location.o3.toFixed(1)} ppb</p>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-xs text-gray-600 mb-2">Weather Conditions:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-500">Temperature</p>
                      <p className="font-bold">{location.temp}°C</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Humidity</p>
                      <p className="font-bold">{location.humidity}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Wind</p>
                      <p className="font-bold">{location.windSpeed} km/h</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Pressure</p>
                      <p className="font-bold">{location.pressure} hPa</p>
                    </div>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Layer Switcher */}
      <div className="absolute top-4 left-4 bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg p-3 z-10">
        <p className="text-xs font-semibold text-white mb-2">Map Layer</p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setMapLayer("street")}
            className={`px-3 py-2 rounded text-xs font-medium transition-all ${
              mapLayer === "street"
                ? "bg-cyan-500 text-white"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
          >
            🗺️ Street
          </button>
          <button
            onClick={() => setMapLayer("satellite")}
            className={`px-3 py-2 rounded text-xs font-medium transition-all ${
              mapLayer === "satellite"
                ? "bg-cyan-500 text-white"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
          >
            🛰️ Satellite
          </button>
          <button
            onClick={() => setMapLayer("terrain")}
            className={`px-3 py-2 rounded text-xs font-medium transition-all ${
              mapLayer === "terrain"
                ? "bg-cyan-500 text-white"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
          >
            ⛰️ Terrain
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg p-3 z-10">
        <p className="text-xs font-semibold text-white/90 mb-2">Air Quality Index</p>
        <div className="space-y-1">
          {[
            { label: "Good", color: "#00e400", range: "0-50" },
            { label: "Moderate", color: "#ffff00", range: "51-100" },
            { label: "Unhealthy", color: "#ff7e00", range: "101-150" },
            { label: "Very Unhealthy", color: "#ff0000", range: "151-200" },
            { label: "Hazardous", color: "#7e0023", range: "201+" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-xs text-white/70">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span>{item.label}</span>
              <span className="text-white/40">({item.range})</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-white/40 mt-2">💡 Click anywhere on map for detailed report</p>
      </div>

      {/* Live indicator */}
      <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-sm border border-green-500/30 rounded-lg px-3 py-2 z-10 flex items-center gap-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-xs text-white/90 font-medium">Live Data</span>
      </div>

      {/* Location Report Modal */}
      {showReport && locationReport && (() => {
        const flag = locationReport.countryCode
          ? String.fromCodePoint(...[...locationReport.countryCode.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65))
          : "";
        return (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm z-20 flex items-center justify-center p-4">
            <div className="bg-[#0f1f14] border border-emerald-800/50 rounded-2xl p-4 w-full max-w-xs shadow-2xl shadow-black/60">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {flag && <span className="text-2xl leading-none">{flag}</span>}
                  <div>
                    <h3 className="text-sm font-bold text-emerald-50" style={{fontFamily:'Space Grotesk'}}>{locationReport.address}</h3>
                    <p className="text-[10px] text-slate-500">{locationReport.timestamp}</p>
                  </div>
                </div>
                <button onClick={() => setShowReport(false)} className="text-slate-500 hover:text-slate-200 text-xl leading-none ml-2">×</button>
              </div>

              {/* AQI Row */}
              <div className="flex items-center gap-3 bg-black/30 border border-emerald-900/40 rounded-xl px-3 py-2 mb-3">
                <span
                  className="text-3xl font-bold px-3 py-1 rounded-lg"
                  style={{ color: locationReport.color, backgroundColor: `${locationReport.color}22` }}
                >
                  {locationReport.aqi}
                </span>
                <div>
                  <p className="text-xs font-semibold text-emerald-100">{locationReport.status}</p>
                  <p className="text-[10px] text-slate-500">Air Quality Index</p>
                </div>
              </div>

              {/* Weather Grid */}
              {locationReport.weather?.main && (
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { label: "Temp", value: `${Math.round(locationReport.weather.main.temp)}°C` },
                    { label: "Humidity", value: `${locationReport.weather.main.humidity}%` },
                    { label: "Wind", value: `${Math.round(locationReport.weather.wind.speed * 3.6)} km/h` },
                    { label: "Pressure", value: `${locationReport.weather.main.pressure} hPa` },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-black/30 border border-emerald-900/40 rounded-lg px-3 py-2">
                      <p className="text-[10px] text-slate-500">{label}</p>
                      <p className="text-sm font-bold text-emerald-100">{value}</p>
                    </div>
                  ))}
                  {locationReport.weather.weather?.[0]?.description && (
                    <div className="col-span-2 text-[10px] text-slate-400 capitalize px-1">
                      {locationReport.weather.weather[0].description}
                    </div>
                  )}
                </div>
              )}

              {/* Coords */}
              <p className="text-[10px] text-slate-600 mb-3">
                📍 {locationReport.lat.toFixed(4)}, {locationReport.lon.toFixed(4)}
              </p>

              <button
                onClick={() => setShowReport(false)}
                className="w-full bg-emerald-800/60 hover:bg-emerald-700/70 border border-emerald-700/50 text-emerald-200 py-2 rounded-lg text-sm font-semibold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        );
      })()}

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-3"></div>
            <p className="text-white/70 text-sm">Loading data...</p>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.2);
              opacity: 0.8;
            }
          }
        `}
      </style>
    </div>
  );
}
