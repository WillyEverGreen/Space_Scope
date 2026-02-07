import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Satellite, Navigation, Gauge, ArrowUp, Globe, Clock, RefreshCw } from 'lucide-react';
import PageLayout from '@/components/Layout/PageLayout';
import { fetchIssPosition } from '@/services/api';
import type { IssPosition } from '@/types';

const ISSTrackerPage = () => {
  const [iss, setIss] = useState<IssPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const data = await fetchIssPosition();
    setIss(data);
    setLastUpdate(new Date());
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

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
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-xs text-green-500 font-medium uppercase tracking-wider">Live</span>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="relative aspect-[2/1] bg-space-deep">
            {/* World map background */}
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 500'%3E%3Crect fill='%230a0a1a' width='1000' height='500'/%3E%3Cg fill='none' stroke='%234338ca' stroke-width='0.5' opacity='0.5'%3E%3Cpath d='M0,250 L1000,250 M500,0 L500,500'/%3E%3C/g%3E%3Cg fill='%231e1b4b' opacity='0.5'%3E%3Cellipse cx='250' cy='200' rx='120' ry='80'/%3E%3Cellipse cx='150' cy='280' rx='60' ry='40'/%3E%3Cellipse cx='750' cy='220' rx='100' ry='60'/%3E%3Cellipse cx='600' cy='180' rx='80' ry='50'/%3E%3Cellipse cx='400' cy='150' rx='60' ry='40'/%3E%3Cellipse cx='850' cy='300' rx='40' ry='30'/%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: 'cover',
              }}
            />

            {/* Grid lines */}
            <div className="absolute inset-0">
              {[...Array(7)].map((_, i) => (
                <div 
                  key={`h-${i}`}
                  className="absolute left-0 right-0 border-t border-star-white/5"
                  style={{ top: `${(i + 1) * 14.28}%` }}
                />
              ))}
              {[...Array(12)].map((_, i) => (
                <div 
                  key={`v-${i}`}
                  className="absolute top-0 bottom-0 border-l border-star-white/5"
                  style={{ left: `${(i + 1) * 8.33}%` }}
                />
              ))}
            </div>

            {/* ISS Position Marker */}
            {iss && (
              <motion.div
                animate={{ x: `${mapX}%`, y: `${mapY}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: 0, top: 0 }}
              >
                {/* Pulse ring */}
                <div className="absolute inset-0 -m-4">
                  <div className="w-8 h-8 rounded-full bg-cosmic-glow/30 animate-ping" />
                </div>
                {/* Icon */}
                <div className="relative w-10 h-10 rounded-full bg-cosmic-glow flex items-center justify-center shadow-lg shadow-cosmic-glow/50">
                  <Satellite className="w-5 h-5 text-star-white" />
                </div>
                {/* Label */}
                <div className="absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <div className="px-3 py-1 rounded-full glass-card text-xs font-medium text-star-white">
                    ISS
                  </div>
                </div>
              </motion.div>
            )}

            {/* Coordinates overlay */}
            <div className="absolute bottom-4 left-4 glass-card px-4 py-2 rounded-lg">
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Lat: </span>
                  <span className="text-star-white font-mono">{Math.abs(lat).toFixed(4)}° {latLabel}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Lon: </span>
                  <span className="text-star-white font-mono">{Math.abs(lon).toFixed(4)}° {lonLabel}</span>
                </div>
              </div>
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
