import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { Rewind, Play, Pause, Calendar, Star, Moon, Sparkles, Satellite, Globe } from "lucide-react";

const TimeRewind = () => {
  const [currentDay, setCurrentDay] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const events = [
    { day: -28, name: "Lunar Eclipse", type: "eclipse" },
    { day: -21, name: "Meteor Shower Peak", type: "meteor" },
    { day: -14, name: "ISS Bright Pass", type: "satellite" },
    { day: -7, name: "Saturn Opposition", type: "planet" },
    { day: 0, name: "Tonight", type: "current" },
  ];

  const togglePlayback = () => {
    if (isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      setCurrentDay(-30);
      intervalRef.current = setInterval(() => {
        setCurrentDay((prev) => {
          if (prev >= 0) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 100);
    }
  };

  const getMeteorPositions = () => {
    const meteors = [];
    const count = Math.max(0, Math.abs(currentDay + 21) < 5 ? 12 : 2);
    for (let i = 0; i < count; i++) {
      meteors.push({
        id: i,
        x: 20 + Math.random() * 60,
        y: 10 + Math.random() * 40,
        delay: Math.random() * 2,
        speed: 0.6 + Math.random() * 0.4,
      });
    }
    return meteors;
  };

  const getActiveEvent = () => {
    return events.find((e) => Math.abs(e.day - currentDay) < 3);
  };

  const showEclipse = Math.abs(currentDay + 28) < 4;
  const showMeteorShower = Math.abs(currentDay + 21) < 5;
  const showISS = Math.abs(currentDay + 14) < 4;
  const showSaturn = Math.abs(currentDay + 7) < 4;

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cosmic-glow/10 border border-cosmic-glow/20 mb-4">
            <Rewind className="w-4 h-4 text-cosmic-glow" />
            <span className="text-sm text-cosmic-glow font-medium">
              Time Rewind
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
            <span className="text-star-white">Rewind the </span>
            <span className="text-cosmic-glow">Cosmos</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Missed last night's meteor shower? Travel back in time and see what
            you missed.
          </p>
        </motion.div>

        {/* Sky viewer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative max-w-4xl mx-auto"
        >
          {/* Sky canvas (Removed gradient) */}
          <div
            className="relative aspect-video rounded-2xl overflow-hidden glass-card border-glow"
            style={{
              background: "hsl(230 60% 8%)",
            }}
          >
            {/* Stars */}
            <div className="absolute inset-0">
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-star-white"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 70}%`,
                    opacity: Math.random() * 0.8 + 0.2,
                  }}
                  animate={{
                    opacity: [0.3, 0.8, 0.3],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>

            {/* Aurora effect during eclipse */}
            {showEclipse && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at 70% 30%, rgba(139, 92, 246, 0.15), transparent 60%)",
                }}
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                }}
              />
            )}

            {/* Meteor shower glow effect */}
            {showMeteorShower && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at 50% 20%, rgba(255, 215, 0, 0.08), transparent 50%)",
                }}
                animate={{
                  opacity: [0.4, 0.7, 0.4],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />
            )}

            {/* Moon */}
            <motion.div
              className="absolute right-[15%] top-[20%] w-16 h-16 md:w-24 md:h-24"
              animate={{
                x: currentDay * 2,
                scale: showEclipse ? [1, 0.95, 1] : 1,
              }}
              transition={{
                scale: { duration: 2, repeat: Infinity },
              }}
            >
              <div
                className="w-full h-full rounded-full bg-[#f1f5f9] relative overflow-hidden"
                style={{
                  boxShadow: showEclipse
                    ? "0 0 60px rgba(139, 92, 246, 0.6)"
                    : "0 0 40px rgba(255, 255, 255, 0.3)",
                }}
              >
                {/* Eclipse shadow overlay */}
                {showEclipse && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        "radial-gradient(circle at 30% 30%, transparent 30%, hsl(230 60% 8%) 70%)",
                    }}
                    animate={{
                      opacity: [0.3, 0.7, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                    }}
                  />
                )}
              </div>
            </motion.div>

            {/* Saturn */}
            {showSaturn && (
              <motion.div
                className="absolute left-[20%] top-[30%]"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
              >
                {/* Saturn planet */}
                <div className="relative w-12 h-12 md:w-16 md:h-16">
                  <div
                    className="w-full h-full rounded-full"
                    style={{
                      background:
                        "linear-gradient(135deg, #e4c087 0%, #d9a962 100%)",
                      boxShadow: "0 0 30px rgba(228, 192, 135, 0.4)",
                    }}
                  />
                  {/* Saturn rings */}
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-8 md:w-28 md:h-10 rounded-full border-2 border-[#d9a962] opacity-60"
                    style={{
                      transform:
                        "translateX(-50%) translateY(-50%) rotateX(75deg)",
                    }}
                  />
                  <motion.div
                    className="absolute -inset-2 rounded-full border border-cosmic-gold/20"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />
                </div>
              </motion.div>
            )}

            {/* ISS Satellite */}
            {showISS && (
              <motion.div
                className="absolute"
                initial={{ x: "0%", y: "20%" }}
                animate={{
                  x: ["0%", "100%"],
                  y: ["20%", "30%", "20%"],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <div className="relative">
                  {/* ISS body */}
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-3 bg-muted-foreground rounded" />
                    <div className="w-4 h-4 bg-star-white rounded" />
                    <div className="w-1 h-3 bg-muted-foreground rounded" />
                  </div>
                  {/* Light trail */}
                  <motion.div
                    className="absolute top-1/2 right-full w-8 h-0.5"
                    style={{
                      background:
                        "linear-gradient(to left, rgba(255,255,255,0.6), transparent)",
                    }}
                    animate={{
                      opacity: [0.6, 0.3, 0.6],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                    }}
                  />
                </div>
              </motion.div>
            )}

            {/* Meteors */}
            {getMeteorPositions().map((meteor) => (
              <motion.div
                key={meteor.id}
                className="absolute"
                style={{
                  left: `${meteor.x}%`,
                  top: `${meteor.y}%`,
                }}
                animate={{
                  x: [0, -120],
                  y: [0, 120],
                  opacity: [0, 1, 0.8, 0],
                }}
                transition={{
                  duration: meteor.speed,
                  delay: meteor.delay,
                  repeat: Infinity,
                  repeatDelay: showMeteorShower ? 0.5 : 2 + Math.random() * 3,
                  ease: "easeIn",
                }}
              >
                <div
                  className="relative"
                  style={{
                    filter: "blur(0.5px)",
                  }}
                >
                  {/* Main meteor trail */}
                  <div
                    className="w-16 md:w-24 h-0.5 -rotate-45 origin-right"
                    style={{
                      background:
                        "linear-gradient(to right, transparent, hsl(var(--star-white)), transparent)",
                      boxShadow: showMeteorShower
                        ? "0 0 8px rgba(255, 255, 255, 0.8)"
                        : "none",
                    }}
                  />
                  {/* Meteor head glow */}
                  <div
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-star-white"
                    style={{
                      boxShadow: "0 0 10px 2px rgba(255, 255, 255, 0.6)",
                    }}
                  />
                </div>
              </motion.div>
            ))}

            {/* Timestamp */}
            <div className="absolute top-4 left-4 glass-card px-4 py-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cosmic-glow" />
                <span className="font-mono text-sm text-star-white">
                  {currentDay === 0
                    ? "Tonight"
                    : `${Math.abs(currentDay)} days ago`}
                </span>
              </div>
            </div>

            {/* Event indicator */}
            <AnimatePresence mode="wait">
              {getActiveEvent() && (
                <motion.div
                  key={getActiveEvent()?.day}
                  initial={{ opacity: 0, y: -10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute top-4 right-4 glass-card px-4 py-2 border-glow"
                >
                  <div className="flex items-center gap-2">
                    {getActiveEvent()?.type === "eclipse" && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      >
                        <Moon className="w-4 h-4 text-cosmic-purple" />
                      </motion.div>
                    )}
                    {getActiveEvent()?.type === "meteor" && (
                      <motion.div
                        animate={{ 
                          scale: [1, 1.2, 1],
                        }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Sparkles className="w-4 h-4 text-cosmic-gold" />
                      </motion.div>
                    )}
                    {getActiveEvent()?.type === "satellite" && (
                      <motion.div
                        animate={{ 
                          y: [0, -3, 0],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Satellite className="w-4 h-4 text-cosmic-glow" />
                      </motion.div>
                    )}
                    {getActiveEvent()?.type === "planet" && (
                      <motion.div
                        animate={{ 
                          rotate: [0, 360],
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      >
                        <Globe className="w-4 h-4 text-meteor-gold" />
                      </motion.div>
                    )}
                    <span className="text-sm text-star-white font-medium">
                      {getActiveEvent()?.name}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Silhouette horizon */}
            <div
              className="absolute bottom-0 left-0 right-0 h-1/4"
              style={{
                background:
                  "linear-gradient(to top, hsl(230 60% 6%) 0%, transparent 100%)",
              }}
            />
            <svg
              className="absolute bottom-0 left-0 right-0 h-16 md:h-24"
              viewBox="0 0 1200 100"
              preserveAspectRatio="none"
            >
              <path
                d="M0 100 L0 60 Q100 40 200 50 T400 45 T600 55 T800 40 T1000 50 T1200 45 L1200 100 Z"
                fill="hsl(230 60% 6%)"
              />
            </svg>
          </div>

          {/* Timeline scrubber */}
          <div className="mt-6 px-4">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={togglePlayback}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
                  isPlaying
                    ? "bg-cosmic-glow/30 border-cosmic-glow text-cosmic-glow"
                    : "bg-cosmic-glow/20 border-cosmic-glow/30 text-cosmic-glow hover:bg-cosmic-glow/30"
                }`}
                style={
                  isPlaying
                    ? { boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)" }
                    : {}
                }
              >
                <motion.div
                  animate={isPlaying ? { rotate: 360 } : {}}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </motion.div>
              </motion.button>

              <div className="flex-1 relative">
                {/* Track */}
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-cosmic-glow"
                    style={{ width: `${((currentDay + 30) / 30) * 100}%` }}
                  />
                </div>

                {/* Event markers */}
                {events
                  .filter((e) => e.day < 0)
                  .map((event) => {
                    const getMarkerColor = () => {
                      switch (event.type) {
                        case "eclipse":
                          return "bg-cosmic-purple border-cosmic-purple";
                        case "meteor":
                          return "bg-cosmic-gold border-cosmic-gold";
                        case "satellite":
                          return "bg-cosmic-glow border-cosmic-glow";
                        case "planet":
                          return "bg-meteor-gold border-meteor-gold";
                        default:
                          return "bg-cosmic-gold border-space-deep";
                      }
                    };

                    return (
                      <motion.div
                        key={event.day}
                        className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 cursor-pointer ${getMarkerColor()}`}
                        style={{ left: `${((event.day + 30) / 30) * 100}%` }}
                        title={event.name}
                        whileHover={{ scale: 1.5 }}
                        animate={
                          Math.abs(currentDay - event.day) < 3
                            ? {
                                scale: [1, 1.3, 1],
                                boxShadow: [
                                  "0 0 0px rgba(99, 102, 241, 0)",
                                  "0 0 12px rgba(99, 102, 241, 0.6)",
                                  "0 0 0px rgba(99, 102, 241, 0)",
                                ],
                              }
                            : {}
                        }
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                        onClick={() => setCurrentDay(event.day)}
                      />
                    );
                  })}

                {/* Scrubber handle */}
                <input
                  type="range"
                  min={-30}
                  max={0}
                  value={currentDay}
                  onChange={(e) => setCurrentDay(parseInt(e.target.value))}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
              </div>

              <span className="text-sm font-mono text-muted-foreground min-w-[80px] text-right">
                {currentDay === 0 ? "Now" : `${Math.abs(currentDay)}d ago`}
              </span>
            </div>

            {/* Event legend */}
            <div className="flex flex-wrap gap-4 mt-4 justify-center">
              {events
                .filter((e) => e.day < 0)
                .map((event) => {
                  const getEventIcon = () => {
                    switch (event.type) {
                      case "eclipse":
                        return <Moon className="w-3 h-3" />;
                      case "meteor":
                        return <Sparkles className="w-3 h-3" />;
                      case "satellite":
                        return <Satellite className="w-3 h-3" />;
                      case "planet":
                        return <Globe className="w-3 h-3" />;
                      default:
                        return <Star className="w-3 h-3" />;
                    }
                  };

                  return (
                    <motion.button
                      key={event.day}
                      onClick={() => setCurrentDay(event.day)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`text-xs px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                        Math.abs(currentDay - event.day) < 3
                          ? "bg-cosmic-glow/20 text-cosmic-glow border border-cosmic-glow/30 glow-pulse"
                          : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                      }`}
                    >
                      {getEventIcon()}
                      {event.name}
                    </motion.button>
                  );
                })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TimeRewind;
