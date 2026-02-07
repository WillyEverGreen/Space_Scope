import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import Earth from "./Earth";
import { ChevronDown, Sparkles, Rocket } from "lucide-react";

const Hero = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const earthScale = useTransform(scrollYProgress, [0, 1], [1, 0.5]);
  const earthY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const earthOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.5], [0, -100]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-[200vh] flex flex-col items-center justify-start pt-20 md:pt-32 overflow-hidden"
    >
      {/* Background (Removed gradient) */}
      <div className="absolute inset-0 bg-space-navy" />

      {/* Aurora effect */}
      <div className="aurora" />

      {/* Content container */}
      <div className="relative z-10 container mx-auto px-4 flex flex-col items-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6 md:mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-glow">
            <Sparkles className="w-4 h-4 text-cosmic-glow" />
            <span className="text-sm font-medium text-star-white/90">
              Your Personal Window to the Cosmos
            </span>
          </div>
        </motion.div>

        {/* Main Headline */}
        <motion.div
          style={{ y: textY, opacity: textOpacity }}
          className="text-center mb-8 md:mb-12"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30, filter: "blur(20px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl md:text-6xl lg:text-8xl font-heading font-bold mb-4 md:mb-6 leading-tight"
          >
            <span className="text-star-white">See the </span>
            <span className="text-gradient">Invisible</span>
            <br />
            <span className="text-star-white">Universe</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8 md:mb-12 px-4"
          >
            Track satellites, predict cosmic events, and explore space in
            real-time AR
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/dashboard" className="btn-cosmic group">
              <span className="relative z-10 flex items-center gap-2">
                <Rocket className="w-5 h-5 transition-transform group-hover:rotate-12" />
                Launch Dashboard
              </span>
            </Link>
            <button className="btn-ghost-cosmic">
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Explore Features
              </span>
            </button>
          </motion.div>
        </motion.div>

        {/* Earth */}
        <motion.div className="relative mt-8 md:mt-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <Earth />
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-sm text-muted-foreground">Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown className="w-6 h-6 text-cosmic-glow" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
