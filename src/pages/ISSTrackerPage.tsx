import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Satellite, Navigation, Gauge, ArrowUp, Globe, Clock, RefreshCw } from 'lucide-react';
import PageLayout from '@/components/Layout/PageLayout';
import IssMap from '@/components/Dashboard/IssMap';
import { fetchIssPosition } from '@/services/api';
import type { IssPosition } from '@/types';

const ISSTrackerPage = () => {
  const [iss, setIss] = useState<IssPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [trail, setTrail] = useState<[number, number][]>([]);
  const [follow, setFollow] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const data = await fetchIssPosition();
    setIss(data);
    if (data.message === 'success') {
      // Keep roughly the last 15 minutes of positions for the ground-track line
      setTrail((prev) => [...prev, [parseFloat(data.iss_position.latitude), parseFloat(data.iss_position.longitude)] as [number, number]].slice(-90));
    }
    setLastUpdate(new Date());
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const live = iss?.message === 'success';
  const statusLabel = !iss ? 'Connecting' : live ? 'Live' : iss.message === 'stale' ? 'Last known' : 'Offline';
  const lat = iss ? parseFloat(iss.iss_position.latitude) : 0;
  const lon = iss ? parseFloat(iss.iss_position.longitude) : 0;
  const latLabel = lat >= 0 ? 'N' : 'S';
  const lonLabel = lon >= 0 ? 'E' : 'W';

  // Calculate map position (simple cylindrical projection)
  const mapX = ((lon + 180) / 360) * 100;
  const mapY = ((90 - lat) / 180) * 100;

  return (
    <PageLayout 
      title="ISS Tracker" 
      subtitle="Real-time tracking of the International Space Station"
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Map Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="xl:col-span-2 glass-card overflow-hidden"
        >
          {/* Live indicator */}
          <div className="p-4 border-b border-star-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cosmic-glow/20 flex items-center justify-center">
                <Globe className="w-5 h-5 text-cosmic-glow" />
              </div>
              <div>
                <h3 className="font-heading text-star-white">World Map</h3>
                <p className="text-xs text-muted-foreground">ISS Ground Track</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={fetchData}
                className="p-2 rounded-lg hover:bg-star-white/10 transition-colors"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
              </button>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  {live && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />}
                  <span className={`relative inline-flex h-2 w-2 rounded-full ${live ? 'bg-green-400' : 'bg-cosmic-gold'}`} />
                </span>
                <span className={`text-xs font-medium uppercase tracking-wider ${live ? 'text-green-400' : 'text-cosmic-gold'}`}>{statusLabel}</span>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="relative h-[22rem] sm:h-[28rem] xl:h-[32rem]">
            <IssMap lat={lat} lon={lon} trail={trail} follow={follow} />

            <div className="pointer-events-none absolute inset-x-3 bottom-3 z-[500] flex flex-wrap items-end justify-between gap-2 sm:inset-x-4 sm:bottom-4">
              <div className="rounded-xl border border-white/10 bg-space-deep/85 px-4 py-2 text-sm backdrop-blur">
                <span className="text-muted-foreground">Lat </span>
                <span className="font-mono text-star-white">{Math.abs(lat).toFixed(3)}° {latLabel}</span>
                <span className="ml-4 text-muted-foreground">Lon </span>
                <span className="font-mono text-star-white">{Math.abs(lon).toFixed(3)}° {lonLabel}</span>
              </div>
              <button
                onClick={() => setFollow((v) => !v)}
                className={`pointer-events-auto rounded-full border px-4 py-2 text-xs font-semibold backdrop-blur transition-colors ${
                  follow ? 'border-cosmic-pink/60 bg-cosmic-pink/15 text-cosmic-pink' : 'border-white/15 bg-space-deep/85 text-star-white/80 hover:text-star-white'
                }`}
                aria-pressed={follow}
              >
                {follow ? 'Following ISS' : 'Follow ISS'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Current Position */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-cosmic-glow/20 flex items-center justify-center">
                <Navigation className="w-5 h-5 text-cosmic-glow" />
              </div>
              <div>
                <h3 className="font-heading text-star-white">Current Position</h3>
                <p className="text-xs text-muted-foreground">Updated every 10 seconds</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-star-white/5 border border-star-white/10">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Latitude</div>
                <div className="flex items-baseline gap-1">
                  <span className="font-heading text-2xl text-star-white">{Math.abs(lat).toFixed(2)}°</span>
                  <span className="text-cosmic-glow font-medium">{latLabel}</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-star-white/5 border border-star-white/10">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Longitude</div>
                <div className="flex items-baseline gap-1">
                  <span className="font-heading text-2xl text-star-white">{Math.abs(lon).toFixed(2)}°</span>
                  <span className="text-cosmic-glow font-medium">{lonLabel}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Speed & Altitude */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-nebula-purple/20 flex items-center justify-center">
                <Gauge className="w-5 h-5 text-nebula-purple" />
              </div>
              <div>
                <h3 className="font-heading text-star-white">Orbital Data</h3>
                <p className="text-xs text-muted-foreground">Speed and altitude</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-star-white/5 border border-star-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Speed</span>
                  <Gauge className="w-4 h-4 text-nebula-purple" />
                </div>
                <div className="font-heading text-2xl text-star-white">
                  {(iss?.speed_kmh || 27600).toLocaleString()} <span className="text-sm text-muted-foreground">km/h</span>
                </div>
                <div className="mt-2 h-1 rounded-full bg-star-white/10 overflow-hidden">
                  <div className="h-full w-3/4 bg-nebula-purple rounded-full" />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-star-white/5 border border-star-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Altitude</span>
                  <ArrowUp className="w-4 h-4 text-aurora-pink" />
                </div>
                <div className="font-heading text-2xl text-star-white">
                  {iss?.altitude_km || 420} <span className="text-sm text-muted-foreground">km</span>
                </div>
                <div className="mt-2 h-1 rounded-full bg-star-white/10 overflow-hidden">
                  <div className="h-full w-1/2 bg-aurora-pink rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Last Update */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Last updated: {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Loading...'}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ISS Facts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {[
          { label: 'Orbit Period', value: '92', unit: 'minutes' },
          { label: 'Orbits Per Day', value: '15.5', unit: 'orbits' },
          { label: 'Crew Members', value: '7', unit: 'astronauts' },
        ].map((stat, i) => (
          <div key={stat.label} className="glass-card p-4 text-center">
            <div className="text-2xl font-heading text-star-white">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.unit}</div>
            <div className="text-sm text-star-white/70 mt-1">{stat.label}</div>
          </div>
        ))}
      </motion.div>
    </PageLayout>
  );
};

export default ISSTrackerPage;
