import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Wind, Zap, Activity, Shield } from 'lucide-react';
import { fetchSpaceWeather } from '@/services/api';
import { getHumanImpact, getKpLevel } from '@/lib/constants';
import type { SpaceWeatherData } from '@/types';

const SpaceWeather = () => {
  const [weather, setWeather] = useState<SpaceWeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchSpaceWeather();
      setWeather(data);
      setLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-star-white/10 rounded w-1/2" />
          <div className="grid grid-cols-3 gap-4">
            <div className="h-24 bg-star-white/10 rounded" />
            <div className="h-24 bg-star-white/10 rounded" />
            <div className="h-24 bg-star-white/10 rounded" />
          </div>
        </div>
      </motion.div>
    );
  }

  if (!weather) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <p className="text-muted-foreground">Weather data unavailable</p>
      </motion.div>
    );
  }

  const kpLevel = getKpLevel(weather.kpIndex.value);
  const impact = getHumanImpact(weather.kpIndex.value);

  const severityColors: Record<string, { bg: string; text: string; glow: string }> = {
    low: { bg: 'bg-green-500/20', text: 'text-green-400', glow: 'shadow-green-500/30' },
    medium: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', glow: 'shadow-cyan-500/30' },
    high: { bg: 'bg-amber-500/20', text: 'text-amber-400', glow: 'shadow-amber-500/30' },
    critical: { bg: 'bg-red-500/20', text: 'text-red-400', glow: 'shadow-red-500/30' },
  };

  const colors = severityColors[impact.severity];

  const kpPercentage = (weather.kpIndex.value / 9) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card-hover relative overflow-hidden"
    >
      {/* Subtle glow */}
      <div className={`absolute top-0 right-0 w-32 h-32 ${colors.bg} blur-[80px] rounded-full`} />

      <div className="p-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Sun className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Space Weather</p>
              <h3 className="font-heading text-lg text-star-white">Solar Conditions</h3>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full ${colors.bg} ${colors.text} text-xs font-semibold uppercase tracking-wider`}>
            {kpLevel}
          </div>
        </div>

        {/* Kp Index Ring */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-star-white/10"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${kpPercentage * 3.52} 352`}
                className={colors.text}
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-heading text-3xl text-star-white">{weather.kpIndex.value.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">Kp Index</span>
            </div>
          </div>
        </div>

        {/* Impact Description */}
        <div className={`p-4 rounded-xl mb-6 ${colors.bg} border border-star-white/10`}>
          <div className="flex items-center gap-2 mb-2">
            <Shield className={`w-4 h-4 ${colors.text}`} />
            <span className={`text-sm font-semibold ${colors.text}`}>{impact.title}</span>
          </div>
          <p className="text-sm text-star-white/70">{impact.description}</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-star-white/5 border border-star-white/10 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Wind className="w-3 h-3 text-muted-foreground" />
            </div>
            <div className="font-heading text-lg text-star-white">{weather.solarWind.speed}</div>
            <div className="text-xs text-muted-foreground">km/s</div>
          </div>
          <div className="p-3 rounded-xl bg-star-white/5 border border-star-white/10 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Activity className="w-3 h-3 text-muted-foreground" />
            </div>
            <div className="font-heading text-lg text-star-white">{weather.solarWind.density}</div>
            <div className="text-xs text-muted-foreground">p/cm³</div>
          </div>
          <div className="p-3 rounded-xl bg-star-white/5 border border-star-white/10 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="w-3 h-3 text-muted-foreground" />
            </div>
            <div className="font-heading text-lg text-star-white">{weather.xrayFlux.fluxClass}</div>
            <div className="text-xs text-muted-foreground">X-Ray</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SpaceWeather;
