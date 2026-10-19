import { Link } from "react-router-dom";
import { ArrowUp, Github, Mail, Twitter } from "lucide-react";

const columns = [
  {
    title: "Explore",
    links: [
      { label: "Dashboard", to: "/dashboard" },
      { label: "ISS Tracker", to: "/dashboard/iss" },
      { label: "Sky Events Map", to: "/dashboard/skymap" },
      { label: "Missions", to: "/dashboard/missions" },
    ],
  },
  {
    title: "Live data",
    links: [
      { label: "Space Weather", to: "/dashboard/weather" },
      { label: "Picture of the Day", to: "/dashboard/apod" },
      { label: "Space News", to: "/dashboard/news" },
    ],
  },
  {
    title: "On this page",
    links: [
      { label: "Features", href: "#features" },
      { label: "Live Orbit", href: "#orbit" },
      { label: "Timeline", href: "#timeline" },
      { label: "Learn", href: "#learn" },
    ],
  },
];

const linkCls = "inline-block py-1.5 text-sm text-[var(--l-mist)]/60 transition-colors hover:text-white";

const Footer = () => (
  <footer className="relative z-10 overflow-hidden border-t border-white/10 bg-[var(--l-night)]">
    <div className="mx-auto max-w-6xl px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-14 sm:pt-16">
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-[1.4fr_repeat(3,1fr)] lg:gap-x-12">
        <div className="col-span-2 sm:col-span-3 md:col-span-1">
          <a href="#top" className="flex items-center gap-2.5">
            <img src="/SpaceScope.png" alt="" className="h-10 w-10 rounded-full object-cover" />
            <span className="font-heading text-xl font-bold">SpaceScope</span>
          </a>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--l-mist)]/60">
            Your personal window to the cosmos. Track satellites, predict cosmic events and explore the sky in real-time AR.
          </p>
          <div className="mt-6 flex gap-2">
            {[
              { icon: Twitter, label: "Twitter" },
              { icon: Github, label: "GitHub" },
              { icon: Mail, label: "Email" },
            ].map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-[var(--l-mist)]/70 transition-all hover:-translate-y-0.5 hover:border-[var(--l-pink)] hover:text-white"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-widest text-[var(--l-lilac)]">{col.title}</h4>
            <ul className="mt-4 space-y-1">
              {col.links.map((l) => (
                <li key={l.label}>
                  {"to" in l ? (
                    <Link to={l.to} className={linkCls}>{l.label}</Link>
                  ) : (
                    <a href={l.href} className={linkCls}>{l.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-xs text-[var(--l-mist)]/45 sm:flex-row sm:items-center">
        <span>© {new Date().getFullYear()} SpaceScope. Data courtesy of NASA, NOAA and ESA.</span>
        <a href="#top" className="inline-flex items-center gap-1.5 py-1 font-medium text-[var(--l-mist)]/70 transition-colors hover:text-white">
          Back to top <ArrowUp className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>

    <div className="pointer-events-none select-none px-4 text-center font-heading text-[clamp(3rem,14vw,14rem)] font-bold leading-[0.8] tracking-tighter text-transparent [-webkit-text-stroke:1px_rgba(201,182,255,0.18)]" aria-hidden="true">
      SpaceScope
    </div>
  </footer>
);

export default Footer;
