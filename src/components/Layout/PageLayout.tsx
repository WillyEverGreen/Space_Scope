import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Satellite,
  Sun,
  Newspaper,
  Rocket,
  Menu,
  X,
  Home,
  ArrowLeft,
  Sparkles,
  Map,
} from 'lucide-react';

import Starfield from '@/components/SpaceScope/Starfield';
import FloatingParticles from '@/components/SpaceScope/FloatingParticles';

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
  { icon: Satellite, label: 'ISS Tracker', href: '/dashboard/iss' },
  { icon: Sun, label: 'Space Weather', href: '/dashboard/weather' },
  { icon: Sparkles, label: 'APOD', href: '/dashboard/apod' },
  { icon: Newspaper, label: 'News', href: '/dashboard/news' },
  { icon: Rocket, label: 'Missions', href: '/dashboard/missions' },
  { icon: Map, label: 'Sky Events Map', href: '/dashboard/skymap' },
];

const PageLayout = ({ children, title, subtitle }: PageLayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Background Effects */}
      <Starfield />
      <FloatingParticles />
      <div className="noise-overlay" />
      <div className="vignette" />

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 glass-card border-r border-star-white/10 z-40 hidden lg:block">
        <div className="p-6 h-full flex flex-col">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-8 group">
            <img 
              src="/SpaceScope.png" 
              alt="SpaceScope" 
              className="w-10 h-10 rounded-xl group-hover:scale-105 transition-transform"
            />
            <div>
              <span className="font-heading font-bold text-star-white text-lg">SpaceScope</span>
              <p className="text-xs text-muted-foreground">Mission Control</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="space-y-1 flex-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                    isActive
                      ? 'bg-cosmic-glow/20 text-star-white border border-cosmic-glow/30'
                      : 'text-star-white/70 hover:text-star-white hover:bg-star-white/10'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-cosmic-glow' : 'group-hover:text-cosmic-glow'} transition-colors`} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Back to Home */}
          <div className="pt-8 border-t border-star-white/10">
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-star-white hover:bg-star-white/10 transition-all group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:text-cosmic-glow transition-colors" />
              <span className="font-medium">Back to Home</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 lg:hidden">
        <div className="glass-card border-b border-star-white/10 p-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img 
                src="/SpaceScope.png" 
                alt="SpaceScope" 
                className="w-10 h-10 rounded-xl"
              />
              <span className="font-heading font-bold text-star-white">SpaceScope</span>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-star-white"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card border-b border-star-white/10 p-4"
            >
              <nav className="space-y-2">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-cosmic-glow/20 text-star-white'
                          : 'text-star-white/70 hover:text-star-white hover:bg-star-white/10'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-star-white hover:bg-star-white/10 transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="font-medium">Back to Home</span>
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="lg:ml-64 relative z-10">
        <div className="p-4 lg:p-8 pt-20 lg:pt-8 min-h-screen">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-heading text-3xl lg:text-4xl text-star-white mb-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-muted-foreground">{subtitle}</p>
            )}
          </motion.div>

          {/* Page Content */}
          {children}

          {/* Footer */}
          <footer className="mt-12 pt-8 border-t border-star-white/10 text-center">
            <p className="text-muted-foreground text-sm">
              Data sourced from NASA, NOAA, Open Notify, and Spaceflight News API
            </p>
            <p className="text-muted-foreground text-xs mt-2">
              SpaceScope © {new Date().getFullYear()}. Explore the cosmos.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default PageLayout;
