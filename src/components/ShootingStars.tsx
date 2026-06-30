// src/components/ShootingStars.tsx
import { useMemo } from "react";

interface StarConfig {
  id: number;
  top: number;
  left: number;
  length: number;    // tail px — longer now
  duration: number;
  delay: number;
  angle: number;
  opacity: number;
  headSize: number;
}

function seededRand(seed: number) {
  const x = Math.sin(seed + 1) * 43758.5453123;
  return x - Math.floor(x);
}

export default function ShootingStars() {
  const stars = useMemo<StarConfig[]>(() => {
    const count = 8; // few stars, 1-2 visible at a time
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      top:      seededRand(i * 7)  * 80 - 15,
      left:     seededRand(i * 13) * 130 - 15,
      length:   200 + seededRand(i * 3)  * 350,        // 200–550 px long tails
      duration: 16 + seededRand(i * 11) * 4,           // 16–20s full cycle; travel = first 20% = ~3-4s
      delay:    i * 2.0 + seededRand(i * 17) * 0.8,   // ~2s stagger → 1 star every ~2s
      angle:    205 + seededRand(i * 5)  * 22,
      opacity:  0.75 + seededRand(i * 19) * 0.25,
      headSize: 3 + seededRand(i * 23) * 3,
    }));
  }, []);

  return (
    <div className="shooting-stars-layer" aria-hidden="true">
      <div className="star-field" />
      {stars.map(s => (
        <span
          key={s.id}
          className="shooting-star"
          style={{
            top:              `${s.top}%`,
            left:             `${s.left}%`,
            width:            `${s.length}px`,
            '--angle':        `${s.angle}deg`,
            animationDuration:`${s.duration}s`,
            animationDelay:   `${s.delay}s`,
            opacity:          0,
            '--head-size':    `${s.headSize}px`,
            '--star-opacity': s.opacity,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
