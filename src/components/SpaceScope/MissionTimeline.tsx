import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Rocket, Calendar, Target, CheckCircle, Clock } from "lucide-react";

interface Mission {
  id: string;
  name: string;
  year: number;
  target: string;
  goal: string;
  impact: string;
  status: "completed" | "active" | "upcoming";
}

const missions: Mission[] = [
  {
    id: "apollo",
    name: "Apollo 11",
    year: 1969,
    target: "Moon",
    goal: "First human moon landing",
    impact: "Proved human space exploration possible",
    status: "completed",
  },
  {
    id: "voyager",
    name: "Voyager 1",
    year: 1977,
    target: "Interstellar Space",
    goal: "Study outer planets and beyond",
    impact: "First object to leave our solar system",
    status: "active",
  },
  {
    id: "hubble",
    name: "Hubble Telescope",
    year: 1990,
    target: "Earth Orbit",
    goal: "Deep space observation",
    impact: "Revolutionized our view of the universe",
    status: "active",
  },
  {
    id: "jwst",
    name: "James Webb",
    year: 2021,
    target: "L2 Lagrange Point",
    goal: "Infrared deep space observation",
    impact: "Seeing the earliest galaxies ever",
    status: "active",
  },
  {
    id: "artemis",
    name: "Artemis III",
    year: 2025,
    target: "Moon",
    goal: "Return humans to lunar surface",
    impact: "First woman on the Moon",
    status: "upcoming",
  },
  {
    id: "mars",
    name: "Mars Sample Return",
    year: 2031,
    target: "Mars",
    goal: "Bring Martian samples to Earth",
    impact: "Search for ancient life on Mars",
    status: "upcoming",
  },
];

const MissionTimeline = () => {
  const ref = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [expandedMission, setExpandedMission] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const lineWidth = useTransform(scrollYProgress, [0.2, 0.8], ["0%", "100%"]);

  // Duplicate missions for infinite scroll
  const duplicatedMissions = [...missions, ...missions, ...missions];

  // Auto-scroll effect
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationFrameId: number;
    const scrollSpeed = 0.5; // pixels per frame

    const animate = () => {
      if (!isPaused && scrollContainer) {
        scrollContainer.scrollLeft += scrollSpeed;

        // Reset scroll position when we've scrolled past the first set
        const maxScroll = scrollContainer.scrollWidth / 3;
        if (scrollContainer.scrollLeft >= maxScroll) {
          scrollContainer.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPaused]);

  const getStatusIcon = (status: Mission["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "active":
        return <Rocket className="w-4 h-4" />;
      case "upcoming":
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusStyle = (status: Mission["status"]) => {
    switch (status) {
      case "completed":
        return "bg-muted/30 border-muted-foreground/30 opacity-60";
      case "active":
        return "bg-cosmic-glow/20 border-cosmic-glow glow-pulse";
      case "upcoming":
        return "bg-muted/20 border-muted/50";
    }
  };

  return (
    <section ref={ref} className="relative py-20 md:py-32 overflow-hidden">
      {/* Background (Removed gradient) */}
      <div className="absolute inset-0 bg-transparent" />

      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cosmic-glow/10 border border-cosmic-glow/20 mb-4">
            <Rocket className="w-4 h-4 text-cosmic-glow" />
            <span className="text-sm text-cosmic-glow font-medium">
              Mission Timeline
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
            <span className="text-star-white">The Journey </span>
            <span className="text-cosmic-glow">Never Stops</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From Apollo to Mars, explore humanity's cosmic roadmap.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute top-[60px] left-0 right-0 h-0.5 bg-muted/30">
            <motion.div
              className="h-full bg-cosmic-glow"
              style={{ width: lineWidth }}
            />
          </div>

          {/* Left blur gradient */}
          <div
            className="absolute left-0 top-0 bottom-0 w-32 md:w-48 z-10 pointer-events-none"
            style={{
              background:
                "linear-gradient(to right, hsl(230 60% 6% / 1), hsl(230 60% 6% / 0.8), transparent)",
            }}
          />

          {/* Right blur gradient */}
          <div
            className="absolute right-0 top-0 bottom-0 w-32 md:w-48 z-10 pointer-events-none"
            style={{
              background:
                "linear-gradient(to left, hsl(230 60% 6% / 1), hsl(230 60% 6% / 0.8), transparent)",
            }}
          />

          {/* Scrollable container */}
          <div
            ref={scrollRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="flex gap-6 overflow-x-auto pb-8 pt-4 px-4 -mx-4 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {duplicatedMissions.map((mission, index) => (
              <motion.div
                key={`${mission.id}-${index}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  delay: (index % missions.length) * 0.1,
                  duration: 0.5,
                }}
                viewport={{ once: true }}
                className="flex-shrink-0"
              >
                {/* Year marker */}
                <div className="flex flex-col items-center mb-4">
                  <motion.div
                    animate={
                      mission.status === "active" ? { scale: [1, 1.2, 1] } : {}
                    }
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`w-4 h-4 rounded-full ${
                      mission.status === "active"
                        ? "bg-cosmic-glow"
                        : mission.status === "completed"
                          ? "bg-muted-foreground/50"
                          : "bg-muted/50 border border-muted-foreground/30"
                    }`}
                    style={
                      mission.status === "active"
                        ? { boxShadow: "0 0 20px rgba(99, 102, 241, 0.6)" }
                        : {}
                    }
                  />
                  <span className="text-sm font-mono text-muted-foreground mt-2">
                    {mission.year}
                  </span>
                </div>

                {/* Mission card */}
                <motion.button
                  whileHover={{ y: -8, scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  onClick={() =>
                    setExpandedMission(
                      expandedMission === mission.id ? null : mission.id,
                    )
                  }
                  className={`w-[260px] md:w-[300px] text-left glass-card p-5 border transition-all duration-300 ${getStatusStyle(mission.status)}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-heading font-bold text-star-white">
                      {mission.name}
                    </h3>
                    <div
                      className={`p-1.5 rounded-lg ${
                        mission.status === "active"
                          ? "bg-cosmic-glow/20 text-cosmic-glow"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {getStatusIcon(mission.status)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Target className="w-4 h-4" />
                    <span>{mission.target}</span>
                  </div>

                  <p className="text-sm text-star-white/80 mb-4">
                    {mission.goal}
                  </p>

                  {/* Expanded content */}
                  <motion.div
                    initial={false}
                    animate={{
                      height: expandedMission === mission.id ? "auto" : 0,
                      opacity: expandedMission === mission.id ? 1 : 0,
                    }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 border-t border-border/50">
                      <p className="text-sm text-muted-foreground mb-2">
                        Impact on Earth science:
                      </p>
                      <p className="text-sm text-star-white">
                        {mission.impact}
                      </p>
                    </div>
                  </motion.div>

                  <div className="flex items-center justify-between mt-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        mission.status === "completed"
                          ? "bg-muted text-muted-foreground"
                          : mission.status === "active"
                            ? "bg-cosmic-glow/20 text-cosmic-glow"
                            : "bg-cosmic-purple/20 text-cosmic-purple"
                      }`}
                    >
                      {mission.status.charAt(0).toUpperCase() +
                        mission.status.slice(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {expandedMission === mission.id
                        ? "Click to collapse"
                        : "Click for details"}
                    </span>
                  </div>
                </motion.button>
              </motion.div>
            ))}
          </div>

          {/* Scroll hint */}
        </div>
      </div>
    </section>
  );
};

export default MissionTimeline;
