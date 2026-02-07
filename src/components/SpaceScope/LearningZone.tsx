import { motion } from "framer-motion";
import { GraduationCap, HelpCircle, BarChart3, Microscope } from "lucide-react";
import { useRef } from "react";

const cards = [
  {
    title: "Space 101",
    description: "Start your cosmic journey with fundamentals",
    icon: GraduationCap,
    colorClass: "bg-cosmic-glow",
    bgClass: "bg-cosmic-glow/10",
    delay: 0,
  },
  {
    title: "Quick Quizzes",
    description: "Test your knowledge of the cosmos",
    icon: HelpCircle,
    colorClass: "bg-cosmic-purple",
    bgClass: "bg-cosmic-purple/10",
    delay: 0.1,
  },
  {
    title: "Visual Guides",
    description: "Beautiful infographics & diagrams",
    icon: BarChart3,
    colorClass: "bg-cosmic-pink",
    bgClass: "bg-cosmic-pink/10",
    delay: 0.2,
  },
  {
    title: "Real Examples",
    description: "See space science in action",
    icon: Microscope,
    colorClass: "bg-green-500",
    bgClass: "bg-green-500/10",
    delay: 0.3,
  },
];

const LearningZone = () => {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
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
            <GraduationCap className="w-4 h-4 text-cosmic-glow" />
            <span className="text-sm text-cosmic-glow font-medium">
              Learning Zone
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
            <span className="text-star-white">Made for </span>
            <span className="text-gradient">Curious Minds</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From students to space enthusiasts, learn at your own pace.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => (
            <MagneticCard key={card.title} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
};

interface CardProps {
  card: (typeof cards)[0];
}

const MagneticCard = ({ card }: CardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotateX = (y / rect.height) * -8;
    const rotateY = (x / rect.width) * 8;

    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform =
      "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: card.delay, duration: 0.5 }}
      viewport={{ once: true }}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="glass-card-hover p-6 cursor-pointer group"
      style={{
        transition:
          "transform 0.15s ease-out, border-color 0.5s, box-shadow 0.5s",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Icon container */}
      <motion.div
        className={`w-14 h-14 rounded-2xl ${card.bgClass} flex items-center justify-center mb-4`}
        style={{ transform: "translateZ(30px)" }}
      >
        <card.icon
          className={`w-7 h-7 ${card.colorClass.replace("bg-", "text-")}`}
          style={{ color: "currentColor" }}
        />
        <div
          className={`absolute inset-0 rounded-2xl ${card.colorClass} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
        />
      </motion.div>

      {/* Content */}
      <div style={{ transform: "translateZ(20px)" }}>
        <h3 className="text-xl font-heading font-bold text-star-white mb-2 group-hover:text-cosmic-glow transition-all duration-300">
          {card.title}
        </h3>
        <p className="text-muted-foreground text-sm">{card.description}</p>
      </div>

      {/* Hover indicator */}
      <motion.div
        className="mt-4 flex items-center gap-2 text-sm"
        style={{ transform: "translateZ(15px)" }}
      >
        <span className="text-cosmic-glow opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Explore →
        </span>
      </motion.div>

      {/* Background glow on hover (Removed gradient) */}
      <div
        className={`absolute inset-0 rounded-2xl ${card.colorClass} opacity-0 group-hover:opacity-5 transition-opacity duration-500 -z-10 blur-xl`}
      />
    </motion.div>
  );
};

export default LearningZone;
