import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LayoutDashboard } from "lucide-react";

const navItems = [
  { label: "Features", href: "#features" },
  { label: "Timeline", href: "#timeline" },
  { label: "Learn", href: "#learn" },
  { label: "Dashboard", href: "/dashboard", isRoute: true },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "py-3 bg-space-deep/80 backdrop-blur-xl border-b border-border/20"
            : "py-5 bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href="#" className="flex items-center gap-2 group">
              <img 
                src="/SpaceScope.png" 
                alt="SpaceScope" 
                className="w-10 h-10 rounded-xl group-hover:scale-105 transition-transform"
              />
              <span className="text-xl font-heading font-bold text-star-white hidden sm:block">
                SpaceScope
              </span>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                item.isRoute ? (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="text-sm font-medium text-star-white/70 hover:text-star-white transition-colors relative group"
                  >
                    {item.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cosmic-glow group-hover:w-full transition-all duration-300" />
                  </Link>
                ) : (
                  <a
                    key={item.label}
                    href={item.href}
                    className="text-sm font-medium text-star-white/70 hover:text-star-white transition-colors relative group"
                  >
                    {item.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cosmic-glow group-hover:w-full transition-all duration-300" />
                  </a>
                )
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden md:block">
              <Link to="/dashboard" className="btn-cosmic py-2.5 px-6 text-sm">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Launch Dashboard
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-star-white"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-space-deep/95 backdrop-blur-xl md:hidden pt-24"
          >
            <div className="container mx-auto px-4">
              <div className="flex flex-col gap-6">
                {navItems.map((item, index) => (
                  item.isRoute ? (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-2xl font-heading font-semibold text-star-white py-3 border-b border-border/20 block"
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  ) : (
                    <motion.a
                      key={item.label}
                      href={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-2xl font-heading font-semibold text-star-white py-3 border-b border-border/20"
                    >
                      {item.label}
                    </motion.a>
                  )
                ))}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="btn-cosmic mt-4 inline-flex"
                  >
                    <LayoutDashboard className="w-5 h-5 mr-2" />
                    Launch Dashboard
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Dashboard Button (appears after scroll) */}
      <AnimatePresence>
        {isScrolled && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 md:hidden"
          >
            <Link to="/dashboard" className="btn-cosmic py-3 px-5 text-sm shadow-2xl">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
