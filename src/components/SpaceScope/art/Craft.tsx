import { useId } from "react";

interface CraftProps {
  className?: string;
  width?: number;
  height?: number;
}

/** Upright rocket with animated flame. Points up; flame is `.l-flame`. */
export const Rocket = ({ className, width, height }: CraftProps) => {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 90 220" className={className} width={width} height={height} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-body`} x1="0" x2="1">
          <stop offset="0" stopColor="#d9ccf5" />
          <stop offset="0.45" stopColor="#fff5ee" />
          <stop offset="1" stopColor="#b9a6e8" />
        </linearGradient>
        <linearGradient id={`${id}-flame`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff2c6" />
          <stop offset="0.35" stopColor="#ffb48f" />
          <stop offset="1" stopColor="#ff6fa0" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g className="l-flame">
        <path d="M33 150 Q45 220 57 150 Z" fill={`url(#${id}-flame)`} />
      </g>
      <path d="M10 118 L32 100 L32 150 L12 158 Z" fill="#ff8fb8" />
      <path d="M80 118 L58 100 L58 150 L78 158 Z" fill="#ff8fb8" />
      <path d="M45 6 C70 34 72 82 66 150 L24 150 C18 82 20 34 45 6 Z" fill={`url(#${id}-body)`} />
      <path d="M45 6 C54 18 60 30 63 44 L27 44 C30 30 36 18 45 6 Z" fill="#8b6bdc" />
      <circle cx="45" cy="78" r="13" fill="#1a1030" />
      <circle cx="45" cy="78" r="9" fill="#5b3fa8" />
      <ellipse cx="41" cy="74" rx="3.5" ry="2.5" fill="#fff" opacity="0.6" />
      <rect x="24" y="118" width="42" height="5" fill="#8b6bdc" opacity="0.5" />
      <rect x="32" y="148" width="26" height="9" rx="3" fill="#c8794b" />
    </svg>
  );
};

/** Communications satellite with two solar arrays. */
export const Satellite = ({ className, width, height }: CraftProps) => {
  const id = useId().replace(/:/g, "");
  const cells = (x: number) =>
    [0, 1, 2, 3].map((i) => (
      <line key={i} x1={x + i * 11 + 11} y1="22" x2={x + i * 11 + 11} y2="58" stroke="#8b6bdc" strokeOpacity="0.55" />
    ));
  return (
    <svg viewBox="0 0 180 80" className={className} width={width} height={height} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-panel`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#5b3fa8" />
          <stop offset="1" stopColor="#2a1766" />
        </linearGradient>
        <linearGradient id={`${id}-hull`} x1="0" x2="1">
          <stop offset="0" stopColor="#e6dcff" />
          <stop offset="1" stopColor="#a692e0" />
        </linearGradient>
      </defs>
      <rect x="4" y="22" width="56" height="36" rx="2" fill={`url(#${id}-panel)`} stroke="#c9b6ff" strokeOpacity="0.6" />
      <rect x="120" y="22" width="56" height="36" rx="2" fill={`url(#${id}-panel)`} stroke="#c9b6ff" strokeOpacity="0.6" />
      {cells(4)}
      {cells(120)}
      <line x1="4" y1="40" x2="60" y2="40" stroke="#8b6bdc" strokeOpacity="0.55" />
      <line x1="120" y1="40" x2="176" y2="40" stroke="#8b6bdc" strokeOpacity="0.55" />
      <line x1="60" y1="40" x2="74" y2="40" stroke="#c9b6ff" strokeWidth="3" />
      <line x1="106" y1="40" x2="120" y2="40" stroke="#c9b6ff" strokeWidth="3" />
      <rect x="74" y="26" width="32" height="28" rx="5" fill={`url(#${id}-hull)`} />
      <rect x="74" y="34" width="32" height="5" fill="#c8794b" opacity="0.8" />
      <circle cx="90" cy="46" r="3" fill="#1a1030" />
      <path d="M90 26 L90 12" stroke="#c9b6ff" strokeWidth="2" />
      <path d="M80 12 Q90 2 100 12 Z" fill="#fff5ee" />
      <circle cx="90" cy="10" r="2" fill="#ff8fb8" />
    </svg>
  );
};

/** ISS-style station: long truss, four array wings, pressurised modules. */
export const Station = ({ className, width, height }: CraftProps) => {
  const id = useId().replace(/:/g, "");
  const wing = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width="26" height="34" fill={`url(#${id}-panel)`} stroke="#c9b6ff" strokeOpacity="0.5" />
      <line x1={x + 13} y1={y} x2={x + 13} y2={y + 34} stroke="#8b6bdc" strokeOpacity="0.6" />
      <line x1={x} y1={y + 17} x2={x + 26} y2={y + 17} stroke="#8b6bdc" strokeOpacity="0.6" />
    </g>
  );
  return (
    <svg viewBox="0 0 240 110" className={className} width={width} height={height} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-panel`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#ffb48f" stopOpacity="0.9" />
          <stop offset="1" stopColor="#c8794b" />
        </linearGradient>
        <linearGradient id={`${id}-mod`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff5ee" />
          <stop offset="1" stopColor="#a692e0" />
        </linearGradient>
      </defs>
      <rect x="10" y="53" width="220" height="4" fill="#c9b6ff" />
      {[wing(14, 8), wing(14, 68), wing(52, 8), wing(52, 68), wing(160, 8), wing(160, 68), wing(198, 8), wing(198, 68)]}
      <rect x="92" y="46" width="56" height="18" rx="9" fill={`url(#${id}-mod)`} />
      <rect x="108" y="30" width="24" height="12" rx="6" fill={`url(#${id}-mod)`} />
      <rect x="108" y="68" width="24" height="12" rx="6" fill={`url(#${id}-mod)`} />
      <circle cx="120" cy="55" r="3" fill="#1a1030" />
      <rect x="84" y="51" width="8" height="8" fill="#c9b6ff" />
      <rect x="148" y="51" width="8" height="8" fill="#c9b6ff" />
    </svg>
  );
};

/** Small moon / asteroid disc. */
export const Moon = ({ className, width, height }: CraftProps) => {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 100" className={className} width={width} height={height} aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-m`} cx="32%" cy="28%" r="80%">
          <stop offset="0" stopColor="#fff5ee" />
          <stop offset="0.6" stopColor="#c9b6ff" />
          <stop offset="1" stopColor="#5b3fa8" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill={`url(#${id}-m)`} />
      <circle cx="34" cy="38" r="8" fill="#8b6bdc" opacity="0.35" />
      <circle cx="62" cy="58" r="11" fill="#8b6bdc" opacity="0.3" />
      <circle cx="46" cy="72" r="5" fill="#8b6bdc" opacity="0.3" />
    </svg>
  );
};
