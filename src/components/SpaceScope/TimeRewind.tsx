import { useEffect, useMemo, useRef, useState } from "react";
import { History, Pause, Play, RotateCcw } from "lucide-react";
import { gsap, prefersReducedMotion } from "./gsap";
import SectionHead from "./SectionHead";

const W = 800;
const H = 400;
const PERIOD = 92.7; // minutes per ISS orbit
const DRIFT = 3.636; // degrees of longitude gained per minute (orbit minus Earth rotation)
const RANGE = 180; // slider covers -RANGE/2 .. +RANGE/2 minutes
const OBSERVER = { lat: 40.71, lon: -74.0 };

const wrapLon = (v: number) => ((((v + 180) % 360) + 360) % 360) - 180;
const project = (lat: number, lon: number) => ({ x: ((lon + 180) / 360) * W, y: ((90 - lat) / 180) * H });
const position = (t: number) => ({
  lat: 51.6 * Math.sin((2 * Math.PI * t) / PERIOD),
  lon: wrapLon(-40 + DRIFT * t),
});

/** Procedural dot-matrix "land" so the map reads as a world without shipping geodata. */
const landDots = (() => {
  const dots: { x: number; y: number; o: number }[] = [];
  for (let i = 0; i < 100; i++) {
    for (let j = 0; j < 44; j++) {
      const lon = -180 + (i / 100) * 360;
      const lat = 78 - (j / 44) * 130;
      const a = lon * 0.045;
      const b = lat * 0.07;
      const f =
        Math.sin(a * 1.3 + 1.2) + Math.sin(b * 2.1 - a * 0.6) + 0.8 * Math.sin((a + b) * 1.7) + 0.5 * Math.sin(a * 3.1 - b * 1.4) - Math.abs(lat) / 90;
      if (f > 0.85) {
        const p = project(lat, lon);
        dots.push({ x: p.x, y: p.y, o: 0.18 + Math.min(0.5, (f - 0.85) * 0.5) });
      }
    }
  }
  return dots;
})();

const trackPath = (() => {
  let d = "";
  let prev: number | null = null;
  for (let t = -RANGE / 2; t <= RANGE / 2; t += 1) {
    const { lat, lon } = position(t);
    const p = project(lat, lon);
    const jump = prev !== null && Math.abs(lon - prev) > 180;
    d += `${d === "" || jump ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)} `;
    prev = lon;
  }
  return d;
})();

const fmtClock = (offsetMin: number) => {
  const d = new Date(Date.now() + offsetMin * 60000);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const TimeRewind = () => {
  const root = useRef<HTMLElement>(null);
  const markerRef = useRef<SVGGElement>(null);
  const playRef = useRef<gsap.core.Tween | null>(null);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);

  const pos = useMemo(() => position(t), [t]);
  const sunlit = (((t % PERIOD) + PERIOD) % PERIOD) < 58;
  const pin = project(OBSERVER.lat, OBSERVER.lon);
  const here = project(pos.lat, pos.lon);
  const overhead = Math.hypot(here.x - pin.x, here.y - pin.y) < 60;
  const pct = ((t + RANGE / 2) / RANGE) * 100;

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;
    gsap.to(marker, { x: here.x, y: here.y, duration: prefersReducedMotion() ? 0 : 0.35, ease: "power2.out", overwrite: true });
  }, [here.x, here.y]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return;
      gsap.from("[data-tr-stage]", {
        y: 70, opacity: 0, duration: 1.1, ease: "power3.out",
        scrollTrigger: { trigger: "[data-tr-stage]", start: "top 88%", once: true },
      });
      gsap.fromTo("[data-track]", { strokeDashoffset: 3000, strokeDasharray: 3000 }, {
        strokeDashoffset: 0, duration: 2.4, ease: "power2.inOut",
        scrollTrigger: { trigger: "[data-tr-stage]", start: "top 70%", once: true },
        onComplete: () => gsap.set("[data-track]", { strokeDasharray: "6 6" }),
      });
      gsap.to("[data-ping]", { attr: { r: 26 }, opacity: 0, duration: 1.8, repeat: -1, ease: "power1.out" });
    }, el);
    return () => {
      playRef.current?.kill();
      ctx.revert();
    };
  }, []);

  const togglePlay = () => {
    if (playing) {
      playRef.current?.kill();
      setPlaying(false);
      return;
    }
    const s = { v: t >= RANGE / 2 - 1 ? -RANGE / 2 : t };
    setPlaying(true);
    playRef.current = gsap.to(s, {
      v: RANGE / 2,
      duration: ((RANGE / 2 - s.v) / RANGE) * 14,
      ease: "none",
      onUpdate: () => setT(Math.round(s.v * 10) / 10),
      onComplete: () => setPlaying(false),
    });
  };

  const reset = () => {
    playRef.current?.kill();
    setPlaying(false);
    const s = { v: t };
    gsap.to(s, { v: 0, duration: 0.8, ease: "power3.inOut", onUpdate: () => setT(Math.round(s.v * 10) / 10) });
  };

  const label = t === 0 ? "Now" : `${t < 0 ? "−" : "+"}${Math.abs(Math.round(t))} min`;

  return (
    <section ref={root} className="relative z-10 py-24 md:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHead
          align="center"
          lines={["Scrub through", <span key="a" className="l-grad-text">orbital history.</span>]}
          lead="Drag the timeline to replay where the ISS has been, or fast-forward to see exactly when it will fly over you next."
        />

        <div data-tr-stage className="l-card mt-14 p-3 sm:p-5">
          <div className="relative overflow-hidden rounded-[1.4rem] bg-[radial-gradient(120%_120%_at_50%_0%,#2a1766_0%,#150b33_60%,#0c0620_100%)]">
            <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="World map with the ISS ground track and its position at the selected time">
              {landDots.map((d, i) => (
                <circle key={i} cx={d.x} cy={d.y} r="2.2" fill="#c9b6ff" opacity={d.o} />
              ))}
              {[-60, -30, 0, 30, 60].map((lat) => {
                const y = project(lat, 0).y;
                return <line key={lat} x1="0" x2={W} y1={y} y2={y} stroke="#fff" strokeOpacity="0.06" />;
              })}
              <path data-track d={trackPath} fill="none" stroke="#ff8fb8" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.85" />

              {/* Observer */}
              <g transform={`translate(${pin.x} ${pin.y})`}>
                <circle r="5" fill="#ffd9a0" />
                <circle r="11" fill="none" stroke="#ffd9a0" strokeOpacity="0.5" />
                <text x="16" y="4" fontSize="12" fontWeight="600" fill="#ffd9a0" fontFamily="Inter, sans-serif">You</text>
              </g>

              {/* ISS marker */}
              <g ref={markerRef}>
                <circle data-ping r="10" fill="none" stroke="#ff8fb8" strokeWidth="2" />
                <circle r="9" fill="#ff8fb8" fillOpacity="0.25" />
                <circle r="5.5" fill="#fff5ee" />
                <circle r="2.5" fill="#1a1030" />
              </g>
            </svg>

            {/* HUD */}
            <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-2 sm:left-5 sm:top-5">
              <span className="l-glass-dark rounded-full px-3.5 py-1.5 text-xs font-semibold">{fmtClock(t)} local</span>
              <span className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${sunlit ? "bg-(--l-gold) text-(--l-ink)" : "bg-(--l-ink) text-(--l-lilac)"}`}>
                {sunlit ? "Sunlit" : "In Earth's shadow"}
              </span>
              {overhead && <span className="rounded-full bg-(--l-pink) px-3.5 py-1.5 text-xs font-bold text-(--l-ink)">Passing over you</span>}
            </div>
            <div className="pointer-events-none absolute bottom-3 right-3 hidden gap-6 rounded-2xl bg-black/30 px-4 py-2 text-xs backdrop-blur-sm sm:flex">
              <span><span className="">LAT </span><b className="font-heading">{pos.lat.toFixed(1)}°</b></span>
              <span><span className="">LON </span><b className="font-heading">{pos.lon.toFixed(1)}°</b></span>
            </div>
          </div>

          {/* Scrubber */}
          <div className="flex flex-col gap-5 px-2 pb-2 pt-6 sm:flex-row sm:items-center sm:px-4">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="grid h-12 w-12 place-items-center rounded-full bg-(--l-cream) text-(--l-ink) transition-transform hover:scale-105"
                aria-label={playing ? "Pause replay" : "Play replay"}
              >
                {playing ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 translate-x-px fill-current" />}
              </button>
              <button
                onClick={reset}
                className="grid h-12 w-12 place-items-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
                aria-label="Jump to now"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1">
              <input
                type="range"
                min={-RANGE / 2}
                max={RANGE / 2}
                step={0.5}
                value={t}
                onChange={(e) => {
                  playRef.current?.kill();
                  setPlaying(false);
                  setT(Number(e.target.value));
                }}
                className="l-range"
                style={{ ["--p" as string]: `${pct}%` }}
                aria-label="Time offset in minutes"
              />
              <div className="mt-3 flex justify-between text-xs">
                <span>−90 min</span>
                <span>Now</span>
                <span>+90 min</span>
              </div>
            </div>
            <div className="flex min-w-34 items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 font-heading text-sm font-semibold">
              <History className="h-4 w-4 text-(--l-pink)" />
              {label}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TimeRewind;
