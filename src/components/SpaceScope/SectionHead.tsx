import { useEffect, useRef, type ReactNode } from "react";
import { gsap, prefersReducedMotion } from "./gsap";

interface SectionHeadProps {
  /** One entry per visual line; each is revealed through a mask. */
  lines: ReactNode[];
  lead?: string;
  align?: "left" | "center";
  className?: string;
}

/** Eyebrow + masked headline + lead paragraph with a scroll-triggered reveal. */
const SectionHead = ({ lines, lead, align = "left", className = "" }: SectionHeadProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top 82%", once: true },
        defaults: { ease: "power4.out" },
      });
      tl.from("[data-sh-line] > span", { yPercent: 115, rotate: 2, duration: 1, stagger: 0.1 }, 0.1)
        .from("[data-sh-lead]", { y: 20, opacity: 0, duration: 0.8 }, 0.5);
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className={`${align === "center" ? "mx-auto text-center" : ""} ${className}`}>
      <h2 className="l-section-title">
        {lines.map((line, i) => (
          <span key={i} data-sh-line className="l-mask">
            <span>{line}</span>
          </span>
        ))}
      </h2>
      {lead && (
        <p data-sh-lead className={`l-lead mt-5 max-w-xl ${align === "center" ? "mx-auto" : ""}`}>
          {lead}
        </p>
      )}
    </div>
  );
};

export default SectionHead;
