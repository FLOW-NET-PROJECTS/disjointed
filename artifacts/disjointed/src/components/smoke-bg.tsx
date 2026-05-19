import { useEffect, useRef } from "react";

const DURATION = 3.8;

interface Particle {
  x: number;
  y: number;
  startY: number;
  travelH: number;
  vx: number;
  radius: number;
  maxAlpha: number;
  phase: number;
}

function makeParticle(w: number, h: number, phase: number): Particle {
  return {
    x: Math.random() * w,
    y: 0,
    startY: h + 60 + Math.random() * 80,
    travelH: h * 1.25 + 120,
    vx: (Math.random() - 0.5) * 1.2,
    radius: 105 + Math.random() * 145,
    maxAlpha: 0.09 + Math.random() * 0.09,
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
    let lastFrameTs = 0;
    let particles: Particle[] = [];
    const mobileQuery = window.matchMedia("(max-width: 768px)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const isMobile = mobileQuery.matches;
      const prefersReducedMotion = reducedMotionQuery.matches;
      const count = prefersReducedMotion ? 4 : isMobile ? 8 : 16;

      particles = Array.from({ length: count }, (_, i) =>
        makeParticle(canvas.width, canvas.height, (i / count) * DURATION),
      );
    };

    resize();
    window.addEventListener("resize", resize);
    mobileQuery.addEventListener("change", resize);
    reducedMotionQuery.addEventListener("change", resize);

    let startTime = -1;

    const draw = (ts: number) => {
      if (startTime < 0) startTime = ts;

      const minFrameGap = mobileQuery.matches ? 1000 / 24 : 1000 / 36;
      if (ts - lastFrameTs < minFrameGap) {
        raf = requestAnimationFrame(draw);
        return;
      }
      lastFrameTs = ts;

      const elapsed = (ts - startTime) / 1000;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const particle of particles) {
        const t = ((elapsed + particle.phase) % DURATION) / DURATION;
        const fade = Math.sin(t * Math.PI);
        const alpha = particle.maxAlpha * fade;

        if (alpha < 0.002) {
          continue;
        }

        const py = particle.startY - t * particle.travelH;
        const px =
          particle.x +
          Math.sin(t * Math.PI * 2.5 + particle.phase) * 18 * t +
          particle.vx * t * 60;

        const gradient = ctx.createRadialGradient(px, py, 0, px, py, particle.radius);
        gradient.addColorStop(0, `rgba(118,192,95,${(alpha * 1.5).toFixed(4)})`);
        gradient.addColorStop(0.38, `rgba(74,140,63,${(alpha * 0.9).toFixed(4)})`);
        gradient.addColorStop(0.72, `rgba(55,110,46,${(alpha * 0.35).toFixed(4)})`);
        gradient.addColorStop(1, "rgba(30,60,26,0)");

        ctx.beginPath();
        ctx.arc(px, py, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      mobileQuery.removeEventListener("change", resize);
      reducedMotionQuery.removeEventListener("change", resize);
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
