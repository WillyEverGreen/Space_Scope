import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  LayoutDashboard,
  Map,
  Menu,
  Newspaper,
  Rocket,
  Satellite,
  Sparkles,
  Sun,
  X,
} from 'lucide-react';

import '@/styles/landing.css';
import SkyStars from '@/components/SpaceScope/SkyStars';

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
  { icon: Satellite, label: 'ISS Tracker', href: '/dashboard/iss' },
  { icon: Sun, label: 'Space Weather', href: '/dashboard/weather' },
  { icon: Map, label: 'Sky Events Map', href: '/dashboard/skymap' },
  { icon: Sparkles, label: 'Picture of the Day', href: '/dashboard/apod' },
  { icon: Newspaper, label: 'News', href: '/dashboard/news' },
  { icon: Rocket, label: 'Missions', href: '/dashboard/missions' },
];

const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { pathname } = useLocation();
  return (
    <nav className="space-y-1" aria-label="Dashboard">
      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
              active ? 'bg-white/10 text-star-white' : 'text-star-white/60 hover:bg-white/5 hover:text-star-white'
            }`}
          >
            <item.icon
              className={`h-[18px] w-[18px] transition-colors ${active ? 'text-cosmic-pink' : 'group-hover:text-cosmic-glow'}`}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};

const Brand = () => (
  <Link to="/" className="flex items-center gap-2.5" aria-label="SpaceScope home">
    <img src="/SpaceScope.png" alt="" className="h-9 w-9 rounded-full object-cover" />
    <div className="leading-tight">
      <span className="block font-heading text-lg font-bold text-star-white">SpaceScope</span>
      <span className="block text-[0.7rem] text-star-white/50">Mission Control</span>
    </div>
  </Link>
);

const PageLayout = ({ children, title, subtitle }: PageLayoutProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  // Close the drawer on navigation and lock page scroll while it is open
  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <div className="landing relative min-h-screen overflow-x-clip bg-space-navy">
      <SkyStars density={0.7} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(60%_100%_at_75%_0%,hsl(var(--nebula-purple)/0.3),transparent)]" />

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/10 bg-sidebar/90 p-5 backdrop-blur-xl lg:flex">
        <Brand />
        <div className="mt-8 flex-1 overflow-y-auto">
          <NavLinks />
        </div>
        <Link
          to="/"
          className="mt-4 flex items-center gap-3 rounded-xl border-t border-white/10 px-3.5 pt-5 text-sm font-medium text-star-white/60 transition-colors hover:text-star-white"
        >
          <ArrowLeft className="h-[18px] w-[18px]" />
          Back to home
        </Link>
      </aside>

      {/* Mobile header */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-sidebar/90 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Brand />
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-star-white"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="max-h-[calc(100svh-4.5rem)] overflow-y-auto border-t border-white/10 p-4"
            >
              <NavLinks onNavigate={() => setMenuOpen(false)} />
              <Link to="/" className="mt-3 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-star-white/60">
                <ArrowLeft className="h-[18px] w-[18px]" />
                Back to home
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="relative z-10 lg:ml-64">
        <div className="min-h-screen px-4 pb-10 pt-24 sm:px-6 lg:px-10 lg:pt-12">
          <div className="mx-auto max-w-7xl">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-9">
              <h1 className="font-heading text-3xl font-bold tracking-tight text-star-white sm:text-4xl lg:text-5xl">{title}</h1>
              {subtitle && <p className="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p>}
            </motion.div>

            {children}

            <footer className="mt-14 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-star-white/45 sm:flex-row sm:items-center sm:justify-between">
              <p>Data from NASA, NOAA, wheretheiss.at and the Spaceflight News API.</p>
              <p>© {new Date().getFullYear()} SpaceScope</p>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PageLayout;
