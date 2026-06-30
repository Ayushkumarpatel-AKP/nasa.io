// src/components/AnimatedText.tsx
import { useState, useEffect } from "react";

const words = [
  "Visualize Earth.",
  "Monitor Earth.",
  "Explore Earth.",
  "Protect Earth.",
  "Analyze Earth.",
  "Observe Earth.",
];

export default function AnimatedText() {
  const [currentWord, setCurrentWord] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentWord((prev) => (prev + 1) % words.length);
        setIsAnimating(false);
      }, 500);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className={`inline-block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent transition-all duration-500 ${
        isAnimating
          ? "opacity-0 blur-sm scale-95"
          : "opacity-100 blur-0 scale-100"
      }`}
      style={{
        filter: isAnimating ? "blur(8px)" : "blur(0px)",
        minWidth: "420px",
        textAlign: "left",
      }}
    >
      {words[currentWord]}
    </span>
  );
}
