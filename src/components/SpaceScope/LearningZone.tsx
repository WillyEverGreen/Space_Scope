import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Check, X } from "lucide-react";
import { gsap, prefersReducedMotion } from "./gsap";
import SectionHead from "./SectionHead";
import { Planet } from "./art/Planet";
import { Moon } from "./art/Craft";
import GlareHover from "@/components/react-bits/GlareHover";

interface CardShellProps {
  className: string;
  title: string;
  body: string;
  cta?: string;
  children: ReactNode;
  /** Illustration sits beside the copy on md+, below it on small screens. */
  layout: "split" | "stack";
}

const CardShell = ({ className, title, body, cta, children, layout }: CardShellProps) => (
  <GlareHover
    width="100%"
    height="100%"
    background="transparent"
    borderRadius="24px"
    borderColor="transparent"
    glareColor="#c9b6ff"
    glareOpacity={0.2}
    className={`block! border-0! ${className}`}
  >
    <article
      data-lcard
      className={`l-card group flex h-full w-full flex-col transform-3d will-change-transform ${
        layout === "split" ? "md:flex-row" : ""
      }`}
    >
    <div className={`relative z-10 flex flex-col p-7 md:p-8 ${layout === "split" ? "md:w-[46%]" : ""}`}>
      <h3 className="font-heading text-2xl font-bold md:text-[1.75rem]">{title}</h3>
      <p className="mt-3 max-w-xs text-[0.95rem] leading-relaxed">{body}</p>
      {cta && (
        <Link
          to="/dashboard"
          className="mt-6 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-(--l-cream) md:mt-auto md:pt-8"
        >
          {cta}
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
    <div className={`relative flex-1 ${layout === "split" ? "min-h-60" : ""}`}>{children}</div>
    </article>
  </GlareHover>
);

/* ---------- Illustrations ---------- */

const SpaceBasics = () => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute left-1/2 top-1/2 aspect-square w-[min(26rem,120%)] -translate-x-1/2 -translate-y-1/2 md:left-[58%]">
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <circle cx="200" cy="200" r="192" fill="none" stroke="#c9b6ff" strokeOpacity="0.2" strokeDasharray="2 8" />
        <circle cx="200" cy="200" r="150" fill="none" stroke="#c9b6ff" strokeOpacity="0.12" />
      </svg>
      <div data-spin className="absolute inset-0">
        <Moon className="absolute left-1/2 top-[1.5%] w-9 -translate-x-1/2" />
      </div>
      <Planet variant="violet" ring className="absolute inset-[14%] h-[72%] w-[72%] max-w-none scale-[1.3]" />
    </div>
  </div>
);

interface Question {
  q: string;
  options: string[];
  answer: number;
  note: string;
}

const questions: Question[] = [
  { q: "Which planet has the shortest year?", options: ["Mercury", "Venus", "Mars"], answer: 0, note: "Mercury circles the Sun every 88 days." },
  { q: "How fast does the ISS travel?", options: ["3.1 km/s", "7.7 km/s", "11.2 km/s"], answer: 1, note: "About 27,600 km/h, one orbit every 92 minutes." },
  { q: "A high Kp index signals what?", options: ["A lunar eclipse", "A meteor shower", "A geomagnetic storm"], answer: 2, note: "Strong storms push the aurora toward the equator." },
  { q: "How many sunrises does the ISS crew see each day?", options: ["16", "4", "1"], answer: 0, note: "The station orbits Earth about 16 times a day." },
  { q: "In which year did Apollo 11 land on the Moon?", options: ["1961", "1969", "1972"], answer: 1, note: "Neil Armstrong stepped out on 20 July 1969." },
];

const QuizPreview = () => {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const body = useRef<HTMLDivElement>(null);
  const done = idx >= questions.length;
  const q = questions[Math.min(idx, questions.length - 1)];

  useEffect(() => {
    if (!body.current || prefersReducedMotion()) return;
    gsap.fromTo(body.current.children, { y: 12, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 0.45, ease: "power2.out" });
  }, [idx]);

  useEffect(() => {
    if (picked === null) return;
    const t = window.setTimeout(() => {
      setPicked(null);
      setIdx((i) => i + 1);
    }, 1500);
    return () => window.clearTimeout(t);
  }, [picked]);

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.answer) setScore((n) => n + 1);
  };

  const restart = () => {
    setIdx(0);
    setScore(0);
    setPicked(null);
  };

  return (
    <div className="flex h-full items-end p-5 pt-0">
      <div className="w-full rounded-2xl border border-white/10 bg-[#150b33]/70 p-4">
        <div className="mb-3 flex items-center justify-between text-[0.7rem] font-medium">
          <span>{done ? "Finished" : `Question ${idx + 1} of ${questions.length}`}</span>
          <span>Score {score}</span>
        </div>
        <div className="mb-4 h-1 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-(--l-lilac) transition-[width] duration-500" style={{ width: `${(Math.min(idx, questions.length) / questions.length) * 100}%` }} />
        </div>

        {done ? (
          <div ref={body} className="py-3 text-center">
            <div className="font-heading text-4xl font-bold">{score}/{questions.length}</div>
            <p className="mt-1 text-sm">
              {score === questions.length ? "Flawless. Mission control approves." : score >= 3 ? "Solid orbit. Try again for a perfect run." : "Plenty to explore. Have another go."}
            </p>
            <button onClick={restart} className="mt-4 rounded-full bg-(--l-cream) px-5 py-2 text-sm font-semibold text-(--l-ink) transition-transform hover:-translate-y-0.5">
              Play again
            </button>
          </div>
        ) : (
          <div ref={body}>
            <p className="min-h-[2.6rem] text-sm font-medium leading-snug">{q.q}</p>
            <ul className="mt-2 space-y-1.5">
              {q.options.map((o, i) => {
                const isAnswer = picked !== null && i === q.answer;
                const isWrong = picked === i && i !== q.answer;
                return (
                  <li key={o}>
                    <button
                      onClick={() => choose(i)}
                      disabled={picked !== null}
                      className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                        isAnswer
                          ? "border-[#5cf2b0]/40 bg-[#5cf2b0]/10 text-[#5cf2b0]"
                          : isWrong
                            ? " text-(--l-pink)"
                            : "border-white/10 hover:border-white/30 hover:bg-white/5"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="grid h-5 w-5 place-items-center rounded-md bg-white/10 text-[0.65rem] font-semibold">{"ABC"[i]}</span>
                        {o}
                      </span>
                      {isAnswer && <Check className="h-4 w-4" />}
                      {isWrong && <X className="h-4 w-4" />}
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 min-h-8 text-xs leading-snug">{picked !== null ? q.note : " "}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const bodies = [
  { name: "Mercury", x: 74, r: 3.5, c: "#c9b6ff" },
  { name: "Venus", x: 108, r: 7, c: "#ffd9a0" },
  { name: "Earth", x: 146, r: 7.5, c: "#8bb4ff" },
  { name: "Mars", x: 182, r: 5, c: "#ff8f6b" },
  { name: "Jupiter", x: 250, r: 24, c: "#ffb48f" },
];

const ScaleGuide = () => (
  <div className="flex h-full items-end p-5 pt-0">
    <div className="w-full rounded-2xl border border-white/10 bg-[#150b33]/70 p-4">
      <svg viewBox="0 0 300 120" className="block w-full" role="img" aria-label="Diagram of the inner planets and Jupiter">
        <defs>
          <radialGradient id="lz-sun" cx="0" cy="0.5" r="1">
            <stop offset="0" stopColor="#fff5ee" />
            <stop offset="0.5" stopColor="#ffd9a0" />
            <stop offset="1" stopColor="#ff8f6b" />
          </radialGradient>
        </defs>
        <line x1="0" x2="300" y1="52" y2="52" stroke="#c9b6ff" strokeOpacity="0.2" strokeDasharray="2 5" />
        <circle cx="-14" cy="52" r="46" fill="url(#lz-sun)" />
        {bodies.map((b) => (
          <g key={b.name} data-body>
            <circle cx={b.x} cy="52" r={b.r} fill={b.c} />
            <text x={b.x} y="104" textAnchor="middle" fontSize="8.5" fill="#efe6ff" fillOpacity="0.6" fontFamily="Inter, sans-serif">{b.name}</text>
          </g>
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-[0.7rem]">
        <span>Sun</span>
        <span>Planets, relative size</span>
      </div>
    </div>
  </div>
);

const kpBars = [2, 3, 2, 4, 3, 5, 3, 2, 3];
const flux = "M0 52 L18 50 L36 53 L54 47 L72 49 L90 40 L108 44 L126 30 L144 36 L162 22 L180 28 L198 18 L216 26 L234 20 L252 31 L270 27";

const LiveDataPreview = () => (
  <div className="flex h-full items-end p-5 pt-0 md:items-center md:p-6 md:pl-0">
    <div className="grid w-full gap-3 sm:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-[#150b33]/70 p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-[0.7rem] font-medium">Kp index</span>
          <span className="rounded-full px-2 py-0.5 text-[0.65rem] font-semibold text-(--l-gold)">Unsettled</span>
        </div>
        <div className="mt-1 font-heading text-3xl font-bold">3.0</div>
        <div className="mt-3 flex h-12 items-end gap-1.5">
          {kpBars.map((v, i) => (
            <span
              key={i}
              data-kp
              className="flex-1 origin-bottom rounded-sm"
              style={{ height: `${v * 18}%`, background: v >= 5 ? "var(--l-pink)" : "var(--l-lilac)", opacity: v >= 5 ? 1 : 0.75 }}
            />
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-[#150b33]/70 p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-[0.7rem] font-medium">X-ray flux</span>
          <span className="text-[0.65rem] font-semibold">GOES</span>
        </div>
        <div className="mt-1 font-heading text-3xl font-bold">B4.2</div>
        <svg viewBox="0 0 270 64" className="mt-3 block h-12 w-full" preserveAspectRatio="none" aria-hidden="true">
          <path d={`${flux} V64 H0 Z`} fill="#ff8fb8" fillOpacity="0.12" />
          <path data-flux d={flux} fill="none" stroke="#ff8fb8" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
    </div>
  </div>
);

const LearningZone = () => {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return;
      const trigger = { trigger: "[data-lgrid]", start: "top 80%", once: true };

      gsap.from("[data-lcard]", { y: 70, opacity: 0, stagger: 0.12, duration: 1, ease: "power3.out", scrollTrigger: trigger });
      gsap.from("[data-body]", { scale: 0, transformOrigin: "50% 50%", stagger: 0.12, duration: 0.8, delay: 0.5, ease: "back.out(2)", scrollTrigger: trigger });
      gsap.from("[data-kp]", { scaleY: 0, stagger: 0.06, duration: 0.8, delay: 0.6, ease: "power3.out", scrollTrigger: trigger });
      gsap.from("[data-answer]", { x: -14, opacity: 0, duration: 0.6, delay: 0.7, ease: "power2.out", scrollTrigger: trigger });
      const fluxLine = el.querySelector<SVGPathElement>("[data-flux]");
      if (fluxLine) {
        const len = fluxLine.getTotalLength();
        gsap.fromTo(fluxLine, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.8, delay: 0.7, ease: "power2.inOut", scrollTrigger: trigger });
      }
      gsap.to("[data-spin]", { rotation: 360, duration: 48, repeat: -1, ease: "none", transformOrigin: "50% 50%" });

      // Gentle tilt toward the cursor
      el.querySelectorAll<HTMLElement>("[data-lcard]").forEach((card) => {
        const rx = gsap.quickTo(card, "rotationX", { duration: 0.6, ease: "power3.out" });
        const ry = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: "power3.out" });
        card.addEventListener("pointermove", (e) => {
          const r = card.getBoundingClientRect();
          rx(-((e.clientY - r.top) / r.height - 0.5) * 4);
          ry(((e.clientX - r.left) / r.width - 0.5) * 5);
        });
        card.addEventListener("pointerleave", () => {
          rx(0);
          ry(0);
        });
      });
    }, el);
    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section ref={root} id="learn" className="relative z-10 py-24 md:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHead
          lines={["Made for", <span key="a" className="l-grad-text">curious minds.</span>]}
          lead="From students to lifelong stargazers, learn at your own pace with bite-sized lessons, quizzes and visual guides."
        />

        <div data-lgrid className="mt-14 grid gap-5 perspective-[1400px] md:grid-cols-6 md:auto-rows-[minmax(22rem,auto)]">
          <CardShell layout="split" className="md:col-span-4" title="Space 101" body="Start with the fundamentals: orbits, light, gravity and why the sky appears to move." cta="Start learning">
            <SpaceBasics />
          </CardShell>
          <CardShell layout="stack" className="md:col-span-2" title="Quick quizzes" body="Two-minute rounds to test what you know.">
            <QuizPreview />
          </CardShell>
          <CardShell layout="stack" className="md:col-span-2" title="Visual guides" body="Diagrams that make big ideas click.">
            <ScaleGuide />
          </CardShell>
          <CardShell layout="split" className="md:col-span-4" title="Real examples" body="See the science in action with live geomagnetic readings and solar activity." cta="Open live data">
            <LiveDataPreview />
          </CardShell>
        </div>
      </div>
    </section>
  );
};

export default LearningZone;
