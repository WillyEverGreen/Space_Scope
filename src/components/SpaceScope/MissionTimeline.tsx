import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "./gsap";
import SectionHead from "./SectionHead";
import { Planet } from "./art/Planet";
import { Moon, Rocket } from "./art/Craft";

type Status = "completed" | "active" | "upcoming";

interface Mission {
  id: string;
  name: string;
  year: number;
  target: string;
  goal: string;
  impact: string;
  status: Status;
  art: "moon" | "violet" | "ice" | "ember";
}

const missions: Mission[] = [
  { id: "apollo", name: "Apollo 11", year: 1969, target: "Moon", goal: "First human moon landing", impact: "Proved human space exploration possible", status: "completed", art: "moon" },
  { id: "voyager", name: "Voyager 1", year: 1977, target: "Interstellar Space", goal: "Study outer planets and beyond", impact: "First object to leave our solar system", status: "active", art: "ice" },
  { id: "hubble", name: "Hubble Telescope", year: 1990, target: "Earth Orbit", goal: "Deep space observation", impact: "Revolutionized our view of the universe", status: "active", art: "violet" },
  { id: "jwst", name: "James Webb", year: 2021, target: "L2 Lagrange Point", goal: "Infrared deep space observation", impact: "Seeing the earliest galaxies ever", status: "active", art: "ice" },
  { id: "artemis", name: "Artemis III", year: 2025, target: "Moon", goal: "Return humans to lunar surface", impact: "First woman on the Moon", status: "upcoming", art: "moon" },
  { id: "mars", name: "Mars Sample Return", year: 2031, target: "Mars", goal: "Bring Martian samples to Earth", impact: "Search for ancient life on Mars", status: "upcoming", art: "ember" },
];

const statusStyle: Record<Status, { label: string; dot: string }> = {
  completed: { label: "Completed", dot: "bg-[var(--l-mist)]/50" },
  active: { label: "Active", dot: "bg-[#5cf2b0]" },
  upcoming: { label: "Upcoming", dot: "bg-[var(--l-gold)]" },
};

const MissionTimeline = () => {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();

    mm.add(
      { desktop: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)", mobile: "(max-width: 1023px)" },
      (c) => {
        const { desktop } = c.conditions as { desktop: boolean };
        if (prefersReducedMotion()) return;

        if (desktop) {
          const track = el.querySelector<HTMLElement>("[data-track-x]")!;
          const fill = el.querySelector<HTMLElement>("[data-fill]")!;
          const rocket = el.querySelector<HTMLElement>("[data-rocket]")!;
          const setRocket = gsap.quickSetter(rocket, "left", "%");
          const dist = () => Math.max(0, track.scrollWidth - window.innerWidth + 96);

          gsap.to(track, {
            x: () => -dist(),
            ease: "none",
            scrollTrigger: {
              trigger: "[data-pin]",
              pin: true,
              scrub: 0.8,
              start: "top top",
              end: () => `+=${dist() + 200}`,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                gsap.set(fill, { scaleX: self.progress });
                setRocket(self.progress * 100);
              },
            },
          });
          gsap.from("[data-mcard]", { y: 60, opacity: 0, stagger: 0.08, duration: 1, ease: "power3.out", scrollTrigger: { trigger: "[data-pin]", start: "top 70%", once: true } });
        } else {
          gsap.utils.toArray<HTMLElement>("[data-mcard]").forEach((card) =>
            gsap.from(card, { y: 50, opacity: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: card, start: "top 88%", once: true } }),
          );
        }
      },
    );

    return () => {
      mm.revert();
    };
  }, []);

  return (
    <section ref={root} id="timeline" className="relative z-10">
      <div data-pin className="flex flex-col justify-center py-24 lg:min-h-screen lg:overflow-hidden lg:py-0">
        <div className="mx-auto w-full max-w-6xl px-6 lg:pt-20">
          <SectionHead
            lines={["Six journeys that", <span key="a" className="l-grad-text">changed the sky.</span>]}
            lead="From the first footprints to samples coming home from Mars, follow humanity's boldest missions as they unfold."
          />
        </div>

        <div data-track-x className="mt-12 flex flex-col gap-5 px-6 lg:w-max lg:flex-row lg:gap-6 lg:pl-[max(1.5rem,calc(50vw-36rem))] lg:pr-24">
          {missions.map((m, i) => {
            const st = statusStyle[m.status];
            return (
              <article key={m.id} data-mcard className="l-card flex min-h-[20rem] flex-col p-7 lg:w-[26rem] lg:shrink-0">
                <div className="pointer-events-none absolute -right-12 top-10 h-44 w-44 opacity-90" aria-hidden="true">
                  {m.art === "moon" ? <Moon className="h-full w-full" /> : <Planet variant={m.art} className="h-full w-full" />}
                </div>
                <div className="relative z-10 flex items-center justify-between">
                  <span className="font-heading text-sm font-semibold text-[var(--l-mist)]/50">0{i + 1}</span>
                  <span className="inline-flex items-center gap-2 text-xs font-medium text-[var(--l-mist)]/70"><span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />{st.label}</span>
                </div>
                <div className="relative mt-auto pt-16">
                  <div className="font-heading text-6xl font-bold leading-none text-transparent [-webkit-text-stroke:1px_rgba(201,182,255,0.55)]">{m.year}</div>
                  <h3 className="mt-4 font-heading text-2xl font-bold">{m.name}</h3>
                  <p className="mt-1 text-sm text-[var(--l-lilac)]">{m.target}</p>
                  <p className="mt-4 text-[0.95rem] text-[var(--l-cream)]/90">{m.goal}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-[var(--l-mist)]/60">{m.impact}</p>
                </div>
              </article>
            );
          })}
        </div>

        {/* Progress line with rocket (desktop pin only) */}
        <div className="mx-auto mt-12 hidden w-full max-w-6xl px-6 lg:block">
          <div className="relative h-1 rounded-full bg-white/10">
            <div data-fill className="absolute inset-y-0 left-0 w-full origin-left scale-x-0 rounded-full bg-[var(--l-lilac)]" />
            <div data-rocket className="absolute -top-5 left-0 -translate-x-1/2">
              <Rocket className="h-12 w-6 rotate-90" />
            </div>
          </div>
          <div className="mt-4 flex justify-between text-xs font-medium text-[var(--l-mist)]/45">
            <span>1969</span>
            <span>2031</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionTimeline;
