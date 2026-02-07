import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Wind, Zap, Activity, Shield, RefreshCw, AlertTriangle, Check } from 'lucide-react';
import PageLayout from '@/components/Layout/PageLayout';
import { fetchSpaceWeather } from '@/services/api';
import { getHumanImpact, getKpLevel } from '@/lib/constants';
import type { SpaceWeatherData } from '@/types';

const SpaceWeatherPage = () => {
  const [weather, setWeather] = useState<SpaceWeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const data = await fetchSpaceWeather();
    setWeather(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, []);

  const kpLevel = weather ? getKpLevel(weather.kpIndex.value) : 'quiet';
  const impact = weather ? getHumanImpact(weather.kpIndex.value) : { title: '', description: '', severity: 'low' as const };

  const severityColors: Record<string, { bg: string; text: string; border: string }> = {
    low: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
    medium: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
    high: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
    critical: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  };

  const colors = severityColors[impact.severity];
  const kpPercentage = weather ? (weather.kpIndex.value / 9) * 100 : 0;

  if (loading && !weather) {
    return (
      <PageLayout title="Space Weather" subtitle="Loading solar conditions...">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="h-32 bg-star-white/10 rounded-lg" />
            </div>
          ))}
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Space Weather" 
      subtitle="Real-time solar and geomagnetic conditions"
    >
      {/* Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`glass-card p-6 mb-6 ${colors.bg} border ${colors.border}`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center`}>
              <Shield className={`w-6 h-6 ${colors.text}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`font-heading text-xl ${colors.text}`}>{impact.title}</h3>
                <span className={`px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} text-xs font-semibold uppercase`}>
                  {kpLevel}
                </span>
              </div>
              <p className="text-star-white/70 text-sm mt-1">{impact.description}</p>
            </div>
          </div>
          <button 
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-star-white/10 hover:bg-star-white/20 transition-colors text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kp Index - Large Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1 glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Sun className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-heading text-star-white">Kp Index</h3>
              <p className="text-xs text-muted-foreground">Geomagnetic activity</p>
            </div>
          </div>

          {/* Large Ring */}
          <div className="flex items-center justify-center py-8">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-star-white/10"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${kpPercentage * 5.02} 502`}
                  className={colors.text}
                  style={{ transition: 'stroke-dasharray 0.5s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-heading text-5xl text-star-white">
                  {weather?.kpIndex.value.toFixed(1)}
                </span>
                <span className="text-muted-foreground mt-1">of 9</span>
              </div>
            </div>
          </div>

          {/* Scale */}
          <div className="flex justify-between text-xs text-muted-foreground mt-4">
            <span>Quiet</span>
            <span>Unsettled</span>
            <span>Storm</span>
            <span>Severe</span>
          </div>
          <div className="h-2 rounded-full bg-gradient-to-r from-green-500 via-amber-500 to-red-500 mt-2" />
        </motion.div>

        {/* Solar Wind Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Wind className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-heading text-star-white">Solar Wind</h3>
              <p className="text-xs text-muted-foreground">Particle stream from the Sun</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Speed */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Speed</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  (weather?.solarWind.speed || 0) > 500 ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'
                }`}>
                  {(weather?.solarWind.speed || 0) > 500 ? 'Elevated' : 'Normal'}
                </span>
              </div>
              <div className="font-heading text-3xl text-star-white mb-2">
                {weather?.solarWind.speed} <span className="text-sm text-muted-foreground">km/s</span>
              </div>
              <div className="h-2 rounded-full bg-star-white/10 overflow-hidden">
                <div 
                  className="h-full bg-cyan-400 rounded-full transition-all"
                  style={{ width: `${Math.min(((weather?.solarWind.speed || 0) / 800) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0</span>
                <span>400</span>
                <span>800 km/s</span>
              </div>
            </div>

            {/* Density */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Density</span>
              </div>
              <div className="font-heading text-3xl text-star-white mb-2">
                {weather?.solarWind.density} <span className="text-sm text-muted-foreground">p/cm³</span>
              </div>
              <div className="h-2 rounded-full bg-star-white/10 overflow-hidden">
                <div 
                  className="h-full bg-nebula-purple rounded-full transition-all"
                  style={{ width: `${Math.min(((weather?.solarWind.density || 0) / 20) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* X-Ray Flux Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-aurora-pink/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-aurora-pink" />
            </div>
            <div>
              <h3 className="font-heading text-star-white">X-Ray Flux</h3>
              <p className="text-xs text-muted-foreground">Solar flare activity</p>
            </div>
          </div>

          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-aurora-pink/20 flex items-center justify-center mx-auto mb-4">
                <span className="font-heading text-4xl text-aurora-pink">
                  {weather?.xrayFlux.fluxClass}
                </span>
              </div>
              <p className="text-muted-foreground text-sm">Flux Class</p>
            </div>
          </div>

          {/* Flux Scale */}
          <div className="mt-4">
            <div className="flex justify-between mb-2">
              {['A', 'B', 'C', 'M', 'X'].map((cls) => (
                <div
                  key={cls}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center font-heading ${
                    weather?.xrayFlux.fluxClass === cls
                      ? 'bg-aurora-pink text-star-white'
                      : 'bg-star-white/10 text-muted-foreground'
                  }`}
                >
                  {cls}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              A-B: Quiet | C: Minor | M: Moderate | X: Major
            </p>
          </div>
        </motion.div>
      </div>

      {/* Impact Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {[
          { 
            label: 'GPS Navigation', 
            status: weather?.kpIndex.value && weather.kpIndex.value < 5 ? 'normal' : 'affected',
            icon: weather?.kpIndex.value && weather.kpIndex.value < 5 ? Check : AlertTriangle,
          },
          { 
            label: 'Radio Communications', 
            status: weather?.xrayFlux.fluxClass && ['A', 'B', 'C'].includes(weather.xrayFlux.fluxClass) ? 'normal' : 'affected',
            icon: weather?.xrayFlux.fluxClass && ['A', 'B', 'C'].includes(weather.xrayFlux.fluxClass) ? Check : AlertTriangle,
          },
          { 
            label: 'Power Grid', 
            status: weather?.kpIndex.value && weather.kpIndex.value < 7 ? 'normal' : 'affected',
            icon: weather?.kpIndex.value && weather.kpIndex.value < 7 ? Check : AlertTriangle,
          },
        ].map((item, i) => (
          <div key={item.label} className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                item.status === 'normal' ? 'bg-green-500/20' : 'bg-amber-500/20'
              }`}>
                <item.icon className={`w-5 h-5 ${
                  item.status === 'normal' ? 'text-green-400' : 'text-amber-400'
                }`} />
              </div>
              <div>
                <div className="text-star-white font-medium">{item.label}</div>
                <div className={`text-sm ${
                  item.status === 'normal' ? 'text-green-400' : 'text-amber-400'
                }`}>
                  {item.status === 'normal' ? 'Operating Normally' : 'May be Affected'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </PageLayout>
  );
};

export default SpaceWeatherPage;
