import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Satellite, Navigation, Gauge, ArrowUp } from 'lucide-react';
import { fetchIssPosition } from '@/services/api';
import type { IssPosition } from '@/types';

const ISSTracker = () => {
  const [iss, setIss] = useState<IssPosition | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchIssPosition();
      setIss(data);
      setLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
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
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-star-white/10 rounded" />
            <div className="h-20 bg-star-white/10 rounded" />
          </div>
        </div>
      </motion.div>
    );
  }

  if (!iss) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <p className="text-muted-foreground">ISS tracking unavailable</p>
      </motion.div>
    );
  }

  const lat = parseFloat(iss.iss_position.latitude);
  const lon = parseFloat(iss.iss_position.longitude);
  const latLabel = lat >= 0 ? 'N' : 'S';
  const lonLabel = lon >= 0 ? 'E' : 'W';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card-hover relative overflow-hidden"
    >
      {/* Glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-cosmic-glow/20 blur-[100px] rounded-full" />
      
      {/* Live indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        <span className="text-xs text-green-500 font-medium uppercase tracking-wider">Live</span>
      </div>

      <div className="p-6 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-cosmic-glow/20 flex items-center justify-center">
            <Satellite className="w-5 h-5 text-cosmic-glow" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">International Space Station</p>
            <h3 className="font-heading text-lg text-star-white">Real-Time Position</h3>
          </div>
        </div>

        {/* Position Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-star-white/5 border border-star-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Navigation className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Latitude</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-heading text-2xl text-star-white">{Math.abs(lat).toFixed(2)}°</span>
              <span className="text-cosmic-glow font-medium">{latLabel}</span>
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-star-white/5 border border-star-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Navigation className="w-4 h-4 text-muted-foreground rotate-90" />
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Longitude</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-heading text-2xl text-star-white">{Math.abs(lon).toFixed(2)}°</span>
              <span className="text-cosmic-glow font-medium">{lonLabel}</span>
            </div>
          </div>
        </div>

        {/* Speed & Altitude */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-star-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-nebula-purple/20 flex items-center justify-center">
              <Gauge className="w-4 h-4 text-nebula-purple" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Speed</div>
              <div className="font-heading text-star-white">
                {(iss.speed_kmh || 27600).toLocaleString()} <span className="text-xs text-muted-foreground">km/h</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-aurora-pink/20 flex items-center justify-center">
              <ArrowUp className="w-4 h-4 text-aurora-pink" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Altitude</div>
              <div className="font-heading text-star-white">
                {iss.altitude_km || 420} <span className="text-xs text-muted-foreground">km</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ISSTracker;
