import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { gsap, prefersReducedMotion } from "./gsap";
import { Planet } from "./art/Planet";
import { Rocket } from "./art/Craft";
import Magnet from "@/components/react-bits/Magnet";
import Aurora from "@/components/react-bits/Aurora";

const FinalCTA = () => {
  const root = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  // Keep the WebGL backdrop asleep until the section is near the viewport
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return;

      gsap.from("[data-cta-line] > span", {
        yPercent: 115, rotate: 2, stagger: 0.12, duration: 1.1, ease: "power4.out",
        scrollTrigger: { trigger: el, start: "top 65%", once: true },
      });
      gsap.from("[data-cta-fade]", {
        y: 24, opacity: 0, stagger: 0.12, duration: 0.9, delay: 0.3, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 65%", once: true },
      });

      // Planet horizon rises; rocket lifts off across the whole section
      gsap.fromTo("[data-horizon]", { yPercent: 25, scale: 0.9 }, {
        yPercent: 0, scale: 1, ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "center center", scrub: true },
      });
      gsap.fromTo("[data-launch]", { y: 360, x: -30 }, {
        y: -380, x: 40, ease: "power1.in",
        scrollTrigger: { trigger: el, start: "top 40%", end: "bottom top", scrub: 0.6 },
      });
      gsap.fromTo("[data-trail]", { scaleY: 0 }, {
        scaleY: 1, transformOrigin: "50% 0%", ease: "none",
        scrollTrigger: { trigger: el, start: "top 40%", end: "bottom top", scrub: 0.6 },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative z-10 overflow-hidden pb-0 pt-28 md:pt-44">
      <div className="pointer-events-none absolute inset-0 opacity-70 [mask-image:linear-gradient(180deg,transparent,#000_35%,#000_75%,transparent)]" aria-hidden="true">
        <Aurora colorStops={["#8b6bdc", "#ff8fb8", "#ffb48f"]} amplitude={0.9} blend={0.6} speed={0.6} paused={!visible} mouseInteraction={false} />
      </div>

      {/* Rocket */}
      <div data-launch className="pointer-events-none absolute bottom-40 left-[12%] hidden w-14 md:block" aria-hidden="true">
        <Rocket className="relative z-10 w-full" />
        <div data-trail className="absolute left-1/2 top-[88%] h-72 w-1.5 -translate-x-1/2 rounded-full bg-gradient-to-b from-[var(--l-peach)]/70 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-[clamp(2.8rem,8vw,6.5rem)] font-bold leading-[0.95]">
          <span data-cta-line className="l-mask"><span>Ready to</span></span>
          <span data-cta-line className="l-mask"><span className="l-grad-text">look up?</span></span>
        </h2>
        <p data-cta-fade className="l-lead mx-auto mt-6 max-w-lg">
          Open the dashboard and see what is flying over your head right now. It is free, it is live, and it only takes a moment.
        </p>
        <div data-cta-fade className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Magnet padding={50} magnetStrength={4} maxOffset={14}>
            <Link to="/dashboard" className="l-btn l-btn-light">
              Launch Dashboard
              <span className="l-btn-dot"><ArrowUpRight className="h-5 w-5" /></span>
            </Link>
          </Magnet>
          <Link to="/dashboard/iss" className="l-btn rounded-full border border-white/25 px-7 py-3.5 text-[var(--l-cream)] hover:bg-white/10">
            Track the ISS
          </Link>
        </div>
      </div>

      {/* Horizon planet */}
      <div data-horizon className="pointer-events-none relative mx-auto mt-16 h-[17rem] w-full overflow-hidden md:h-[26rem]" aria-hidden="true">
        <Planet variant="ember" ring className="absolute left-1/2 top-0 w-[min(150vw,1300px)] max-w-none -translate-x-1/2" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-[var(--l-night)]" />
      </div>
    </section>
  );
};

export default FinalCTA;
