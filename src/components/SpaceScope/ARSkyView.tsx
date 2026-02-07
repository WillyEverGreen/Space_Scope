import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Smartphone, Radio, MapPin, Clock } from 'lucide-react';

const ARSkyView = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const phoneRotate = useTransform(scrollYProgress, [0, 0.5], [15, 0]);
  const phoneScale = useTransform(scrollYProgress, [0, 0.5], [0.9, 1]);
  const contentOpacity = useTransform(scrollYProgress, [0.1, 0.3], [0, 1]);

  const satellites = [
    { name: 'ISS', delay: 0.2, x: 30, y: 25 },
    { name: 'Starlink-1547', delay: 0.4, x: 60, y: 40 },
    { name: 'GPS III', delay: 0.6, x: 45, y: 60 },
    { name: 'Hubble', delay: 0.8, x: 75, y: 30 },
  ];

  const features = [
    { icon: Radio, title: 'Live satellite positions updated every second' },
    { icon: MapPin, title: 'Orbital path predictions' },
    { icon: Clock, title: 'Never miss the ISS again' },
  ];

  return (
    <section ref={ref} className="relative min-h-screen py-20 md:py-32 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Phone mockup */}
          <motion.div
            style={{ rotate: phoneRotate, scale: phoneScale }}
            className="relative order-2 lg:order-1 flex justify-center"
          >
            <div className="relative w-[280px] md:w-[320px] perspective-1000">
              {/* Phone frame */}
              <div className="relative rounded-[3rem] p-3 glass-card border-glow overflow-hidden">
                {/* Screen */}
                <div className="relative aspect-[9/19] rounded-[2.5rem] overflow-hidden bg-space-deep">
                  {/* Fake camera view background */}
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(180deg, hsl(230 40% 8%) 0%, hsl(230 50% 12%) 50%, hsl(230 40% 8%) 100%)',
                    }}
                  />

                  {/* Scan lines effect */}
                  <div 
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(99, 102, 241, 0.3) 2px, rgba(99, 102, 241, 0.3) 4px)',
                    }}
                  />

                  {/* AR Grid overlay */}
                  <div 
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `
                        linear-gradient(rgba(99, 102, 241, 0.3) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(99, 102, 241, 0.3) 1px, transparent 1px)
                      `,
                      backgroundSize: '40px 40px',
                    }}
                  />

                  {/* Satellites */}
                  {satellites.map((sat, index) => (
                    <motion.div
                      key={sat.name}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: sat.delay, duration: 0.5 }}
                      className="absolute"
                      style={{ left: `${sat.x}%`, top: `${sat.y}%` }}
                    >
                      <div className="relative">
                        {/* Satellite dot */}
                        <motion.div
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                          className="w-3 h-3 rounded-full bg-cosmic-glow shadow-lg"
                          style={{ boxShadow: '0 0 20px rgba(99, 102, 241, 0.8)' }}
                        />
                        {/* Label */}
                        <div className="absolute top-4 left-4 whitespace-nowrap">
                          <div className="px-2 py-1 rounded bg-space-deep/80 border border-cosmic-glow/30 backdrop-blur-sm">
                            <span className="text-xs text-star-white font-mono">{sat.name}</span>
                          </div>
                        </div>
                        {/* Orbit trail */}
                        <svg className="absolute -top-6 -left-6 w-16 h-16 opacity-40" viewBox="0 0 64 64">
                          <motion.ellipse
                            cx="32"
                            cy="32"
                            rx="28"
                            ry="12"
                            fill="none"
                            stroke="url(#orbitGradient)"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                            initial={{ rotate: 0 }}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                          />
                          <defs>
                            <linearGradient id="orbitGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="rgba(99, 102, 241, 0.8)" />
                              <stop offset="100%" stopColor="rgba(139, 92, 246, 0.4)" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    </motion.div>
                  ))}

                  {/* AR UI Elements */}
                  <div className="absolute top-4 left-4 right-4">
                    <div className="flex items-center justify-between text-xs text-cosmic-glow font-mono">
                      <span>AR MODE</span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        LIVE
                      </span>
                    </div>
                  </div>

                  {/* Compass */}
                  <div className="absolute bottom-4 left-4">
                    <div className="w-12 h-12 rounded-full border border-cosmic-glow/30 flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="text-cosmic-glow text-xs font-bold"
                      >
                        N
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone glow */}
              <div className="absolute inset-0 -z-10 rounded-[3rem] bg-cosmic-glow/20 blur-2xl" />
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            style={{ opacity: contentOpacity }}
            className="order-1 lg:order-2"
          >
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cosmic-glow/10 border border-cosmic-glow/20 mb-4">
                <Smartphone className="w-4 h-4 text-cosmic-glow" />
                <span className="text-sm text-cosmic-glow font-medium">AR Sky View</span>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-6">
                <span className="text-star-white">Point. </span>
                <span className="text-gradient">See. </span>
                <span className="text-star-white">Track.</span>
              </h2>

              <p className="text-lg text-muted-foreground mb-8 max-w-md">
                Transform your phone into a cosmic telescope. Point at the sky and see ISS, Starlink, GPS satellites in real-time AR.
              </p>

              <div className="space-y-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-cosmic-glow/10 border border-cosmic-glow/20 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-cosmic-glow" />
                    </div>
                    <span className="text-star-white/90">{feature.title}</span>
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-8 btn-cosmic"
              >
                Try AR View
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ARSkyView;
