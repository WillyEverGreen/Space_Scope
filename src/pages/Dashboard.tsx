import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Telescope, 
  Satellite, 
  Sun, 
  Newspaper, 
  Rocket,
  Camera,
  ChevronRight,
  Globe,
  Activity,
  Zap,
} from 'lucide-react';

import '@fontsource/space-grotesk/300.css';
import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

import PageLayout from '@/components/Layout/PageLayout';
import { fetchIssPosition, fetchSpaceWeather, fetchApod, fetchSpaceNews } from '@/services/api';
import { getKpLevel } from '@/lib/constants';
import type { IssPosition, SpaceWeatherData, ApodResponse, SpaceNewsArticle } from '@/types';

const Dashboard = () => {
  const [issPosition, setIssPosition] = useState<IssPosition | null>(null);
  const [weather, setWeather] = useState<SpaceWeatherData | null>(null);
  const [apod, setApod] = useState<ApodResponse | null>(null);
  const [news, setNews] = useState<SpaceNewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      const [issData, weatherData, apodData, newsData] = await Promise.all([
        fetchIssPosition(),
        fetchSpaceWeather(),
        fetchApod(),
        fetchSpaceNews(),
      ]);
      setIssPosition(issData);
      setWeather(weatherData);
      setApod(apodData);
      setNews(newsData.results);
      setLoading(false);
    };
    fetchAllData();
  }, []);

  const kpLevel = weather ? getKpLevel(weather.kpIndex.value) : 'quiet';

  const features = [
    {
      title: 'ISS Tracker',
      description: 'Track the International Space Station in real-time as it orbits Earth at 28,000 km/h',
      icon: Satellite,
      href: '/dashboard/iss',
      color: 'bg-cyan-500/20 text-cyan-400',
      preview: issPosition ? (
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>Lat: {parseFloat(issPosition.iss_position.latitude).toFixed(2)}°</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Lon: {parseFloat(issPosition.iss_position.longitude).toFixed(2)}°</span>
          </div>
        </div>
      ) : null,
    },
    {
      title: 'Space Weather',
      description: 'Monitor solar activity, geomagnetic conditions, and X-ray flux from the Sun',
      icon: Sun,
      href: '/dashboard/weather',
      color: 'bg-amber-500/20 text-amber-400',
      preview: weather ? (
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Kp Index: {weather.kpIndex.value.toFixed(1)}</span>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-xs ${
            kpLevel === 'quiet' ? 'bg-green-500/20 text-green-400' :
            kpLevel === 'unsettled' ? 'bg-cyan-500/20 text-cyan-400' :
            kpLevel === 'storm' ? 'bg-amber-500/20 text-amber-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {kpLevel.toUpperCase()}
          </span>
        </div>
      ) : null,
    },
    {
      title: 'Picture of the Day',
      description: 'NASA\'s daily selection of stunning astronomical imagery and cosmic wonders',
      icon: Camera,
      href: '/dashboard/apod',
      color: 'bg-aurora-pink/20 text-aurora-pink',
      preview: apod ? (
        <div className="flex items-center gap-3 text-sm">
          <img 
            src={apod.url} 
            alt={apod.title}
            className="w-16 h-12 object-cover rounded-lg"
          />
          <span className="line-clamp-1 text-star-white/70">{apod.title}</span>
        </div>
      ) : null,
    },
    {
      title: 'Space News',
      description: 'Latest headlines and breaking news from across the space industry',
      icon: Newspaper,
      href: '/dashboard/news',
      color: 'bg-nebula-purple/20 text-nebula-purple',
      preview: news.length > 0 ? (
        <div className="text-sm text-star-white/70 line-clamp-1">
          {news[0].title}
        </div>
      ) : null,
    },
    {
      title: 'Active Missions',
      description: 'Explore humanity\'s ongoing missions to Mars, the Moon, and beyond',
      icon: Rocket,
      href: '/dashboard/missions',
      color: 'bg-green-500/20 text-green-400',
      preview: (
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-star-white/70">8 Active Missions</span>
        </div>
      ),
    },
  ];

  return (
    <PageLayout 
      title="Mission Control" 
      subtitle="Your gateway to real-time space data and cosmic intelligence"
    >
      {/* Quick Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        {[
          { label: 'ISS Altitude', value: '408 km', icon: Satellite },
          { label: 'Solar Activity', value: weather?.xrayFlux.fluxClass || 'B', icon: Sun },
          { label: 'News Today', value: `${news.length}+`, icon: Newspaper },
          { label: 'Active Missions', value: '8', icon: Rocket },
        ].map((stat, i) => (
          <div key={stat.label} className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cosmic-glow/20 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-cosmic-glow" />
              </div>
              <div>
                <div className="font-heading text-xl text-star-white">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + (index * 0.05) }}
          >
            <Link
              to={feature.href}
              className="block glass-card p-6 group hover:border-cosmic-glow/30 transition-all h-full"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl ${feature.color.split(' ')[0]} flex items-center justify-center flex-shrink-0`}>
                  <feature.icon className={`w-6 h-6 ${feature.color.split(' ')[1]}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-lg text-star-white mb-1 group-hover:text-cosmic-glow transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {feature.description}
                  </p>
                  
                  {/* Preview Data */}
                  {loading ? (
                    <div className="h-4 bg-star-white/10 rounded animate-pulse w-3/4" />
                  ) : (
                    feature.preview
                  )}
                </div>
              </div>
              
              {/* Arrow */}
              <div className="flex items-center gap-1 mt-4 text-cosmic-glow opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-sm font-medium">Explore</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* APOD Highlight */}
      {apod && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Link
            to="/dashboard/apod"
            className="block glass-card overflow-hidden group hover:border-cosmic-glow/30 transition-all"
          >
            <div className="grid md:grid-cols-2">
              <div className="h-64 md:h-auto overflow-hidden">
                {apod.media_type === 'video' ? (
                  <div className="w-full h-full bg-space-navy/50 flex items-center justify-center">
                    <Camera className="w-12 h-12 text-muted-foreground" />
                  </div>
                ) : (
                  <img
                    src={apod.url}
                    alt={apod.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
              </div>
              <div className="p-6 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-3">
                  <Camera className="w-5 h-5 text-aurora-pink" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    Astronomy Picture of the Day
                  </span>
                </div>
                <h2 className="font-heading text-2xl text-star-white mb-3 group-hover:text-cosmic-glow transition-colors">
                  {apod.title}
                </h2>
                <p className="text-star-white/70 line-clamp-3 mb-4">
                  {apod.explanation}
                </p>
                <div className="flex items-center gap-1 text-cosmic-glow">
                  <span className="font-semibold">View Full Image</span>
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      )}
    </PageLayout>
  );
};

export default Dashboard;
