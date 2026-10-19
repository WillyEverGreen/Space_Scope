import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "./gsap";

interface Star {
  x: number;
  y: number;
  r: number;
  base: number;
  speed: number;
  phase: number;
  tint: string;
}

const TINTS = ["255,245,238", "201,182,255", "255,180,143", "255,143,184"];

/**
 * Twinkling canvas starfield that fills its (relative) parent, plus a few
 * GSAP-driven shooting stars. Purely decorative.
 */
const SkyStars = ({ density = 1 }: { density?: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streakRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    let stars: Star[] = [];
    let raf = 0;
    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(Math.floor((w * h) / 5200) * density, 900);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.3 + 0.3,
        base: Math.random() * 0.6 + 0.25,
        speed: Math.random() * 1.6 + 0.4,
        phase: Math.random() * Math.PI * 2,
        tint: TINTS[Math.floor(Math.random() * TINTS.length)],
      }));
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const a = reduced ? s.base : s.base * (0.55 + 0.45 * Math.sin(t * 0.001 * s.speed + s.phase));
        ctx.fillStyle = `rgba(${s.tint},${a})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduced) raf = requestAnimationFrame(draw);
    };

    resize();
    raf = requestAnimationFrame(draw);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Shooting stars
    const ctxG = gsap.context(() => {
      if (reduced) return;
      streakRefs.current.forEach((el, i) => {
        if (!el) return;
        const fire = () => {
          gsap.set(el, {
            x: gsap.utils.random(w * 0.3, w * 1.05),
            y: gsap.utils.random(-40, h * 0.35),
            opacity: 0,
            scaleX: 0.4,
            rotation: -36,
          });
          gsap
            .timeline({ onComplete: () => gsap.delayedCall(gsap.utils.random(4, 11), fire) })
            .to(el, { opacity: 1, scaleX: 1, duration: 0.15 })
            .to(el, { x: "-=420", y: "+=300", duration: 0.9, ease: "power2.in" }, "<")
            .to(el, { opacity: 0, duration: 0.35 }, "-=0.35");
        };
        gsap.delayedCall(i * 3 + gsap.utils.random(1, 5), fire);
      });
    });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      ctxG.revert();
    };
  }, [density]);

  return (
    <div className="pointer-events-none absolute inset-0 [clip-path:inset(0)]" aria-hidden="true">
      <canvas ref={canvasRef} className="fixed inset-0 h-screen w-full" />
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          ref={(el) => (streakRefs.current[i] = el)}
          className="fixed left-0 top-0 h-px w-32 origin-left opacity-0"
          style={{
            background: "linear-gradient(90deg, rgba(255,245,238,0.95), transparent)",
          }}
        />
      ))}
    </div>
  );
};

export default SkyStars;
