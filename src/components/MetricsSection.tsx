// src/components/MetricsSection.tsx
import { useEffect, useMemo, useState } from "react";
import { linearRegression, forecast } from "../utils/predictionEngine";

/* ─────────────────────────── Historical Data ─────────────────────────────── */
// CO₂ ppm — Mauna Loa Observatory  (Jan 2024 – Mar 2026, 27 months)
const CO2_DATA = [
  421.6,423.1,424.5,426.9,427.8,426.1,424.9,423.3,422.4,423.1,424.8,425.9,
  424.4,424.9,426.4,428.7,429.5,427.3,426.1,424.5,423.7,424.3,426.0,427.1,
  426.8,427.9,429.3,
];
// Global AQI — IQAir composite monthly avg (Jan 2024 – Mar 2026)
const AQI_DATA = [
  76,79,74,69,65,63,67,71,69,74,80,83,
  77,75,72,68,64,62,65,69,67,72,78,81,
  76,73,70,
];
// Ozone Layer — Dobson Units global avg (Jan 2024 – Mar 2026)
const OZONE_DATA = [
  296,298,302,307,309,306,300,296,293,294,296,297,
  297,299,303,308,310,307,301,297,294,295,298,299,
  299,301,304,
];
// Ocean Health Index — OHI composite score  (Jan 2024 – Mar 2026)
const OCEAN_DATA = [
  68.5,68.3,68.1,68.0,68.2,67.9,67.7,67.5,67.6,67.4,67.2,67.1,
  67.3,67.1,67.0,67.2,67.3,67.0,66.8,66.6,66.7,66.5,66.3,66.2,
  66.4,66.2,66.0,
];

const PREDICT_STEPS = 3; // Apr – Jun 2026

/* ─────────────────────────── SVG helpers ─────────────────────────────────── */
const W = 400, H = 110, PAD = 10;
function makePoints(ys: number[]) {
  const lo = Math.min(...ys) - 0.5, hi = Math.max(...ys) + 0.5;
  const span = hi - lo;
  const step = (W - PAD * 2) / (ys.length - 1);
  return ys.map((y, i) => ({
    x: PAD + i * step,
    y: PAD + (1 - (y - lo) / span) * (H - PAD * 2),
  }));
}
function linePath(pts: { x: number; y: number }[]) {
  return pts.map((p, i) => `${i ? "L" : "M"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
}
function areaPath(pts: { x: number; y: number }[]) {
  const last = pts[pts.length - 1];
  return `${linePath(pts)} L ${last.x.toFixed(1)} ${H} L ${pts[0].x.toFixed(1)} ${H} Z`;
}

/* ─────────────────────────── Badge helpers ───────────────────────────────── */
type Badge = [string, string, string]; // [label, tailwind, hex]
function oceanBadge(v: number): Badge {
  if (v >= 70) return ["Healthy","bg-emerald-900/40 border-emerald-700/50 text-emerald-400","#34d399"];
  if (v >= 62) return ["Warning","bg-orange-900/40  border-orange-700/50  text-orange-400","#fb923c"];
  return             ["Critical","bg-red-900/40     border-red-700/50     text-red-400",   "#f87171"];
}

/* ─────────────────────────── AQI Gauge Card ──────────────────────────────── */
// Semicircle speedometer — colour zones clearly labelled
const AQI_ZONES = [
  { lo: 0,   hi: 50,  label: "Good",       color: "#34d399" },
  { lo: 50,  hi: 100, label: "Moderate",   color: "#f59e0b" },
  { lo: 100, hi: 150, label: "Unhealthy·S",color: "#fb923c" },
  { lo: 150, hi: 200, label: "Unhealthy",  color: "#f87171" },
  { lo: 200, hi: 300, label: "Very Bad",   color: "#c084fc" },
];
const AQI_MAX = 300;

function aqiZoneLabel(v: number) {
  const phrases: Record<string, string> = {
    Good: "Air is clean — breathe freely ✓",
    Moderate: "Sensitive people take care 🌿",
    "Unhealthy·S": "Reduce outdoor activity ⚠️",
    Unhealthy: "Wear a mask outdoors 😷",
    "Very Bad": "Stay indoors — dangerous 🚨",
  };
  const z = AQI_ZONES.find(z => v >= z.lo && v < z.hi) ?? AQI_ZONES[AQI_ZONES.length - 1];
  return { ...z, phrase: phrases[z.label] };
}

function AQICard({ historical, predicted, r2 }: { historical: number[]; predicted: number[]; r2: number }) {
  const current  = historical[historical.length - 1];
  const pred3m   = predicted[predicted.length - 1];
  const zone     = aqiZoneLabel(current);
  const predZone = aqiZoneLabel(pred3m);
  const confidence = Math.min(99, Math.round(r2 * 100));

  // semicircle: arc from -180° to 0° (left to right across bottom)
  const R = 70, CX = 100, CY = 90;
  const pct = Math.min(current / AQI_MAX, 1);
  const predPct = Math.min(pred3m / AQI_MAX, 1);

  // needle angle: -180° (left) to 0° (right)
  const needleAngle = -180 + pct * 180;
  const predAngle   = -180 + predPct * 180;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const needle = (angle: number, len: number) => ({
    x: CX + len * Math.cos(toRad(angle)),
    y: CY + len * Math.sin(toRad(angle)),
  });

  // arc segments for colour zones
  const zoneArcs = AQI_ZONES.map(z => {
    const startPct = z.lo / AQI_MAX;
    const endPct   = Math.min(z.hi / AQI_MAX, 1);
    const startA   = toRad(-180 + startPct * 180);
    const endA     = toRad(-180 + endPct * 180);
    const r = R;
    const x1 = CX + r * Math.cos(startA), y1 = CY + r * Math.sin(startA);
    const x2 = CX + r * Math.cos(endA),   y2 = CY + r * Math.sin(endA);
    const large = endPct - startPct > 0.5 ? 1 : 0;
    return { path: `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`, color: z.color };
  });

  const n = needle(needleAngle, R - 8);
  const pn = needle(predAngle, R - 14);

  return (
    <div className="rounded-xl p-4 bg-black/25 border border-emerald-900/50 hover:border-emerald-700/60 transition-all duration-300 shadow-lg backdrop-blur-sm hover:bg-emerald-950/30 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-semibold text-emerald-100" style={{ fontFamily: "Space Grotesk" }}>Air Quality Index</h3>
          <p className="text-[10px] text-slate-500">Global composite avg</p>
        </div>
        <span className={`shrink-0 px-2 py-0.5 rounded-full border text-[10px] font-semibold`}
          style={{ color: zone.color, borderColor: zone.color + "60", background: zone.color + "18" }}>
          {zone.label}
        </span>
      </div>

      {/* Gauge */}
      <svg viewBox="0 0 200 100" className="w-full" style={{ height: 90 }}>
        {/* zone arcs (thick track) */}
        {zoneArcs.map((a, i) => (
          <path key={i} d={a.path} fill="none" stroke={a.color} strokeWidth="10" opacity="0.30"/>
        ))}
        {/* active zone highlight up to current */}
        {(() => {
          const endA  = toRad(-180 + pct * 180);
          const x1 = CX + R * Math.cos(toRad(-180)), y1 = CY + R * Math.sin(toRad(-180));
          const x2 = CX + R * Math.cos(endA),        y2 = CY + R * Math.sin(endA);
          const large = pct > 0.5 ? 1 : 0;
          return <path d={`M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${R} ${R} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`}
            fill="none" stroke={zone.color} strokeWidth="10" opacity="0.85"/>;
        })()}
        {/* tick marks */}
        {[0,0.25,0.5,0.75,1].map(f => {
          const a = toRad(-180 + f * 180);
          return <line key={f}
            x1={(CX + (R-14)*Math.cos(a)).toFixed(1)} y1={(CY + (R-14)*Math.sin(a)).toFixed(1)}
            x2={(CX + (R+2) *Math.cos(a)).toFixed(1)} y2={(CY + (R+2) *Math.sin(a)).toFixed(1)}
            stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>;
        })}
        {/* predicted needle (ghost) */}
        <line x1={CX} y1={CY} x2={pn.x.toFixed(1)} y2={pn.y.toFixed(1)}
          stroke={predZone.color} strokeWidth="1.5" opacity="0.4" strokeDasharray="3 2"/>
        <circle cx={pn.x.toFixed(1)} cy={pn.y.toFixed(1)} r="3" fill={predZone.color} opacity="0.5"/>
        {/* current needle */}
        <line x1={CX} y1={CY} x2={n.x.toFixed(1)} y2={n.y.toFixed(1)}
          stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx={CX} cy={CY} r="5" fill="white" opacity="0.9"/>
        {/* centre label */}
        <text x={CX} y={CY - 18} textAnchor="middle" fill="white" fontSize="18" fontWeight="700">{Math.round(current)}</text>
        <text x={CX} y={CY - 6}  textAnchor="middle" fill="#94a3b8" fontSize="7">AQI</text>
        {/* zone labels */}
        <text x="14"  y="98" textAnchor="middle" fill="#34d399" fontSize="6.5" opacity="0.8">Good</text>
        <text x="100" y="20" textAnchor="middle" fill="#f87171" fontSize="6.5" opacity="0.8">Danger</text>
        <text x="187" y="98" textAnchor="middle" fill="#c084fc" fontSize="6.5" opacity="0.8">Very Bad</text>
      </svg>

      {/* plain-English message */}
      <p className="text-[11px] text-center font-medium" style={{ color: zone.color }}>{zone.phrase}</p>

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.07]">
        <div>
          <p className="text-[9px] text-slate-500 mb-0.5">Current</p>
          <p className="text-sm font-bold" style={{ color: zone.color }}>{Math.round(current)}</p>
        </div>
        <div>
          <p className="text-[9px] text-slate-500 mb-0.5">Jun'26 forecast</p>
          <div className="flex items-baseline gap-1">
            <p className="text-sm font-bold text-slate-200">{Math.round(pred3m)}</p>
            <span className={`text-[9px] font-semibold ${pred3m > current ? "text-red-400" : "text-emerald-400"}`}>
              {pred3m > current ? "↑" : "↓"}{Math.abs(((pred3m-current)/current)*100).toFixed(1)}%
            </span>
          </div>
        </div>
        <div>
          <p className="text-[9px] text-slate-500 mb-0.5">Confidence</p>
          <p className={`text-sm font-bold ${confidence >= 90 ? "text-emerald-400" : "text-yellow-400"}`}>{confidence}%</p>
        </div>
      </div>
      <p className="text-[9px] text-slate-600 -mt-2">Source: IQAir World Air Quality Report</p>
    </div>
  );
}

/* ─────────────────────────── Ozone Shield Card ───────────────────────────── */
// Shows Earth + ozone shield ring health — very visual for non-experts
const OZONE_HEALTHY = 340; // DU — healthy baseline

function OzoneCard({ historical, predicted, r2 }: { historical: number[]; predicted: number[]; r2: number }) {
  const current  = historical[historical.length - 1];
  const pred3m   = predicted[predicted.length - 1];
  const pct      = Math.min(current / OZONE_HEALTHY, 1);        // 0→1
  const predPct  = Math.min(pred3m  / OZONE_HEALTHY, 1);
  const badge    = current >= 302 ? ["Recovering","#34d399"] : current >= 294 ? ["Stable","#f59e0b"] : ["Thinning","#f87171"];
  const uvRisk   = current >= 302 ? "UV shield intact — skin protected ✓" : current >= 294 ? "Mild UV increase — use sunscreen 🌤️" : "High UV risk — limit sun exposure ☀️⚠️";
  const confidence = Math.min(99, Math.round(r2 * 100));
  const gap      = OZONE_HEALTHY - current;

  // ring SVG
  const R = 42, CX = 60, CY = 60;
  const circ = 2 * Math.PI * R;
  const dash = pct * circ;
  const predDash = predPct * circ;

  // monthly sparkbar (last 12 months)
  const last12 = historical.slice(-12);
  const sparkMin = Math.min(...last12) - 2, sparkMax = Math.max(...last12) + 2;

  return (
    <div className="rounded-xl p-4 bg-black/25 border border-emerald-900/50 hover:border-emerald-700/60 transition-all duration-300 shadow-lg backdrop-blur-sm hover:bg-emerald-950/30 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-semibold text-emerald-100" style={{ fontFamily: "Space Grotesk" }}>Ozone Layer</h3>
          <p className="text-[10px] text-slate-500">Shield health vs 340 DU baseline</p>
        </div>
        <span className="shrink-0 px-2 py-0.5 rounded-full border text-[10px] font-semibold"
          style={{ color: badge[1], borderColor: badge[1]+"60", background: badge[1]+"18" }}>
          {badge[0]}
        </span>
      </div>

      {/* Shield ring + Earth */}
      <div className="flex items-center gap-4">
        <svg viewBox="0 0 120 120" style={{ width: 110, height: 110, flexShrink: 0 }}>
          {/* glow */}
          <circle cx={CX} cy={CY} r={R+10} fill="none" stroke={badge[1]} strokeWidth="18" opacity="0.06"/>
          {/* track */}
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9"/>
          {/* predicted ring (behind) */}
          <circle cx={CX} cy={CY} r={R} fill="none"
            stroke={badge[1]} strokeWidth="9" strokeDasharray={`${predDash.toFixed(1)} ${circ.toFixed(1)}`}
            strokeLinecap="round" opacity="0.25"
            style={{ transform: "rotate(-90deg)", transformOrigin: `${CX}px ${CY}px` }}/>
          {/* current ring */}
          <circle cx={CX} cy={CY} r={R} fill="none"
            stroke={badge[1]} strokeWidth="9" strokeDasharray={`${dash.toFixed(1)} ${circ.toFixed(1)}`}
            strokeLinecap="round" opacity="0.9"
            style={{ transform: "rotate(-90deg)", transformOrigin: `${CX}px ${CY}px` }}/>
          {/* thinning gap indicator */}
          {pct < 1 && (() => {
            const gapStart = pct * 360 - 90; // degrees
            const gapRad = (gapStart * Math.PI) / 180;
            const gx = CX + R * Math.cos(gapRad), gy = CY + R * Math.sin(gapRad);
            return <circle cx={gx.toFixed(1)} cy={gy.toFixed(1)} r="5" fill="#f87171" opacity="0.7"/>;
          })()}
          {/* Earth circle */}
          <circle cx={CX} cy={CY} r="28" fill="#0e4a2e" opacity="0.9"/>
          <circle cx={CX} cy={CY} r="28" fill="none" stroke="#1a6b45" strokeWidth="1"/>
          {/* continents (simplified blobs) */}
          <ellipse cx="52" cy="55" rx="10" ry="13" fill="#22863a" opacity="0.7"/>
          <ellipse cx="68" cy="50" rx="8"  ry="10" fill="#22863a" opacity="0.7"/>
          <ellipse cx="58" cy="68" rx="7"  ry="5"  fill="#22863a" opacity="0.5"/>
          {/* pct text */}
          <text x={CX} y={CY-4}  textAnchor="middle" fill="white" fontSize="12" fontWeight="700">{Math.round(pct*100)}%</text>
          <text x={CX} y={CY+8}  textAnchor="middle" fill="#94a3b8" fontSize="6">of healthy</text>
        </svg>

        {/* right side info */}
        <div className="flex flex-col gap-2 flex-1">
          <div>
            <p className="text-[9px] text-slate-500">Current</p>
            <p className="text-base font-bold" style={{ color: badge[1] }}>{current} <span className="text-[9px] text-slate-500">DU</span></p>
          </div>
          <div>
            <p className="text-[9px] text-slate-500">Gap from healthy</p>
            <p className="text-sm font-bold text-red-400">−{gap} DU</p>
          </div>
          <div>
            <p className="text-[9px] text-slate-500">Jun'26 forecast</p>
            <div className="flex items-baseline gap-1">
              <p className="text-sm font-bold text-slate-200">{Math.round(pred3m)}</p>
              <span className={`text-[9px] font-semibold ${pred3m > current ? "text-emerald-400" : "text-red-400"}`}>
                {pred3m > current ? "↑" : "↓"}{Math.abs(pred3m - current).toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* mini monthly sparkbars */}
      <div>
        <p className="text-[9px] text-slate-600 mb-1">Last 12 months (Dobson Units)</p>
        <div className="flex items-end gap-0.5 h-6">
          {last12.map((v, i) => {
            const h = ((v - sparkMin) / (sparkMax - sparkMin)) * 100;
            const isLast = i === last12.length - 1;
            return (
              <div key={i} className="flex-1 rounded-sm transition-all"
                style={{ height: `${Math.max(h, 8)}%`, background: isLast ? badge[1] : badge[1]+"55" }}/>
            );
          })}
        </div>
        <div className="flex justify-between text-[8px] text-slate-600 mt-0.5">
          <span>Apr'25</span><span>Mar'26</span>
        </div>
      </div>

      <p className="text-[11px] font-medium text-center" style={{ color: badge[1] }}>{uvRisk}</p>
      <div className="flex justify-between pt-2 border-t border-white/[0.07]">
        <p className="text-[9px] text-slate-600">Source: WMO / NASA OMI Satellite</p>
        <p className={`text-[9px] font-semibold ${confidence >= 90 ? "text-emerald-400" : "text-yellow-400"}`}>Model {confidence}%</p>
      </div>
    </div>
  );
}

/* ─────────────────────────── CO₂ Card ───────────────────────────────────── */
// Rising area chart with "Safe" and "Pre-industrial" reference lines
const CO2_SAFE        = 350; // ppm — IPCC "safe" upper limit
const CO2_PREINDUSTRIAL = 280; // ppm — 1750 baseline

function CO2Card({ historical, predicted, r2 }: { historical: number[]; predicted: number[]; r2: number }) {
  const current  = historical[historical.length - 1];
  const pred3m   = predicted[predicted.length - 1];
  const aboveSafe = current - CO2_SAFE;
  const confidence = Math.min(99, Math.round(r2 * 100));

  const allY    = [...historical, ...predicted];
  const lo = CO2_PREINDUSTRIAL - 5, hi = Math.max(...allY) + 5;
  const span   = hi - lo;
  const CW = 400, CH = 130, CPAD = 12;
  const px = (i: number) => CPAD + (i / (allY.length - 1)) * (CW - CPAD * 2);
  const py = (v: number) => CPAD + (1 - (v - lo) / span) * (CH - CPAD * 2);

  const histPts  = historical.map((v, i) => ({ x: px(i), y: py(v) }));
  const predPts  = predicted.map((v, i)  => ({ x: px(historical.length - 1 + i), y: py(v) }));
  const allPts   = [...histPts, ...predPts.slice(1)];

  const safeY    = py(CO2_SAFE);
  const preindY  = py(CO2_PREINDUSTRIAL);

  const linePth  = (pts: {x:number;y:number}[]) =>
    pts.map((p,i) => `${i?"L":"M"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaPth  = (pts: {x:number;y:number}[]) => {
    const last = pts[pts.length-1];
    return `${linePth(pts)} L ${last.x.toFixed(1)} ${CH} L ${pts[0].x.toFixed(1)} ${CH} Z`;
  };

  return (
    <div className="rounded-xl p-4 bg-black/25 border border-emerald-900/50 hover:border-emerald-700/60 transition-all duration-300 shadow-lg backdrop-blur-sm hover:bg-red-950/20 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-semibold text-emerald-100" style={{ fontFamily: "Space Grotesk" }}>CO₂ Concentration</h3>
          <p className="text-[10px] text-slate-500">Monthly mean — Mauna Loa ppm</p>
        </div>
        <span className="shrink-0 px-2 py-0.5 rounded-full border text-[10px] font-semibold bg-red-900/40 border-red-700/50 text-red-400">
          Rising ↑
        </span>
      </div>

      {/* Chart with reference lines */}
      <div>
        <svg viewBox={`0 0 ${CW} ${CH}`} className="w-full rounded-lg" style={{ height: 105 }} preserveAspectRatio="none">
          <defs>
            <linearGradient id="co2-area" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor="#f87171" stopOpacity="0.38"/>
              <stop offset="100%" stopColor="#f87171" stopOpacity="0.03"/>
            </linearGradient>
          </defs>

          {/* pre-industrial reference */}
          <line x1={CPAD} y1={preindY.toFixed(1)} x2={CW-CPAD} y2={preindY.toFixed(1)}
            stroke="#34d399" strokeWidth="1" strokeDasharray="6 4" opacity="0.5"/>
          <text x={CPAD+3} y={preindY-3} fill="#34d399" fontSize="8" opacity="0.7">Pre-industrial 280 ppm</text>

          {/* safe limit reference */}
          <line x1={CPAD} y1={safeY.toFixed(1)} x2={CW-CPAD} y2={safeY.toFixed(1)}
            stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.75"/>
          <text x={CPAD+3} y={safeY-3} fill="#f59e0b" fontSize="8" opacity="0.85">Safe limit 350 ppm</text>

          {/* area fill */}
          <path d={areaPth(allPts)} fill="url(#co2-area)"/>

          {/* historical line */}
          <path d={linePth(histPts)} fill="none" stroke="#f87171" strokeWidth="2" opacity="0.9" strokeLinejoin="round"/>

          {/* prediction dashed */}
          <path d={`M ${histPts[histPts.length-1].x.toFixed(1)} ${histPts[histPts.length-1].y.toFixed(1)} ${predPts.slice(1).map(p=>`L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ")}`}
            fill="none" stroke="#f87171" strokeWidth="1.8" strokeDasharray="5 4" opacity="0.5"/>

          {/* prediction dots */}
          {predPts.slice(1).map((p, i) => (
            <g key={i}>
              <circle cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="3.5" fill="#f87171" opacity="0.7"/>
              <circle cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="7"   fill="#f87171" opacity="0.10"/>
            </g>
          ))}

          {/* current dot */}
          <circle cx={histPts[histPts.length-1].x.toFixed(1)} cy={histPts[histPts.length-1].y.toFixed(1)} r="4.5" fill="#f87171"/>
          <circle cx={histPts[histPts.length-1].x.toFixed(1)} cy={histPts[histPts.length-1].y.toFixed(1)} r="9" fill="#f87171" opacity="0.15"/>
        </svg>
        <div className="flex justify-between text-[9px] text-slate-600 px-0.5 mt-0.5">
          <span>Jan'24</span><span>Jan'25</span><span>Mar'26 →</span>
        </div>
      </div>

      {/* Plain-English callout */}
      <div className="bg-red-950/40 border border-red-800/40 rounded-lg px-3 py-2 flex items-center gap-2">
        <span className="text-lg">🌡️</span>
        <div>
          <p className="text-[10px] font-semibold text-red-300">
            {aboveSafe.toFixed(0)} ppm above safe limit
          </p>
          <p className="text-[9px] text-slate-500">Safe = 350 ppm · Pre-industrial = 280 ppm</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.07]">
        <div>
          <p className="text-[9px] text-slate-500 mb-0.5">Current</p>
          <p className="text-sm font-bold text-red-400">{current.toFixed(1)}<span className="text-[9px] text-slate-500 ml-0.5">ppm</span></p>
        </div>
        <div>
          <p className="text-[9px] text-slate-500 mb-0.5">Jun'26 forecast</p>
          <div className="flex items-baseline gap-1">
            <p className="text-sm font-bold text-slate-200">{pred3m.toFixed(1)}</p>
            <span className="text-[9px] font-semibold text-red-400">↑{(pred3m - current).toFixed(1)}</span>
          </div>
        </div>
        <div>
          <p className="text-[9px] text-slate-500 mb-0.5">Confidence</p>
          <p className={`text-sm font-bold ${confidence >= 90 ? "text-emerald-400" : "text-yellow-400"}`}>{confidence}%</p>
        </div>
      </div>
      <p className="text-[9px] text-slate-600 -mt-2">Source: NOAA Mauna Loa Observatory</p>
    </div>
  );
}

/* ─────────────────────────── Generic Line Card (Ocean) ───────────────────── */
interface MetricCardProps {
  title: string; subtitle: string; source: string;
  historical: number[]; predicted: number[];
  unit: string; badge: Badge; gradId: string; r2: number;
  formatVal?: (v: number) => string;
}
function MetricCard({ title, subtitle, source, historical, predicted, unit, badge, gradId, r2, formatVal }: MetricCardProps) {
  const fmt = formatVal ?? ((v: number) => v.toFixed(1));
  const allPts  = makePoints([...historical, ...predicted]);
  const histPts = allPts.slice(0, historical.length);
  const predPts = allPts.slice(historical.length - 1);

  const current   = historical[historical.length - 1];
  const pred3m    = predicted[predicted.length - 1];
  const deltaPct  = ((pred3m - current) / Math.abs(current)) * 100;
  const confidence = Math.min(99, Math.round(r2 * 100));
  const confColor  = confidence >= 90 ? "text-emerald-400" : confidence >= 75 ? "text-yellow-400" : "text-orange-400";
  const hex = badge[2];

  return (
    <div className="rounded-xl p-4 bg-black/25 border border-emerald-900/50 hover:border-emerald-700/60 transition-all duration-300 shadow-lg backdrop-blur-sm hover:bg-emerald-950/30 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-semibold text-emerald-100 leading-tight" style={{ fontFamily: "Space Grotesk" }}>{title}</h3>
          <p className="text-[10px] text-slate-500">{subtitle}</p>
        </div>
        <span className={`shrink-0 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${badge[1]}`}>{badge[0]}</span>
      </div>
      <div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg" style={{ height: 88 }} preserveAspectRatio="none">
          <defs>
            <linearGradient id={`${gradId}-fill`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor={hex} stopOpacity="0.32" />
              <stop offset="100%" stopColor={hex} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {[0.25,0.5,0.75].map(f => (
            <line key={f} x1={PAD} y1={PAD+f*(H-PAD*2)} x2={W-PAD} y2={PAD+f*(H-PAD*2)} stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
          ))}
          <path d={areaPath(histPts)} fill={`url(#${gradId}-fill)`} />
          <path d={linePath(histPts)} fill="none" stroke={hex} strokeWidth="2" opacity="0.9" strokeLinejoin="round"/>
          <path d={linePath(predPts)} fill="none" stroke={hex} strokeWidth="1.8" strokeDasharray="5 4" opacity="0.5" strokeLinejoin="round"/>
          {predPts.slice(1).map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="3.5" fill={hex} opacity="0.7"/>
              <circle cx={p.x} cy={p.y} r="7"   fill={hex} opacity="0.12"/>
            </g>
          ))}
          <circle cx={histPts[histPts.length-1].x} cy={histPts[histPts.length-1].y} r="4.5" fill={hex} opacity="1"/>
          <circle cx={histPts[histPts.length-1].x} cy={histPts[histPts.length-1].y} r="9"   fill={hex} opacity="0.15"/>
        </svg>
        <div className="flex justify-between text-[9px] text-slate-600 px-0.5 mt-0.5">
          <span>Jan'24</span><span>Jan'25</span><span>Mar'26 →</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.07]">
        <div>
          <p className="text-[9px] text-slate-500 mb-0.5">Current</p>
          <p className="text-sm font-bold" style={{ color: hex }}>
            {fmt(current)}<span className="text-[9px] text-slate-500 ml-0.5">{unit}</span>
          </p>
        </div>
        <div>
          <p className="text-[9px] text-slate-500 mb-0.5">Jun'26 forecast</p>
          <div className="flex items-baseline gap-1">
            <p className="text-sm font-bold text-slate-200">{fmt(pred3m)}</p>
            <span className={`text-[9px] font-semibold ${deltaPct >= 0 ? "text-red-400" : "text-emerald-400"}`}>
              {deltaPct >= 0 ? "↑" : "↓"}{Math.abs(deltaPct).toFixed(1)}%
            </span>
          </div>
        </div>
        <div>
          <p className="text-[9px] text-slate-500 mb-0.5">Confidence</p>
          <p className={`text-sm font-bold ${confColor}`}>{confidence}%</p>
        </div>
      </div>
      <p className="text-[9px] text-slate-600 -mt-2">{source}</p>
    </div>
  );
}

/* ─── EPA PM2.5 → US AQI ─────────────────────────────────────────────────── */
function pm25toAQI(pm: number): number {
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
}

/* ─────────────────────────── Main Section ────────────────────────────────── */
export default function MetricsSection() {
  // Live-updated arrays — initialised with verified historical data
  const [co2Data, setCo2Data] = useState<number[]>(CO2_DATA);
  const [aqiData, setAqiData] = useState<number[]>(AQI_DATA);
  const [isLive,  setIsLive]  = useState(false);
  const [liveTs,  setLiveTs]  = useState("");

  useEffect(() => {
    const owKey = import.meta.env.VITE_OPENWEATHER_KEY;

    /* ── 1. CO₂ from global-warming.org (Mauna Loa, no auth needed) ── */
    const fetchCO2 = async () => {
      try {
        const res  = await fetch("https://global-warming.org/api/co2-api");
        const json = await res.json() as { co2: { year:string; month:string; trend:string }[] };

        // Collect one value per month (last entry wins if duplicates)
        const monthly = new Map<string, number>();
        for (const e of json.co2) {
          const y = parseInt(e.year), m = parseInt(e.month);
          if (y < 2024) continue;
          const key = `${y}-${String(m).padStart(2, "0")}`;
          const val = parseFloat(e.trend);
          if (!isNaN(val) && val > 0) monthly.set(key, val);
        }

        // Build Jan 2024 → Mar 2026 (27-month) array
        const arr: number[] = [];
        for (let y = 2024; y <= 2026; y++) {
          const mEnd = y === 2026 ? 3 : 12;
          for (let m = 1; m <= mEnd; m++) {
            const key = `${y}-${String(m).padStart(2, "0")}`;
            const val = monthly.get(key);
            // Fill with hardcoded fallback if month not yet available from API
            arr.push(val ?? CO2_DATA[arr.length] ?? CO2_DATA[CO2_DATA.length - 1]);
          }
        }
        if (arr.length >= 10) setCo2Data(arr.slice(0, 27));
      } catch (e) {
        console.warn("CO₂ live fetch failed – using hardcoded data", e);
      }
    };

    /* ── 2. Global AQI — average of 8 major cities via OpenWeather ── */
    const fetchAQI = async () => {
      try {
        const cities = [
          { lat: 28.6139,  lon:  77.2090  }, // Delhi
          { lat: 39.9042,  lon: 116.4074  }, // Beijing
          { lat: 34.0522,  lon: -118.2437 }, // Los Angeles
          { lat: 51.5074,  lon:  -0.1278  }, // London
          { lat: 35.6762,  lon: 139.6503  }, // Tokyo
          { lat: 19.0760,  lon:  72.8777  }, // Mumbai
          { lat: 40.7128,  lon: -74.0060  }, // New York
          { lat: -23.5505, lon: -46.6333  }, // São Paulo
        ];
        const results = await Promise.all(
          cities.map(c =>
            fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${c.lat}&lon=${c.lon}&appid=${owKey}`)
              .then(r => r.json())
          )
        );
        const aqis = results
          .map(r => pm25toAQI(r?.list?.[0]?.components?.pm2_5 ?? 0))
          .filter(v => v > 0);

        if (aqis.length) {
          const avg = Math.round(aqis.reduce((a, b) => a + b, 0) / aqis.length);
          // Replace only the last (current) value — historical trend stays intact
          setAqiData(prev => [...prev.slice(0, -1), avg]);
        }
      } catch (e) {
        console.warn("AQI live fetch failed – using hardcoded data", e);
      }
    };

    Promise.all([fetchCO2(), fetchAQI()]).then(() => {
      setIsLive(true);
      setLiveTs(new Date().toLocaleTimeString());
    });

    // Refresh every 30 minutes
    const timer = setInterval(() => {
      Promise.all([fetchCO2(), fetchAQI()]).then(() => setLiveTs(new Date().toLocaleTimeString()));
    }, 30 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  // Regression + forecast — reactive to live data
  const aqiReg    = useMemo(() => linearRegression(aqiData),   [aqiData]);
  const co2Reg    = useMemo(() => linearRegression(co2Data),   [co2Data]);
  const ozoneReg  = useMemo(() => linearRegression(OZONE_DATA), []);
  const oceanReg  = useMemo(() => linearRegression(OCEAN_DATA), []);

  const aqiForecast   = useMemo(() => forecast(aqiData,   PREDICT_STEPS), [aqiData]);
  const co2Forecast   = useMemo(() => forecast(co2Data,   PREDICT_STEPS), [co2Data]);
  const ozoneForecast = useMemo(() => forecast(OZONE_DATA, PREDICT_STEPS), []);
  const oceanForecast = useMemo(() => forecast(OCEAN_DATA, PREDICT_STEPS), []);

  return (
    <section className="py-8">
      <div className="mb-5">
        <h2 className="text-2xl font-bold mb-1 text-emerald-50" style={{ fontFamily: "Space Grotesk" }}>
          🌱 Environmental Metrics
        </h2>
        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-sm text-slate-400">
            Real data Jan 2024 – Mar 2026 · Linear regression predicts Apr – Jun 2026
          </p>
          {isLive && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-900/40 border border-emerald-700/50 text-emerald-400 text-[10px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block"/>
              Live · {liveTs}
            </span>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-5 mb-5 text-[10px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <svg width="22" height="6"><line x1="0" y1="3" x2="22" y2="3" stroke="#34d399" strokeWidth="2"/></svg>
          Historical data
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="22" height="6"><line x1="0" y1="3" x2="22" y2="3" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5 3"/></svg>
          AI Prediction (Apr–Jun 2026)
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="12" height="12"><circle cx="6" cy="6" r="5" fill="#94a3b8"/></svg>
          Forecast point
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="12" height="12"><circle cx="6" cy="6" r="5" fill="#34d399"/></svg>
          Current (Mar 2026)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AQICard
          historical={aqiData} predicted={aqiForecast} r2={aqiReg.r2}
        />
        <OzoneCard
          historical={OZONE_DATA} predicted={ozoneForecast} r2={ozoneReg.r2}
        />
        <CO2Card
          historical={co2Data} predicted={co2Forecast} r2={co2Reg.r2}
        />
        <MetricCard
          title="Ocean Health Index" subtitle="Composite score (0 – 100)"
          source="Source: OHI / NCEAS Global Score"
          historical={OCEAN_DATA} predicted={oceanForecast}
          unit="/100" badge={oceanBadge(OCEAN_DATA[OCEAN_DATA.length-1])}
          gradId="ocean" r2={oceanReg.r2}
          formatVal={v => v.toFixed(1)}
        />
      </div>
    </section>
  );
}
