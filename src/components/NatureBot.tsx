// src/components/NatureBot.tsx
import { useState, useEffect, useRef } from 'react';

interface LocationData {
  lat: number;
  lon: number;
  name?: string;
}

interface AQIData {
  aqi: number;
  city: string;
  dominentpol?: string;
  iaqi?: Record<string, { v: number }>;
  time?: { s: string };
  forecast?: unknown;
}

interface Message {
  role: 'bot' | 'user';
  text: string;
  ts: number;
}

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const WAQI_TOKEN = import.meta.env.VITE_WAQI_TOKEN;
const NATURE_FONT = "'Playfair Display', Georgia, serif";

/* ─── AQI colour helper ───────────────────────────────────── */
function aqiColor(aqi: number) {
  if (aqi <= 50)  return { bg: '#166534', ring: '#4ade80', label: 'Good',        emoji: '🌿' };
  if (aqi <= 100) return { bg: '#713f12', ring: '#facc15', label: 'Moderate',    emoji: '🍂' };
  if (aqi <= 150) return { bg: '#7c2d12', ring: '#fb923c', label: 'Unhealthy*',  emoji: '🌫️' };
  if (aqi <= 200) return { bg: '#7f1d1d', ring: '#f87171', label: 'Unhealthy',   emoji: '⚠️' };
  if (aqi <= 300) return { bg: '#581c87', ring: '#c084fc', label: 'Very Unhealthy', emoji: '☣️' };
  return             { bg: '#3f0017', ring: '#f43f5e', label: 'Hazardous',       emoji: '💀' };
}

/* ─── Call Gemini ─────────────────────────────────────────── */
async function askGemini(messages: { role: string; parts: { text: string }[] }[]): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: messages,
        systemInstruction: {
          parts: [{
            text: `You are Terra — an ancient, wise nature spirit who has watched over Earth's skies for millennia. 
You speak warmly, poetically yet clearly, as if you are the voice of the forest and sky. 
You deeply care about human health and the planet.
You respond in 3–5 short paragraphs using nature metaphors where natural (e.g. "the air carries a burden today…").
You always end with a crisp, clear health recommendation list (bullet points):
• Should they go outside? 
• Should they wear a mask?
• Safe for children / elderly?
• Best time of day to go out?
• Any special precautions?
Keep total response under 250 words. Be empathetic and caring.`
          }]
        },
        generationConfig: { temperature: 0.85, maxOutputTokens: 512 }
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'I could not read the winds. Please try again.';
}

/* ─── Fetch WAQI ──────────────────────────────────────────── */
async function fetchAQI(lat: number, lon: number): Promise<AQIData | null> {
  try {
    const res = await fetch(
      `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${WAQI_TOKEN}`
    );
    const json = await res.json();
    if (json.status === 'ok') {
      return {
        aqi: Number(json.data.aqi),
        city: json.data.city?.name ?? 'Unknown',
        dominentpol: json.data.dominentpol,
        iaqi: json.data.iaqi,
      };
    }
  } catch (_) { /* ignore */ }
  return null;
}

/* ─── Build initial context prompt ───────────────────────── */
function buildContextPrompt(loc: LocationData, aqiData: AQIData | null): string {
  const locStr = loc.name ?? `${loc.lat.toFixed(3)}, ${loc.lon.toFixed(3)}`;
  if (!aqiData) {
    return `The human is asking about the air quality in ${locStr}. 
I could not retrieve live sensor data right now, but please give general advice based on the region and any historical knowledge you have about it.
Provide health predictions and whether they should venture outside today.`;
  }
  const { aqi, city, dominentpol, iaqi } = aqiData;
  const { label } = aqiColor(aqi);
  const pollutants = iaqi
    ? Object.entries(iaqi)
        .map(([k, v]) => `${k.toUpperCase()}: ${v.v}`)
        .join(', ')
    : 'data unavailable';

  return `Location: ${locStr} (sensor: ${city})
Current AQI: ${aqi} — ${label}
Dominant pollutant: ${dominentpol ?? 'unknown'}
Pollutant breakdown: ${pollutants}

Based on this real-time environmental data, give the person a warm, nature-spirited health assessment.
Tell them whether they should go outside today, any health risks, and what precautions to take.
Mention specific pollutants that concern you and what causes them in this region.`;
}

/* ─── Leaf decorations ────────────────────────────────────── */
function LeafDeco({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17 8C8 10 5.9 16.17 3.82 19.99 
               C5.24 19.4 6.82 18.5 8 17
               C9.17 15.5 10.5 13 17 8z
               M4.5 21.5C5.11 20.39 5.8 19.3 6.5 18.4
               C8 16.5 10 14.5 13 12
               C9.5 13.5 6.5 16 4.5 21.5z"/>
    </svg>
  );
}

/* ─── Typing dots ─────────────────────────────────────────── */
function TypingDots() {
  return (
    <div className="flex gap-1 items-center px-4 py-3">
      {[0, 1, 2].map(i => (
        <span key={i} className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────── */
export default function NatureBot({ selectedLocation }: { selectedLocation: LocationData | null }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      ts: Date.now(),
      text: 'Greetings, wanderer of the modern world. I am Terra — spirit of sky and soil. 🌿\n\nSelect a location on the map above, or search for your city, and I shall read the winds for you — telling you what the air holds, and whether today is a day to breathe freely or to tread carefully.',
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aqiData, setAQIData] = useState<AQIData | null>(null);
  const [currentLoc, setCurrentLoc] = useState<LocationData | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const chatHistoryRef = useRef<{ role: string; parts: { text: string }[] }[]>([]);

  /* auto-scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  /* when location changes — auto-fetch AQI + trigger bot */
  useEffect(() => {
    if (!selectedLocation) return;
    if (
      currentLoc &&
      Math.abs(currentLoc.lat - selectedLocation.lat) < 0.01 &&
      Math.abs(currentLoc.lon - selectedLocation.lon) < 0.01
    ) return;

    setCurrentLoc(selectedLocation);
    setLoading(true);
    chatHistoryRef.current = [];

    (async () => {
      const aqi = await fetchAQI(selectedLocation.lat, selectedLocation.lon);
      setAQIData(aqi);
      const prompt = buildContextPrompt(selectedLocation, aqi);
      const userMsg = { role: 'user', parts: [{ text: prompt }] };
      chatHistoryRef.current = [userMsg];

      try {
        const reply = await askGemini(chatHistoryRef.current);
        chatHistoryRef.current.push({ role: 'model', parts: [{ text: reply }] });
        setMessages(prev => [
          ...prev,
          {
            role: 'bot',
            ts: Date.now(),
            text: reply,
          }
        ]);
      } catch (e) {
        setMessages(prev => [...prev, {
          role: 'bot', ts: Date.now(),
          text: 'The winds are silent… I could not reach the data streams. Please check your connection.',
        }]);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedLocation]);

  /* user sends a message */
  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', ts: Date.now(), text: q }]);
    setLoading(true);

    chatHistoryRef.current.push({ role: 'user', parts: [{ text: q }] });

    try {
      const reply = await askGemini(chatHistoryRef.current);
      chatHistoryRef.current.push({ role: 'model', parts: [{ text: reply }] });
      setMessages(prev => [...prev, { role: 'bot', ts: Date.now(), text: reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'bot', ts: Date.now(),
        text: 'The forest whispers fell silent. Please try again.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const aqi = aqiData?.aqi ?? null;
  const aqiMeta = aqi !== null ? aqiColor(aqi) : null;

  return (
    <div className="rounded-2xl border border-emerald-800/40 overflow-hidden shadow-2xl shadow-black/40 backdrop-blur-md"
      style={{ background: 'linear-gradient(160deg, #071a0e 0%, #0a1f10 50%, #060f09 100%)' }}
    >
      {/* ── Header ── */}
      <div className="relative px-6 py-4 border-b border-emerald-900/50 overflow-hidden"
        style={{ background: 'linear-gradient(90deg, #052e16cc, #14532dcc)' }}>
        {/* bg leaves */}
        <LeafDeco className="absolute -left-2 -top-1 w-16 h-16 text-emerald-900/40 rotate-12" />
        <LeafDeco className="absolute right-4 top-0 w-12 h-12 text-emerald-900/30 -rotate-20 scale-x-[-1]" />

        <div className="relative flex items-center gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg"
              style={{ background: 'radial-gradient(circle, #166534, #052e16)', boxShadow: '0 0 16px #4ade8055' }}>
              🌿
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-black animate-pulse" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-emerald-100 leading-tight" style={{ fontFamily: NATURE_FONT }}>
              Terra · Nature Intelligence
            </h3>
            <p className="text-xs text-emerald-400/80">
              {selectedLocation
                ? `Reading atmosphere for ${selectedLocation.name ?? `${selectedLocation.lat.toFixed(2)}, ${selectedLocation.lon.toFixed(2)}`}`
                : 'Select a location to begin the reading'}
            </p>
          </div>

          {/* AQI badge */}
          {aqi !== null && aqiMeta && (
            <div className="shrink-0 flex flex-col items-center px-3 py-1.5 rounded-xl border"
              style={{ background: aqiMeta.bg + '99', borderColor: aqiMeta.ring + '66' }}>
              <span className="text-xs font-bold" style={{ color: aqiMeta.ring, fontFamily: 'Space Grotesk' }}>{aqi}</span>
              <span className="text-[10px]" style={{ color: aqiMeta.ring }}>{aqiMeta.label}</span>
              <span className="text-base">{aqiMeta.emoji}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Pollutant pills (when data loaded) ── */}
      {aqiData?.iaqi && (
        <div className="flex gap-2 px-4 py-2 overflow-x-auto border-b border-emerald-900/30 scrollbar-thin"
          style={{ background: '#040d06cc' }}>
          {Object.entries(aqiData.iaqi).slice(0, 7).map(([key, val]) => (
            <span key={key}
              className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium border border-emerald-800/40 text-emerald-300"
              style={{ background: '#052e1680', fontFamily: 'Space Grotesk' }}>
              {key.toUpperCase()} {val.v}
            </span>
          ))}
        </div>
      )}

      {/* ── Messages ── */}
      <div className="h-80 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin"
        style={{ scrollbarColor: '#166534 transparent' }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* avatar */}
            {msg.role === 'bot' && (
              <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-base"
                style={{ background: 'radial-gradient(circle, #166534, #052e16)' }}>
                🌿
              </div>
            )}

            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap
              ${msg.role === 'bot'
                ? 'rounded-tl-none bg-emerald-950/80 border border-emerald-800/30 text-emerald-100'
                : 'rounded-tr-none bg-emerald-800/30 border border-emerald-600/30 text-white'
              }`}
              style={{ fontFamily: NATURE_FONT, fontSize: 13 }}>
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-base"
              style={{ background: 'radial-gradient(circle, #166534, #052e16)' }}>
              🌿
            </div>
            <div className="rounded-2xl rounded-tl-none bg-emerald-950/80 border border-emerald-800/30">
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Quick prompts ── */}
      {selectedLocation && !loading && (
        <div className="flex gap-2 px-4 pb-2 overflow-x-auto scrollbar-thin">
          {[
            'Is it safe to exercise outside?',
            'Advice for children & elderly?',
            'What causes this pollution?',
            'Best time to go outside today?',
            'Will it get better tomorrow?',
          ].map(q => (
            <button key={q}
              onClick={() => { setInput(q); }}
              className="shrink-0 text-[11px] px-3 py-1.5 rounded-full border border-emerald-700/40 text-emerald-300 hover:bg-emerald-900/40 transition whitespace-nowrap"
              style={{ background: '#052e1650' }}>
              {q}
            </button>
          ))}
        </div>
      )}

      {/* ── Input ── */}
      <div className="px-4 py-3 border-t border-emerald-900/40 flex gap-3 items-end"
        style={{ background: '#040d06' }}>
        <textarea
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder={selectedLocation ? 'Ask Terra anything about your air…' : 'Select a location first…'}
          disabled={!selectedLocation || loading}
          className="flex-1 resize-none bg-emerald-950/50 border border-emerald-800/40 rounded-xl px-3 py-2.5 text-sm text-emerald-100 placeholder-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-600/60 transition disabled:opacity-40"
          style={{ fontFamily: NATURE_FONT, minHeight: 42, maxHeight: 120 }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading || !selectedLocation}
          className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #166534, #14532d)', boxShadow: '0 0 12px #4ade8030' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M22 2L11 13" /><path d="M22 2L15 22 11 13 2 9l20-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
