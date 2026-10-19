import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { gsap, prefersReducedMotion } from "./gsap";
import SectionHead from "./SectionHead";

const tools = [
  {
    title: "ISS Tracker",
    to: "/dashboard/iss",
    body: "Follow the station across a world map with its live position and ground track, refreshed every few seconds.",
    source: "Open Notify",
  },
  {
    title: "Space Weather",
    to: "/dashboard/weather",
    body: "Kp index, solar wind and X-ray flux in one view, with recent solar flares and geomagnetic storms.",
    source: "NOAA SWPC · NASA DONKI",
  },
  {
    title: "Sky Events Map",
    to: "/dashboard/skymap",
    body: "See where aurora and other sky events are visible tonight and find the best place to watch from.",
    source: "Regional visibility",
  },
  {
    title: "Picture of the Day",
    to: "/dashboard/apod",
    body: "NASA's daily astronomy image with the full explanation, in high resolution.",
    source: "NASA APOD",
  },
  {
    title: "Space News",
    to: "/dashboard/news",
    body: "Headlines from across the space industry, searchable and filterable by topic.",
    source: "Spaceflight News API",
  },
  {
    title: "Missions",
    to: "/dashboard/missions",
    body: "Active and upcoming missions to the Moon, Mars and beyond, with goals and status at a glance.",
    source: "NASA · ESA · SpaceX",
  },
];

const Toolkit = () => {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-tool]", {
        y: 40, opacity: 0, stagger: 0.09, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: "[data-tool-list]", start: "top 82%", once: true },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="toolkit" className="relative z-10 py-24 md:py-36">
      <div className="mx-auto grid max-w-6xl gap-14 px-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHead
            lines={["Six tools,", <span key="a" className="l-grad-text">one dashboard.</span>]}
            lead="Everything you need to follow what is happening above you, built on public data from NASA, NOAA and ESA."
          />
          <div className="mt-10">
              <Link to="/dashboard" className="l-btn l-btn-light">
                Open the dashboard
                <span className="l-btn-dot"><ArrowUpRight className="h-5 w-5" /></span>
              </Link>
          </div>
        </div>

        <ol data-tool-list className="border-b border-white/[0.14]">
          {tools.map((t, i) => (
            <li key={t.title} data-tool className="l-rule">
              <Link to={t.to} className="group grid grid-cols-[auto_1fr_auto] items-start gap-x-5 py-7 transition-[padding] duration-500 hover:pl-3 sm:gap-x-8">
                <span className="pt-1.5 font-heading text-sm font-medium tabular-nums text-[var(--l-mist)]/40">0{i + 1}</span>
                <div>
                  <h3 className="font-heading text-2xl font-semibold md:text-3xl">{t.title}</h3>
                  <p className="mt-2 max-w-md text-[0.95rem] leading-relaxed text-[var(--l-mist)]/60">{t.body}</p>
                  <p className="mt-3 text-xs text-[var(--l-mist)]/40">{t.source}</p>
                </div>
                <span className="mt-1 grid h-11 w-11 place-items-center rounded-full border border-white/20 text-[var(--l-cream)] transition-all duration-500 group-hover:border-[var(--l-cream)] group-hover:bg-[var(--l-cream)] group-hover:text-[var(--l-ink)]">
                  <ArrowUpRight className="h-5 w-5 transition-transform duration-500 group-hover:rotate-45" />
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default Toolkit;
