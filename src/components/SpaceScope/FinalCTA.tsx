import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Rocket, Sparkles, LayoutDashboard } from "lucide-react";

const FinalCTA = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [isLaunching, setIsLaunching] = useState(false);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const rocketY = useTransform(scrollYProgress, [0.3, 0.7], [50, 0]);
  const rocketScale = useTransform(scrollYProgress, [0.3, 0.7], [0.9, 1]);

  const handleLaunch = () => {
    setIsLaunching(true);
    setTimeout(() => setIsLaunching(false), 2000);
  };

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center justify-center py-20 md:py-32 overflow-hidden"
    >
      {/* Background (Removed gradients) */}
      <div className="absolute inset-0 bg-space-navy">
        {/* Distant galaxy (Simplified) */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 opacity-30 blur-3xl bg-cosmic-purple/20" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Rocket */}
          <motion.div
            style={{ y: rocketY, scale: rocketScale }}
            className="relative mb-12"
          >
            <motion.div
              animate={
                isLaunching
                  ? {
                      y: -500,
                      scale: 0.5,
                      opacity: 0,
                    }
                  : {}
              }
              transition={{ duration: 1.5, ease: "easeIn" }}
              className="relative inline-block"
            >
              {/* Rocket body */}
              <div className="relative w-24 h-40 md:w-32 md:h-52">
                {/* Main body (Removed gradient) */}
                <div
                  className="absolute inset-x-4 top-0 bottom-8 rounded-t-full bg-star-white"
                  style={{
                    boxShadow:
                      "inset -5px 0 10px rgba(0,0,0,0.2), inset 5px 0 10px rgba(255,255,255,0.3)",
                  }}
                />

                {/* Window */}
                <div className="absolute left-1/2 -translate-x-1/2 top-1/4 w-6 h-6 md:w-8 md:h-8 rounded-full bg-cosmic-glow border-2 border-star-white/80">
                  <div className="absolute inset-1 rounded-full bg-cosmic-glow" />
                </div>

                {/* Fins */}
                <div className="absolute -left-3 bottom-8 w-4 h-10 bg-cosmic-glow rounded-l-lg transform skew-y-12" />
                <div className="absolute -right-3 bottom-8 w-4 h-10 bg-cosmic-glow rounded-r-lg transform -skew-y-12" />

                {/* Exhaust (Simplified) */}
                <motion.div
                  className="absolute left-1/2 -translate-x-1/2 bottom-0 w-8 h-12"
                  animate={
                    isLaunching
                      ? { scaleY: [1, 3, 1], opacity: [0.8, 1, 0.8] }
                      : { scaleY: [1, 1.2, 1], opacity: [0.6, 0.8, 0.6] }
                  }
                  transition={{
                    duration: isLaunching ? 0.2 : 0.8,
                    repeat: Infinity,
                  }}
                >
                  <div
                    className="w-full h-full bg-cosmic-gold"
                    style={{
                      clipPath: "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)",
                      filter: "blur(2px)",
                    }}
                  />
                </motion.div>
              </div>

              {/* Smoke particles */}
              {isLaunching && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-3 h-3 rounded-full bg-star-white/30"
                      initial={{ x: 0, y: 0, scale: 1, opacity: 0.6 }}
                      animate={{
                        x: (Math.random() - 0.5) * 100,
                        y: Math.random() * 100 + 50,
                        scale: Math.random() * 2 + 1,
                        opacity: 0,
                      }}
                      transition={{
                        duration: 1 + Math.random(),
                        delay: i * 0.05,
                        ease: "easeOut",
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Glow effect */}
              <div className="absolute inset-0 -z-10 blur-3xl opacity-50">
                <div className="absolute inset-0 bg-gradient-to-b from-cosmic-glow/40 to-cosmic-gold/40" />
              </div>
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-heading font-bold mb-6">
              <span className="text-star-white">Ready to </span>
              <span className="text-gradient">Explore?</span>
            </h2>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10">
              Join thousands of explorers tracking the cosmos in real-time. Your
              journey through space starts here.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 mb-12">
              {[
                { value: "50K+", label: "Active Users" },
                { value: "2,847", label: "Satellites Tracked" },
                { value: "99.9%", label: "Accuracy" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl md:text-3xl font-heading font-bold text-gradient mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLaunch}
                  className="btn-cosmic group text-lg py-5 px-10"
                >
                  <Rocket
                    className={`w-5 h-5 mr-2 transition-transform ${isLaunching ? "animate-bounce" : "group-hover:-translate-y-1"}`}
                  />
                  Launch Dashboard
                  <Sparkles className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              </Link>

              <Link to="/dashboard" className="btn-ghost-cosmic text-lg py-5 px-10">
                <LayoutDashboard className="w-5 h-5 mr-2" />
                Explore Features
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-space-deep to-transparent" />
    </section>
  );
};

export default FinalCTA;
