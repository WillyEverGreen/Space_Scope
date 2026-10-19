import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ChevronDown, Play } from "lucide-react";
import { gsap, prefersReducedMotion } from "./gsap";
import Magnet from "@/components/react-bits/Magnet";

/**
 * Hero: the supplied scene image is the artwork; everything here is type and buttons
 * laid over it, animated in with a single GSAP timeline.
 */
const LandingHero = () => {
  const root = useRef<HTMLElement>(null);
  const bg = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return;

      const tl = gsap.timeline({ paused: true, defaults: { ease: "power4.out" } });
      tl.from(bg.current, { scale: 1.18, duration: 2.4, ease: "power3.out" }, 0)
        .from("[data-hero-line] > span", { yPercent: 115, rotate: 3, duration: 1.2, stagger: 0.12 }, 0.6)
        .from("[data-hero-sub]", { y: 28, opacity: 0, duration: 0.9 }, 1.1)
        .from("[data-hero-cta] > *", { y: 28, opacity: 0, stagger: 0.1, duration: 0.8 }, 1.25)
        .from("[data-hero-scroll]", { opacity: 0, duration: 1 }, 2);

      // Start once the artwork has decoded so the scale-in never stutters
      const img = el.querySelector("img");
      const go = () => tl.play();
      if (img && !img.complete) {
        gsap.set(bg.current, { opacity: 0 });
        const reveal = () => {
          gsap.to(bg.current, { opacity: 1, duration: 0.6, ease: "power1.out" });
          go();
        };
        img.addEventListener("load", reveal, { once: true });
        gsap.delayedCall(2.5, () => tl.paused() && reveal());
      } else {
        go();
      }

      // Parallax: image drifts slower than the page, copy lifts away
      gsap.to(bg.current, {
        yPercent: 14,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(content.current, {
        y: -90,
        opacity: 0.1,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "70% top", scrub: true },
      });
      gsap.to("[data-hero-scroll] svg", { y: 8, repeat: -1, yoyo: true, duration: 0.9, ease: "sine.inOut" });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="top" className="relative h-[100svh] min-h-[680px] overflow-hidden bg-[#8d78d8]">
      {/* Artwork */}
      <div ref={bg} className="absolute -top-[2%] inset-x-0 h-[110%] will-change-transform">
        <img
          src="/hero-scene.webp"
          alt="An astronaut relaxing in an armchair with a laptop beside a lavender lake at sunset, with a giant planet rising behind"
          className="h-full w-full object-cover object-[70%_bottom] md:object-center"
          {...{ fetchpriority: "high" }}
        />
      </div>

      {/* Legibility veil on the text side + blend into the next section */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(95deg,rgba(255,244,250,0.55)_0%,rgba(255,236,248,0.22)_38%,transparent_62%)] max-md:bg-[linear-gradient(180deg,rgba(255,244,250,0.5)_0%,transparent_60%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-[var(--l-dusk)]" />

      <div ref={content} className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-start px-6 pb-24 pt-32 md:justify-center md:pt-28">
        <h1 className="text-[clamp(2.9rem,7.4vw,6.4rem)] font-bold leading-[0.96] text-[var(--l-ink)]">
          <span data-hero-line className="l-mask"><span>See the</span></span>
          <span data-hero-line className="l-mask"><span>Invisible</span></span>
          <span data-hero-line className="l-mask"><span>Universe</span></span>
        </h1>

        <p data-hero-sub className="mt-7 max-w-[15rem] text-base sm:max-w-md font-medium leading-relaxed text-[var(--l-ink-soft)] md:text-lg">
          Track satellites, predict cosmic events and explore the night sky in real-time augmented reality.
        </p>

        <div data-hero-cta className="mt-8 flex flex-wrap items-center gap-3">
          <Magnet padding={50} magnetStrength={4} maxOffset={14}>
            <Link to="/dashboard" className="l-btn l-btn-dark">
              Launch Dashboard
              <span className="l-btn-dot"><ArrowUpRight className="h-5 w-5" /></span>
            </Link>
          </Magnet>
          <Magnet padding={50} magnetStrength={4} maxOffset={14}>
            <a href="#features" className="l-btn l-btn-ghost">
              <span className="l-btn-dot"><Play className="h-4 w-4 fill-current" /></span>
              Explore features
            </a>
          </Magnet>
        </div>
      </div>

      <a data-hero-scroll href="#features" aria-label="Scroll to features" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-[var(--l-ink)]/70 lg:block">
        <ChevronDown className="h-6 w-6" />
      </a>
    </section>
  );
};

export default LandingHero;
