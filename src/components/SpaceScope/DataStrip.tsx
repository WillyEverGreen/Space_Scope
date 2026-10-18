import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "./gsap";

const sources = [
  "NASA APOD",
  "NASA DONKI",
  "NOAA SWPC",
  "Open Notify ISS",
  "ESA",
  "Spaceflight News",
  "SpaceX Launches",
  "GOES X-ray Flux",
];

const stats = [
  { value: 12480, suffix: "+", label: "Objects in orbit tracked" },
  { value: 408, suffix: " km", label: "ISS altitude above you" },
  { value: 27600, suffix: " km/h", label: "Orbital speed of the ISS" },
  { value: 16, suffix: "", label: "Sunrises every 24 hours" },
];

/** Data-source marquee followed by count-up headline numbers. */
const DataStrip = () => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const nums = gsap.utils.toArray<HTMLElement>("[data-count]");
      nums.forEach((n) => {
        const target = Number(n.dataset.count);
        if (prefersReducedMotion()) {
          n.textContent = target.toLocaleString();
          return;
        }
        const state = { v: 0 };
        gsap.to(state, {
          v: target,
          duration: 2.2,
          ease: "power3.out",
          scrollTrigger: { trigger: n, start: "top 90%", once: true },
          onUpdate: () => (n.textContent = Math.round(state.v).toLocaleString()),
        });
      });
      if (!prefersReducedMotion()) {
        gsap.from("[data-stat]", {
          y: 40,
          opacity: 0,
          stagger: 0.1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: "[data-stat]", start: "top 90%", once: true },
        });
      }
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="relative z-10 pb-10 pt-6">
      <div className="l-marquee relative overflow-hidden border-y border-white/10 py-5 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <div className="l-marquee-track">
          {[...sources, ...sources].map((s, i) => (
            <span key={i} className="flex items-center gap-10 pr-10 font-heading text-lg font-semibold tracking-tight text-[var(--l-mist)]/55">
              {s}
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--l-lilac)]/50" />
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-16 grid max-w-6xl grid-cols-2 gap-x-6 gap-y-10 px-6 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} data-stat className="border-l border-white/15 pl-5">
            <div className="font-heading text-4xl font-bold tracking-tight md:text-5xl">
              <span data-count={s.value}>0</span>
              <span className="l-grad-text">{s.suffix}</span>
            </div>
            <div className="mt-2 text-sm text-[var(--l-mist)]/65">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DataStrip;
