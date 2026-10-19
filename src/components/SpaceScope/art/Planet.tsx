import { useId } from "react";

type Variant = "violet" | "ember" | "ice";

const palettes: Record<Variant, [string, string, string]> = {
  violet: ["#d9c8ff", "#7d58d9", "#2a1766"],
  ember: ["#ffe0bd", "#ff8f6b", "#7a2f5a"],
  ice: ["#e3f5ff", "#7fb4ff", "#2b3f8f"],
};

interface PlanetProps {
  variant?: Variant;
  ring?: boolean;
  className?: string;
  width?: number;
  height?: number;
}

/** Stylised gas planet with banding, terminator shadow, rim light and optional ring. */
export const Planet = ({ variant = "violet", ring = false, className, width, height }: PlanetProps) => {
  const id = useId().replace(/:/g, "");
  const [light, mid, dark] = palettes[variant];

  return (
    <svg viewBox="0 0 400 400" className={className} width={width} height={height} aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-body`} cx="30%" cy="26%" r="85%">
          <stop offset="0" stopColor={light} />
          <stop offset="0.5" stopColor={mid} />
          <stop offset="1" stopColor={dark} />
        </radialGradient>
        <radialGradient id={`${id}-shade`} cx="28%" cy="26%" r="90%">
          <stop offset="0.5" stopColor="#0a0420" stopOpacity="0" />
          <stop offset="1" stopColor="#0a0420" stopOpacity="0.8" />
        </radialGradient>
        <radialGradient id={`${id}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="0.6" stopColor={mid} stopOpacity="0.35" />
          <stop offset="1" stopColor={mid} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-ring`} x1="0" x2="1">
          <stop offset="0" stopColor={light} stopOpacity="0" />
          <stop offset="0.25" stopColor={light} stopOpacity="0.85" />
          <stop offset="0.75" stopColor={mid} stopOpacity="0.85" />
          <stop offset="1" stopColor={mid} stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}-disc`}>
          <circle cx="200" cy="200" r="120" />
        </clipPath>
        <clipPath id={`${id}-front`}>
          <rect x="-100" y="200" width="600" height="300" />
        </clipPath>
      </defs>

      <circle cx="200" cy="200" r="195" fill={`url(#${id}-halo)`} />

      {ring && (
        <g transform="rotate(-18 200 200)">
          <ellipse cx="200" cy="200" rx="185" ry="42" fill="none" stroke={`url(#${id}-ring)`} strokeWidth="14" />
          <ellipse cx="200" cy="200" rx="160" ry="35" fill="none" stroke={`url(#${id}-ring)`} strokeWidth="4" opacity="0.7" />
        </g>
      )}

      <circle cx="200" cy="200" r="120" fill={`url(#${id}-body)`} />

      <g clipPath={`url(#${id}-disc)`}>
        <g transform="rotate(-12 200 200)">
          <ellipse cx="200" cy="150" rx="150" ry="9" fill="#fff" opacity="0.14" />
          <ellipse cx="200" cy="178" rx="150" ry="14" fill={dark} opacity="0.22" />
          <ellipse cx="200" cy="208" rx="150" ry="7" fill="#fff" opacity="0.12" />
          <ellipse cx="200" cy="232" rx="150" ry="16" fill={dark} opacity="0.2" />
          <ellipse cx="200" cy="262" rx="150" ry="8" fill="#fff" opacity="0.1" />
        </g>
        <ellipse cx="248" cy="214" rx="26" ry="13" fill="#fff" opacity="0.16" transform="rotate(-12 248 214)" />
      </g>

      <circle cx="200" cy="200" r="120" fill={`url(#${id}-shade)`} />
      <circle cx="200" cy="200" r="119" fill="none" stroke="#fff" strokeOpacity="0.18" />

      {ring && (
        <g transform="rotate(-18 200 200)">
          <g clipPath={`url(#${id}-front)`}>
            <ellipse cx="200" cy="200" rx="185" ry="42" fill="none" stroke={`url(#${id}-ring)`} strokeWidth="14" />
            <ellipse cx="200" cy="200" rx="160" ry="35" fill="none" stroke={`url(#${id}-ring)`} strokeWidth="4" opacity="0.7" />
          </g>
        </g>
      )}
    </svg>
  );
};

export default Planet;
