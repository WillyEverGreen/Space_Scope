import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "./gsap";
import SectionHead from "./SectionHead";

const features = [
  { title: "Live positions", body: "Every satellite refreshed each second from public tracking feeds." },
  { title: "Predicted paths", body: "Glowing arcs show exactly where an object will cross your sky." },
  { title: "Point to identify", body: "Aim your camera and tap any dot to see what it is and how high it flies." },
  { title: "Never miss a pass", body: "Get a nudge minutes before the ISS rises over your horizon." },
];

const stars = Array.from({ length: 46 }, (_, i) => ({
  x: (i * 83.7) % 300,
  y: (i * 47.3) % 380,
  r: ((i * 7) % 10) / 10 + 0.5,
  o: 0.35 + (((i * 13) % 10) / 10) * 0.6,
}));

const Reticle = ({ id, label, sub }: { id: string; label: string; sub: string }) => (
  <g id={id} className="ar-marker">
    <g stroke="#fff5ee" strokeWidth="2" fill="none" strokeLinecap="round">
      <path d="M-16 -8 V-16 H-8" />
      <path d="M16 -8 V-16 H8" />
      <path d="M-16 8 V16 H-8" />
      <path d="M16 8 V16 H8" />
    </g>
    <circle r="3.5" fill="#ff8fb8" />
    <circle r="9" fill="none" stroke="#ff8fb8" strokeOpacity="0.6" className="ar-ping" />
    <g transform="translate(22 -6)">
      <rect x="-4" y="-14" width="86" height="30" rx="8" fill="#150b33" fillOpacity="0.78" stroke="#fff" strokeOpacity="0.2" />
      <text x="6" y="-1" fontSize="10" fontWeight="700" fill="#fff5ee" fontFamily="Space Grotesk, sans-serif">{label}</text>
      <text x="6" y="11" fontSize="8" fill="#c9b6ff" fontFamily="Inter, sans-serif">{sub}</text>
    </g>
  </g>
);

const ARSkyView = () => {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) {
        gsap.set("#ar-arc-1,#ar-arc-2,#ar-arc-3", { strokeDasharray: "4 6" });
        gsap.set("#ar-m1", { x: 110, y: 150 });
        gsap.set("#ar-m2", { x: 190, y: 250 });
        gsap.set("#ar-m3", { x: 70, y: 290 });
        return;
      }

      // Phone: rises and un-tilts as it scrolls into view
      gsap.fromTo(
        "[data-phone]",
        { rotateY: -22, rotateX: 8, y: 120, scale: 0.9 },
        {
          rotateY: 0, rotateX: 0, y: 0, scale: 1, ease: "none",
          scrollTrigger: { trigger: "[data-phone-wrap]", start: "top 95%", end: "top 25%", scrub: 0.8 },
        },
      );

      // Orbit arcs draw themselves, then flip to dashed
      gsap.utils.toArray<SVGPathElement>(".ar-arc").forEach((p, i) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(p, {
          strokeDashoffset: 0, duration: 2.2, delay: i * 0.25, ease: "power2.inOut",
          scrollTrigger: { trigger: "[data-phone-wrap]", start: "top 60%", once: true },
          onComplete: () => gsap.set(p, { strokeDasharray: "4 6", strokeDashoffset: 0 }),
        });
      });

      // Markers ride their arcs forever
      [["#ar-m1", "#ar-arc-1", 16], ["#ar-m2", "#ar-arc-2", 22], ["#ar-m3", "#ar-arc-3", 28]].forEach(([m, path, dur], i) => {
        gsap.to(m as string, {
          motionPath: { path: path as string, start: i * 0.2, end: i * 0.2 + 1 },
          duration: dur as number, repeat: -1, ease: "none",
        });
      });
      gsap.to(".ar-ping", { attr: { r: 20 }, opacity: 0, duration: 1.6, repeat: -1, ease: "power1.out" });

      // Floating chips
      gsap.to("[data-chip]", { y: "random(-10,10)", x: "random(-6,6)", duration: 3, repeat: -1, yoyo: true, ease: "sine.inOut", stagger: 0.4 });

      // Copy
      gsap.from("[data-feat]", {
        y: 40, opacity: 0, stagger: 0.12, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: "[data-feat]", start: "top 88%", once: true },
      });
    }, el);
    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section ref={root} id="features" className="relative z-10 py-24 md:py-36">
      <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 lg:grid-cols-2">
        <div>
          <SectionHead
            lines={["Point at the sky.", <span key="a" className="l-grad-text">Meet what's up there.</span>]}
            lead="Your phone becomes a window onto everything overhead: satellites, stations and planets, labelled live and drawn along their real orbits."
          />
          <dl className="mt-12 grid gap-x-10 sm:grid-cols-2">
            {features.map((f) => (
              <div key={f.title} data-feat className="l-rule py-6">
                <dt className="font-heading text-lg font-semibold">{f.title}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-[var(--l-mist)]/60">{f.body}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Phone */}
        <div data-phone-wrap className="relative mx-auto w-full max-w-[340px] [perspective:1400px]">
          <div className="absolute -inset-10 rounded-full bg-[radial-gradient(closest-side,rgba(139,107,220,0.45),transparent)] blur-2xl" aria-hidden="true" />
          <div data-phone className="relative rounded-[3rem] border border-white/20 bg-[#1a1030] p-3 shadow-[0_50px_100px_-30px_rgba(139,107,220,0.7)] [transform-style:preserve-3d]">
            <div className="absolute left-1/2 top-5 z-20 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
            <svg viewBox="0 0 300 620" className="block w-full rounded-[2.4rem]" role="img" aria-label="Phone screen showing satellites labelled in the night sky">
              <defs>
                <linearGradient id="ar-sky" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="#120a2e" />
                  <stop offset="0.45" stopColor="#3b2377" />
                  <stop offset="0.78" stopColor="#c0679f" />
                  <stop offset="1" stopColor="#ffb48f" />
                </linearGradient>
                <radialGradient id="ar-sun" cx="0.5" cy="1" r="0.8">
                  <stop offset="0" stopColor="#ffd9a0" stopOpacity="0.9" />
                  <stop offset="1" stopColor="#ffd9a0" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="300" height="620" fill="url(#ar-sky)" />
              <ellipse cx="150" cy="500" rx="200" ry="130" fill="url(#ar-sun)" />
              {stars.map((s, i) => (
                <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff5ee" opacity={s.o} />
              ))}

              {/* AR grid */}
              <g stroke="#fff" strokeOpacity="0.07">
                {[1, 2, 3, 4, 5].map((i) => <line key={`h${i}`} x1="0" x2="300" y1={i * 100} y2={i * 100} />)}
                {[1, 2].map((i) => <line key={`v${i}`} y1="0" y2="620" x1={i * 100} x2={i * 100} />)}
              </g>

              {/* Orbit arcs */}
              <g fill="none" strokeLinecap="round" strokeWidth="1.6">
                <path id="ar-arc-1" className="ar-arc" d="M-20 360 Q130 20 330 230" stroke="#ff8fb8" />
                <path id="ar-arc-2" className="ar-arc" d="M-20 150 Q160 160 330 400" stroke="#c9b6ff" />
                <path id="ar-arc-3" className="ar-arc" d="M20 520 Q80 220 330 110" stroke="#ffd9a0" />
              </g>

              <Reticle id="ar-m1" label="ISS" sub="408 km · 7.66 km/s" />
              <Reticle id="ar-m2" label="HUBBLE" sub="540 km · visible" />
              <Reticle id="ar-m3" label="STARLINK-1547" sub="550 km · 2 min" />

              {/* Horizon */}
              <path d="M0 520 L40 480 L82 505 L130 450 L186 500 L232 468 L300 510 V620 H0 Z" fill="#2a1766" />
              <path d="M0 560 L60 525 L120 552 L190 515 L250 545 L300 530 V620 H0 Z" fill="#150b33" />

              {/* HUD */}
              <g transform="translate(18 572)">
                <rect width="264" height="34" rx="17" fill="#150b33" fillOpacity="0.8" stroke="#fff" strokeOpacity="0.15" />
                <circle cx="20" cy="17" r="4" fill="#5cf2b0" />
                <text x="32" y="21" fontSize="10.5" fontWeight="600" fill="#fff5ee" fontFamily="Inter, sans-serif">3 objects overhead · tap to identify</text>
              </g>
            </svg>
          </div>

          <div data-chip className="l-glass-dark absolute -left-6 top-24 hidden rounded-2xl px-4 py-3 text-xs sm:block lg:-left-14">
            <div className="font-semibold text-[var(--l-cream)]">Next pass</div>
            <div className="text-[var(--l-lilac)]">ISS in 4 min 12 s</div>
          </div>
          <div data-chip className="l-glass-dark absolute -right-4 bottom-40 hidden rounded-2xl px-4 py-3 text-xs sm:block lg:-right-14">
            <div className="font-semibold text-[var(--l-cream)]">Elevation</div>
            <div className="text-[var(--l-gold)]">74° · NNE</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ARSkyView;
