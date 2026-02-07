import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Clock, MapPin, Sunrise, Sunset, Calendar } from 'lucide-react';

const QuickStats = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Try to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        () => {
          // Default to a location if geolocation fails
          setLocation({ lat: 40.7128, lon: -74.006 });
        }
      );
    }

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date, format: 'local' | 'utc') => {
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };
    
    if (format === 'utc') {
      return date.toLocaleTimeString('en-US', { ...options, timeZone: 'UTC' });
    }
    return date.toLocaleTimeString('en-US', options);
  };

  const stats = [
    {
      icon: Clock,
      label: 'Local Time',
      value: formatTime(currentTime, 'local'),
      color: 'text-cosmic-glow',
      bgColor: 'bg-cosmic-glow/20',
    },
    {
      icon: Clock,
      label: 'UTC Time',
      value: formatTime(currentTime, 'utc'),
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-400/20',
    },
    {
      icon: MapPin,
      label: 'Your Location',
      value: location 
        ? `${Math.abs(location.lat).toFixed(1)}°${location.lat >= 0 ? 'N' : 'S'}, ${Math.abs(location.lon).toFixed(1)}°${location.lon >= 0 ? 'E' : 'W'}`
        : 'Detecting...',
      color: 'text-nebula-purple',
      bgColor: 'bg-nebula-purple/20',
    },
    {
      icon: Calendar,
      label: 'Date',
      value: currentTime.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      color: 'text-aurora-pink',
      bgColor: 'bg-aurora-pink/20',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glass-card p-4"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              <p className={`font-heading text-lg ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default QuickStats;
