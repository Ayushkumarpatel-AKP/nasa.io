// src/components/FeatureCard.tsx
import { useState, ReactNode } from 'react';

type Props = {
  icon: ReactNode;
  title: string;
  description: string;
};

const NATURE_FONT = "'Playfair Display', Georgia, serif";

export default function FeatureCard({ icon, title, description }: Props) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="relative flex justify-center items-center">
      {/* Circular flippable card container */}
      <div
        className="relative w-40 h-40 cursor-pointer"
        onMouseEnter={() => setIsFlipped(true)}
        onMouseLeave={() => setIsFlipped(false)}
        style={{ perspective: '1000px' }}
      >
        <div
          className="relative w-full h-full transition-transform duration-700"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front Side */}
          <div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-900/40 via-dark-200 to-secondary-900/40 border-2 border-primary-500/60 shadow-xl shadow-primary-500/40 overflow-hidden group hover:border-primary-300 hover:shadow-2xl hover:shadow-primary-400/60 transition-all"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {/* Subtle leaf pattern bg */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0C20 11 11 20 0 20 11 20 20 11 20 0z' fill='%2310b981' fill-opacity='0.5'/%3E%3C/svg%3E")`,
              backgroundSize: '40px 40px',
            }} />

            {/* Glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5 group-hover:from-primary-500/15 group-hover:to-secondary-500/15 transition-all duration-500" />

            {/* Centred icon + title */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
              <div className="w-12 h-12 flex items-center justify-center text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.9)]">
                {icon}
              </div>
              <h3
                className="text-xs font-semibold text-white group-hover:text-primary-300 transition-colors text-center leading-tight"
                style={{ fontFamily: NATURE_FONT }}
              >
                {title}
              </h3>
            </div>
          </div>

          {/* Back Side */}
          <div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-secondary-900/50 via-dark-100 to-primary-900/50 border-2 border-secondary-600/50 shadow-xl shadow-secondary-900/30 overflow-hidden"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <p
                className="text-[10px] text-white/85 leading-relaxed text-center"
                style={{ fontFamily: NATURE_FONT }}
              >
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative pulse node */}
      <div className="absolute top-0 left-1/2 w-2 h-2 rounded-full bg-primary-500 shadow-lg shadow-primary-500/50 -translate-x-1/2 -translate-y-6 animate-pulse" />
    </div>
  );
}
