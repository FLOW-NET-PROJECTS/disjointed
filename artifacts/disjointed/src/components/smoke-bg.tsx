import { useEffect, useRef } from "react";

const WISPS = [
  { left: "8%",  delay: 0,    duration: 3,    drift: "18px",  rot: "12deg",  opacity: 0.07, size: 260 },
  { left: "22%", delay: 0.5,  duration: 3,    drift: "-14px", rot: "-8deg",  opacity: 0.06, size: 220 },
  { left: "38%", delay: 1.1,  duration: 3,    drift: "22px",  rot: "16deg",  opacity: 0.08, size: 300 },
  { left: "55%", delay: 0.3,  duration: 3,    drift: "-20px", rot: "-12deg", opacity: 0.07, size: 250 },
  { left: "70%", delay: 1.6,  duration: 3,    drift: "16px",  rot: "10deg",  opacity: 0.06, size: 240 },
  { left: "85%", delay: 0.8,  duration: 3,    drift: "-10px", rot: "-6deg",  opacity: 0.08, size: 280 },
  { left: "15%", delay: 2.0,  duration: 3,    drift: "12px",  rot: "8deg",   opacity: 0.05, size: 200 },
  { left: "48%", delay: 2.5,  duration: 3,    drift: "-18px", rot: "-14deg", opacity: 0.07, size: 270 },
  { left: "62%", delay: 1.4,  duration: 3,    drift: "20px",  rot: "18deg",  opacity: 0.06, size: 230 },
  { left: "78%", delay: 0.2,  duration: 3,    drift: "-22px", rot: "-10deg", opacity: 0.05, size: 210 },
];

export function SmokeBg() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {WISPS.map((w, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            bottom: "-120px",
            left: w.left,
            width: `${w.size}px`,
            height: `${w.size}px`,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at center, rgba(74,140,63,0.55) 0%, rgba(74,140,63,0.18) 45%, transparent 70%)",
            filter: "blur(42px)",
            willChange: "transform, opacity",
            animation: `smoke-rise-${i} ${w.duration}s ${w.delay}s infinite linear`,
          }}
        />
      ))}

      <style>{`
        ${WISPS.map(
          (w, i) => `
          @keyframes smoke-rise-${i} {
            0%   { transform: translateY(0px) translateX(0px) scale(0.7) rotate(0deg); opacity: 0; }
            12%  { opacity: ${w.opacity}; }
            88%  { opacity: ${w.opacity}; }
            100% { transform: translateY(-110vh) translateX(${w.drift}) scale(1.5) rotate(${w.rot}); opacity: 0; }
          }
        `
        ).join("")}
      `}</style>
    </div>
  );
}
