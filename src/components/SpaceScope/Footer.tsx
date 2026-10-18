import { Link } from "react-router-dom";
import { Github, Mail, Twitter } from "lucide-react";

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

const linkCls = "text-sm transition-colors hover:text-white";

const Footer = () => (
  <footer className="relative z-10 overflow-hidden border-t border-white/10 bg-(--l-night)">
    <div className="mx-auto max-w-6xl px-6 pb-10 pt-16">
      <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <a href="#top" className="flex items-center gap-2.5">
            <img src="/SpaceScope.png" alt="" className="h-10 w-10 rounded-full object-cover" />
            <span className="font-heading text-xl font-bold">SpaceScope</span>
          </a>
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
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
                className="grid h-10 w-10 place-items-center rounded-full border border-white/15 transition-all hover:-translate-y-0.5 hover:border-(--l-pink) hover:text-white"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-widest text-(--l-lilac)">{col.title}</h4>
            <ul className="mt-5 space-y-3">
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

      <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs sm:flex-row">
        <span>© {new Date().getFullYear()} SpaceScope. Data courtesy of NASA, NOAA and ESA.</span>
        <span>Built for people who look up.</span>
      </div>
    </div>

    <div className="pointer-events-none select-none px-4 text-center font-heading text-[clamp(3rem,15vw,15rem)] font-bold leading-[0.8] tracking-tighter text-transparent [-webkit-text-stroke:1px_rgba(201,182,255,0.18)]" aria-hidden="true">
      SpaceScope
    </div>
  </footer>
);

export default Footer;
