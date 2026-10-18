import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "./gsap";

const navItems = [
  { label: "Features", href: "#features" },
  { label: "Live Orbit", href: "#orbit" },
  { label: "Toolkit", href: "#toolkit" },
  { label: "Timeline", href: "#timeline" },
  { label: "Learn", href: "#learn" },
];

const Navbar = () => {
  const barRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  // Intro, compaction on scroll, and active-section tracking
  useLayoutEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const ctx = gsap.context(() => {
      if (!prefersReducedMotion()) {
        gsap.from(bar, { y: -80, opacity: 0, duration: 1, delay: 0.3, ease: "power4.out" });
      }
      ScrollTrigger.create({
        start: 80,
        onUpdate: (self) => {
          gsap.to(bar, {
            maxWidth: self.scroll() > 80 ? 860 : 1152,
            duration: 0.5,
            ease: "power3.out",
            overwrite: "auto",
          });
        },
      });
      navItems.forEach(({ href }, i) => {
        const target = document.querySelector(href);
        if (!target) return;
        ScrollTrigger.create({
          trigger: target,
          start: "top 55%",
          end: "bottom 55%",
          // Refresh after the pinned timeline has added its spacer, or later sections measure too early
          refreshPriority: -1,
          onToggle: (self) => self.isActive && setActive(href),
          onLeaveBack: i === 0 ? () => setActive("") : undefined,
        });
      });
    }, bar);
    return () => ctx.revert();
  }, []);

  // Mobile menu reveal
  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      gsap.fromTo(menu, { clipPath: "circle(0% at 92% 4%)" }, { clipPath: "circle(150% at 92% 4%)", duration: 0.8, ease: "power3.inOut" });
      gsap.fromTo(
        menu.querySelectorAll("[data-item]"),
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.07, delay: 0.3, duration: 0.6, ease: "power3.out" },
      );
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <div
        ref={barRef}
        className="mx-auto flex max-w-6xl bg-[#1a1030]/90 backdrop-blur-md border border-white/10 items-center justify-between rounded-full py-2 pl-3 pr-2 shadow-[0_20px_60px_-20px_rgba(12,6,32,0.6)]"
      >
        <a href="#top" className="flex items-center gap-2.5 pr-4" aria-label="SpaceScope home">
          <img src="/SpaceScope.png" alt="" className="h-9 w-9 rounded-full object-cover" />
          <span className="font-heading text-lg font-bold tracking-tight text-[var(--l-cream)]">SpaceScope</span>
        </a>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                active === item.href
                  ? "bg-white/15 text-white"
                  : "text-[var(--l-mist)]/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/dashboard"
            className="l-btn hidden items-center gap-2 bg-[var(--l-cream)] py-2.5 pl-5 pr-2.5 text-sm text-[var(--l-ink)] sm:inline-flex"
          >
            Open Dashboard
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--l-ink)] text-[var(--l-cream)]">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div
          ref={menuRef}
          className="fixed inset-0 -z-10 flex flex-col justify-center bg-[var(--l-night)] px-8 lg:hidden"
          style={{ background: "radial-gradient(120% 80% at 80% 0%, #3b2377 0%, #150b33 55%, #0c0620 100%)" }}
        >
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href} data-item>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-white/10 py-4 font-heading text-4xl font-bold text-[var(--l-cream)]"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div data-item className="mt-10">
            <Link to="/dashboard" className="l-btn l-btn-light" onClick={() => setOpen(false)}>
              Open Dashboard
              <span className="l-btn-dot">
                <ArrowUpRight className="h-5 w-5" />
              </span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
