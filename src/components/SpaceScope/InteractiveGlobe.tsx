import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "./gsap";
import SectionHead from "./SectionHead";
import { Planet } from "./art/Planet";
import { Moon, Satellite, Station } from "./art/Craft";

const CX = 300;
const CY = 300;
const DISC_R = 120;

interface Orbit {
  id: string;
  rx: number;
  ry: number;
  rot: number;
  offset: number;
  duration: number;
  color: string;
}

const orbits: Orbit[] = [
  { id: "iss", rx: 240, ry: 78, rot: -20, offset: 0.12, duration: 22, color: "#ff8fb8" },
  { id: "sat", rx: 195, ry: 58, rot: 26, offset: 0.55, duration: 30, color: "#c9b6ff" },
  { id: "moon", rx: 285, ry: 112, rot: 6, offset: 0.8, duration: 46, color: "#ffd9a0" },
];

/** Closed loop of points around a rotated ellipse, starting at `offset` (0..1) of a revolution. */
const ellipsePoints = ({ rx, ry, rot, offset }: Orbit, n = 90) => {
  const r = (rot * Math.PI) / 180;
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = (offset + i / n) * Math.PI * 2;
    const x = rx * Math.cos(t);
    const y = ry * Math.sin(t);
    return { x: CX + x * Math.cos(r) - y * Math.sin(r), y: CY + x * Math.sin(r) + y * Math.cos(r) };
  });
};

const orbitPath = (o: Orbit) =>
  ellipsePoints({ ...o, offset: 0 }, 120)
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ") + " Z";

const regions = [
  { name: "North America", pct: 95, when: "11:30 PM – 3:00 AM", dir: "NE" },
  { name: "Europe", pct: 78, when: "4:30 AM – 6:00 AM", dir: "NW" },
  { name: "Asia", pct: 62, when: "7:10 PM – 9:30 PM", dir: "SW" },
  { name: "South America", pct: 41, when: "1:15 AM – 2:40 AM", dir: "N" },
];

const InteractiveGlobe = () => {
  const root = useRef<HTMLElement>(null);
  const altRef = useRef<HTMLSpanElement>(null);
  const velRef = useRef<HTMLSpanElement>(null);
  const latRef = useRef<HTMLSpanElement>(null);
  const lonRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = prefersReducedMotion();

    const ctx = gsap.context(() => {
      orbits.forEach((o) => {
        const sprite = el.querySelector<SVGGElement>(`[data-sprite="${o.id}"]`);
        if (!sprite) return;
        const place = (progress: number) => {
          const t = progress * Math.PI * 2;
          const x = gsap.getProperty(sprite, "x") as number;
          const y = gsap.getProperty(sprite, "y") as number;
          // Local y>0 is the near side of the orbit; hide the craft while it passes behind the planet
          const r = (o.rot * Math.PI) / 180;
          const behind = -(x - CX) * Math.sin(r) + (y - CY) * Math.cos(r) < 0;
          const hidden = behind && Math.hypot(x - CX, y - CY) < DISC_R + 6;
          sprite.style.opacity = hidden ? "0" : "1";

          if (o.id === "iss") {
            const lat = 51.6 * Math.sin(t + 0.4);
            const lon = (((progress * 360 * 4.2) % 360) + 360) % 360 - 180;
            if (latRef.current) latRef.current.textContent = `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? "N" : "S"}`;
            if (lonRef.current) lonRef.current.textContent = `${Math.abs(lon).toFixed(2)}° ${lon >= 0 ? "E" : "W"}`;
            if (altRef.current) altRef.current.textContent = (408 + 4 * Math.sin(t * 2)).toFixed(1);
            if (velRef.current) velRef.current.textContent = (7.66 + 0.02 * Math.cos(t * 2)).toFixed(2);
          }
        };

        if (reduced) {
          gsap.set(sprite, { x: CX + o.rx * 0.7, y: CY + o.ry * 0.7 });
          return;
        }
        const tw = gsap.to(sprite, {
          motionPath: { path: el.querySelector<SVGPathElement>(`[data-orbit-path="${o.id}"]`)! },
          duration: o.duration,
          repeat: -1,
          ease: "none",
          onUpdate: () => place(tw.progress()),
        });
        tw.progress(o.offset);
        place(o.offset);
      });

      if (reduced) return;

      // Drifting planet + orbit rings intro
      gsap.from("[data-orbit-ring]", {
        opacity: 0, stagger: 0.12, duration: 1.4, ease: "power3.out",
        scrollTrigger: { trigger: "[data-orbit-stage]", start: "top 80%", once: true },
      });
      gsap.from("[data-planet]", {
        opacity: 0, duration: 1.6, ease: "power2.out",
        scrollTrigger: { trigger: "[data-orbit-stage]", start: "top 80%", once: true },
      });
      gsap.to("[data-orbit-stage]", {
        yPercent: -6, ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
      });

      // Visibility bars fill, numbers count
      gsap.utils.toArray<HTMLElement>("[data-region]").forEach((row, i) => {
        const bar = row.querySelector<HTMLElement>("[data-bar]");
        const num = row.querySelector<HTMLElement>("[data-pct]");
        const target = Number(row.dataset.region);
        const st = { trigger: row, start: "top 90%", once: true };
        gsap.from(row, { x: -40, opacity: 0, duration: 0.8, delay: i * 0.08, ease: "power3.out", scrollTrigger: st });
        gsap.fromTo(bar, { width: "0%" }, { width: `${target}%`, duration: 1.6, delay: 0.2 + i * 0.08, ease: "power3.out", scrollTrigger: st });
        const s = { v: 0 };
        gsap.to(s, { v: target, duration: 1.6, delay: 0.2 + i * 0.08, ease: "power3.out", scrollTrigger: st, onUpdate: () => num && (num.textContent = `${Math.round(s.v)}%`) });
      });
    }, el);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section ref={root} id="orbit" className="relative z-10 overflow-hidden py-24 md:py-36">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 lg:grid-cols-[1fr_1.05fr]">
        <div>
          <SectionHead
            lines={["The whole sky,", <span key="a" className="l-grad-text">in real time.</span>]}
            lead="Watch the ISS, communication satellites and the Moon trace their paths around Earth, and see which part of the planet has the best seat right now."
          />

          <div className="mt-12">
            {regions.map((r) => (
              <div key={r.name} data-region={r.pct} className="l-rule py-5">
                <div className="flex items-baseline justify-between gap-4">
                  <div>
                    <div className="font-heading text-lg font-semibold leading-tight">{r.name}</div>
                    <div className="mt-1 text-xs">{r.when} · look {r.dir}</div>
                  </div>
                  <span data-pct className="font-heading text-2xl font-bold tabular-nums">0%</span>
                </div>
                <div className="mt-3 h-px bg-white/10">
                  <div data-bar className="h-[3px] -translate-y-px rounded-full bg-(--l-peach)" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Orbit stage */}
        <div data-orbit-stage className="relative mx-auto aspect-square w-full max-w-[640px]">
          <svg viewBox="0 0 600 600" className="h-full w-full overflow-visible" role="img" aria-label="Animated diagram of the ISS, a satellite and the Moon orbiting a planet">
            <defs>
              <clipPath id="orbit-front">
                <rect x="-100" y={CY} width="800" height="400" />
              </clipPath>
            </defs>

            {/* Back half of each orbit */}
            {orbits.map((o) => (
              <g key={`b-${o.id}`} transform={`rotate(${o.rot} ${CX} ${CY})`}>
                <ellipse data-orbit-ring cx={CX} cy={CY} rx={o.rx} ry={o.ry} fill="none" stroke={o.color} strokeOpacity="0.28" strokeDasharray="3 7" />
              </g>
            ))}

            <g data-planet transform={`translate(${CX - 200} ${CY - 200})`}>
              <Planet variant="violet" width={400} height={400} />
            </g>

            {/* Front half drawn over the planet */}
            {orbits.map((o) => (
              <g key={`f-${o.id}`} transform={`rotate(${o.rot} ${CX} ${CY})`}>
                <g clipPath="url(#orbit-front)">
                  <ellipse data-orbit-ring cx={CX} cy={CY} rx={o.rx} ry={o.ry} fill="none" stroke={o.color} strokeOpacity="0.85" strokeWidth="1.6" />
                </g>
              </g>
            ))}

            {orbits.map((o) => (
              <path key={`p-${o.id}`} data-orbit-path={o.id} d={orbitPath(o)} fill="none" stroke="none" />
            ))}

            {/* Sprites: <g> at origin, moved by GSAP; inner offset centres the art */}
            <g data-sprite="iss"><g transform="translate(-36 -16)"><Station width={72} height={33} /></g></g>
            <g data-sprite="sat"><g transform="translate(-26 -12)"><Satellite width={52} height={23} /></g></g>
            <g data-sprite="moon"><g transform="translate(-16 -16)"><Moon width={32} height={32} /></g></g>
          </svg>

          {/* Telemetry */}
          <div className="absolute -bottom-4 left-0 w-70 rounded-2xl border border-white/15 bg-[#0c0620]/85 p-5 sm:-left-4 lg:-left-10">
            <div className="mb-3 flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-widest text-(--l-lilac)">
              <span className="l-live-dot" /> ISS telemetry
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div><dt className="text-[0.7rem]">Altitude</dt><dd className="font-heading text-lg font-semibold"><span ref={altRef}>408.0</span> <small className="text-xs font-normal">km</small></dd></div>
              <div><dt className="text-[0.7rem]">Velocity</dt><dd className="font-heading text-lg font-semibold"><span ref={velRef}>7.66</span> <small className="text-xs font-normal">km/s</small></dd></div>
              <div><dt className="text-[0.7rem]">Latitude</dt><dd className="font-heading font-semibold" ref={latRef}>0.00° N</dd></div>
              <div><dt className="text-[0.7rem]">Longitude</dt><dd className="font-heading font-semibold" ref={lonRef}>0.00° E</dd></div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveGlobe;
