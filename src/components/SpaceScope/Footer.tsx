import { motion } from "framer-motion";
import { Telescope, Github, Twitter, Mail, Heart } from "lucide-react";

const Footer = () => {
  const footerLinks = {
    product: [
      { label: "Features", href: "#features" },
      { label: "AR View", href: "#ar" },
      { label: "Timeline", href: "#timeline" },
      { label: "Pricing", href: "#pricing" },
    ],
    resources: [
      { label: "Documentation", href: "#docs" },
      { label: "API", href: "#api" },
      { label: "Guides", href: "#guides" },
      { label: "Blog", href: "#blog" },
    ],
    company: [
      { label: "About", href: "#about" },
      { label: "Careers", href: "#careers" },
      { label: "Contact", href: "#contact" },
      { label: "Press", href: "#press" },
    ],
  };

  return (
    <footer className="relative bg-space-deep border-t border-border/20">
      {/* Top line (Removed gradient) */}
      <div className="absolute top-0 left-0 right-0 h-px bg-cosmic-glow/20" />

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <a href="#" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cosmic-glow flex items-center justify-center">
                <Telescope className="w-5 h-5 text-star-white" />
              </div>
              <span className="text-xl font-heading font-bold text-star-white">
                Space<span className="text-gradient">Scope</span>
              </span>
            </a>
            <p className="text-sm text-muted-foreground max-w-xs mb-6">
              Your personal window to the cosmos. Track satellites, predict
              events, and explore space in real-time AR.
            </p>
            <div className="flex items-center gap-4">
              {[
                { icon: Twitter, href: "#" },
                { icon: Github, href: "#" },
                { icon: Mail, href: "#" },
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-cosmic-glow hover:bg-cosmic-glow/10 transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-heading font-semibold text-star-white mb-4 capitalize">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-cosmic-glow transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-cosmic-pink" /> for space
            enthusiasts
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-star-white transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-star-white transition-colors"
            >
              Terms
            </a>
            <span className="text-sm text-muted-foreground">
              © 2024 SpaceScope
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
