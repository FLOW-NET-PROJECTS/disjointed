import { useEffect, useRef } from "react";

const DURATION = 3; // seconds — seamless loop period

interface Particle {
  x: number;
  y: number;
  startY: number;
  travelH: number;
  vx: number;
  radius: number;
  maxAlpha: number;
  phase: number; // 0..DURATION, staggered so first===last frame
}

function makeParticle(w: number, h: number, phase: number): Particle {
  return {
    x: Math.random() * w,
    y: 0,
    startY: h + 60 + Math.random() * 80,
    travelH: h * 1.25 + 120,
    vx: (Math.random() - 0.5) * 1.2,
    radius: 90 + Math.random() * 130,
    maxAlpha: 0.055 + Math.random() * 0.07,
    phase,
  };
}

export function SmokeBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let particles: Particle[] = [];
    const COUNT = 20;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // rebuild particles on resize so coverage stays consistent
      particles = Array.from({ length: COUNT }, (_, i) =>
        makeParticle(canvas.width, canvas.height, (i / COUNT) * DURATION)
      );
    };
    resize();
    window.addEventListener("resize", resize);

    let startTime = -1;

    const draw = (ts: number) => {
      if (startTime < 0) startTime = ts;
      const elapsed = (ts - startTime) / 1000; // seconds

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        // t goes 0→1 within this particle's personal DURATION window, wrapping
        const t = ((elapsed + p.phase) % DURATION) / DURATION;

        // smooth fade: sine envelope so first frame == last frame (no seam)
        const fade = Math.sin(t * Math.PI);          // 0 at 0 & 1, peak at 0.5
        const alpha = p.maxAlpha * fade;

        if (alpha < 0.002) {
          raf = requestAnimationFrame(draw);
          continue;
        }

        // position: linear rise + gentle horizontal wobble
        const py = p.startY - t * p.travelH;
        const px = p.x + Math.sin(t * Math.PI * 2.5 + p.phase) * 18 * t + p.vx * t * 60;

        const g = ctx.createRadialGradient(px, py, 0, px, py, p.radius);
        g.addColorStop(0,   `rgba(74,140,63,${(alpha * 1.3).toFixed(4)})`);
        g.addColorStop(0.45,`rgba(55,110,46,${(alpha * 0.55).toFixed(4)})`);
        g.addColorStop(1,   `rgba(30,60,26,0)`);

        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        width: "100%",
        height: "100%",
      }}
    />
  );
}
