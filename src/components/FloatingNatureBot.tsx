import { useEffect, useState } from "react";
import NatureBot from "./NatureBot";

type LocationData = {
  lat: number;
  lon: number;
  name?: string;
};

type Props = {
  selectedLocation: LocationData | null;
};

export default function FloatingNatureBot({ selectedLocation }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowHint(false), 6000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 pointer-events-none">
      {!isOpen && showHint && (
        <div className="pointer-events-auto max-w-[260px] rounded-[1.5rem] border border-emerald-500/25 bg-[radial-gradient(circle_at_top,#14361f,#04110a_70%)] px-4 py-3 text-sm text-emerald-50 shadow-2xl shadow-black/45 backdrop-blur-md">
          <p className="font-semibold text-emerald-100" style={{ fontFamily: "Space Grotesk" }}>
            If you want more info, I am here.
          </p>
          <p className="mt-1 text-xs text-emerald-300/80">
            Click the Terra bot to ask about air quality.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-300/35 bg-[radial-gradient(circle_at_top,#1f5d31,#03120a)] text-3xl shadow-2xl shadow-black/50 transition-transform hover:scale-105"
        style={{ boxShadow: "0 0 26px rgba(74, 222, 128, 0.28)" }}
        aria-label={isOpen ? "Close Terra bot" : "Open Terra bot"}
      >
        🌿
      </button>

      {isOpen && (
        <div className="pointer-events-auto w-[min(92vw,430px)] overflow-hidden rounded-[1.75rem] border border-emerald-700/35 bg-[linear-gradient(180deg,rgba(6,20,11,0.96),rgba(2,8,4,0.98))] shadow-2xl shadow-black/60 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-emerald-900/50 bg-[linear-gradient(90deg,rgba(10,44,22,0.95),rgba(3,14,8,0.92))] px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-emerald-100" style={{ fontFamily: "Space Grotesk" }}>
                Terra Bot
              </p>
              <p className="text-xs text-emerald-400/80">
                Ask for more air quality details
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full px-3 py-1 text-xs text-emerald-200 transition hover:bg-emerald-900/50"
            >
              Close
            </button>
          </div>
          <NatureBot selectedLocation={selectedLocation} />
        </div>
      )}
    </div>
  );
}