// src/components/FireDisasterTracker.tsx
import { useState, useEffect } from 'react';

interface FireHotspot {
  latitude: number;
  longitude: number;
  brightness: number;
  country: string;
  confidence: number;
  date: string;
  acq_time: string;
  daynight: string;
}

const FireIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
    <path d="M24 8c0 0-4 6-4 10 0 3.3 1.8 6 4 6s4-2.7 4-6c0-4-4-10-4-10z" fill="currentColor" opacity="0.7"/>
    <circle cx="24" cy="30" r="12" strokeWidth="2" opacity="0.5"/>
    <path d="M24 12 L26 20 L24 24 L22 20 Z" fill="currentColor" opacity="0.9"/>
  </svg>
);

export default function FireDisasterTracker() {
  const [fires, setFires] = useState<FireHotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalBrightness, setTotalBrightness] = useState(0);

  useEffect(() => {
    fetchFireData();
    // Refresh every 6 hours
    const interval = setInterval(fetchFireData, 6 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchFireData = async () => {
    try {
      setLoading(true);
      // Using publicly available NASA FIRMS data (no API key needed for basic access)
      const response = await fetch(
        'https://firms.modaps.eosdis.nasa.gov/api/country/csv/VIIRS_SNPP_NRT/World/1'
      );
      
      if (!response.ok) throw new Error('Failed to fetch fire data');
      
      const text = await response.text();
      const lines = text.split('\n').slice(1); // Skip header
      
      const fireData: FireHotspot[] = lines
        .filter(line => line.trim())
        .slice(0, 20) // Limit to 20 most recent
        .map(line => {
          const cols = line.split(',');
          return {
            latitude: parseFloat(cols[0]),
            longitude: parseFloat(cols[1]),
            brightness: parseFloat(cols[2]),
            country: cols[11] || 'Unknown',
            confidence: parseFloat(cols[8]) || 0,
            date: cols[5] || '',
            acq_time: cols[6] || '',
            daynight: cols[14] || '',
          };
        });

      setFires(fireData);
      setTotalBrightness(fireData.reduce((sum, f) => sum + f.brightness, 0));
      setError('');
    } catch (err) {
      setError('Unable to fetch fire data from NASA');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-400/10 border border-red-400/30 text-red-400 text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400"></span>
            </span>
            NASA FIRMS Active Fires
          </div>

          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Global <span className="text-red-400">Fire & Disaster</span> Monitoring
          </h2>
          <p className="text-lg text-white/70">
            Real-time fire hotspot detection from NASA's VIIRS satellite. Last 24 hours data.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="rounded-xl bg-gradient-to-br from-red-900/20 to-orange-900/20 border border-red-700/30 p-6">
            <p className="text-red-400/70 text-sm font-medium mb-2">Active Fire Hotspots</p>
            <p className="text-3xl font-bold text-red-300">{fires.length}</p>
            <p className="text-xs text-white/40 mt-2">In last 24 hours</p>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-orange-900/20 to-yellow-900/20 border border-orange-700/30 p-6">
            <p className="text-orange-400/70 text-sm font-medium mb-2">Avg Brightness</p>
            <p className="text-3xl font-bold text-orange-300">
              {fires.length > 0 ? (totalBrightness / fires.length).toFixed(0) : 0}K
            </p>
            <p className="text-xs text-white/40 mt-2">Kelvin temperature</p>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-yellow-900/20 to-amber-900/20 border border-yellow-700/30 p-6">
            <p className="text-yellow-400/70 text-sm font-medium mb-2">Total Heat Detected</p>
            <p className="text-3xl font-bold text-yellow-300">{totalBrightness.toFixed(0)}</p>
            <p className="text-xs text-white/40 mt-2">Cumulative K</p>
          </div>
        </div>

        {/* Fire List */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white mb-6">Recent Fire Detections</h3>
          
          {loading && (
            <div className="text-center py-12 text-white/50">
              <div className="animate-spin w-8 h-8 border-2 border-red-400 border-t-transparent rounded-full mx-auto mb-4"></div>
              Loading NASA FIRMS data...
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          {fires.length === 0 && !loading && (
            <div className="text-center py-12 text-white/50">
              No active fires detected in the last 24 hours
            </div>
          )}

          {fires.map((fire, idx) => (
            <div
              key={idx}
              className="rounded-lg bg-black/30 border border-red-700/30 p-4 hover:border-red-600/60 transition-all hover:bg-red-900/10"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0 text-red-400">
                    <FireIcon />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-white">{fire.country}</p>
                      <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-300">
                        {fire.daynight === 'N' ? 'Night' : 'Day'}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300">
                        {fire.confidence.toFixed(0)}% confidence
                      </span>
                    </div>
                    <p className="text-sm text-white/60">
                      Lat: {fire.latitude.toFixed(3)}° | Lon: {fire.longitude.toFixed(3)}°
                    </p>
                    <p className="text-xs text-white/40 mt-1">
                      {fire.date} {fire.acq_time}
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-red-400">{fire.brightness.toFixed(0)}K</p>
                  <p className="text-xs text-white/40">Brightness</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-12 p-6 rounded-lg border border-white/10 bg-white/5 backdrop-blur">
          <p className="text-sm text-white/70">
            <strong>Data Source:</strong> NASA's VIIRS (Visible Infrared Imaging Radiometer Suite) satellite detects active fires based on thermal infrared signatures. 
            The FIRMS system processes data in near real-time (NRT) to identify hotspots across the globe. High brightness values indicate intense fires.
          </p>
        </div>
      </div>
    </section>
  );
}
