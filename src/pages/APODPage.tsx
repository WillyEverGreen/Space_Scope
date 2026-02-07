import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Calendar, ExternalLink, ChevronLeft, ChevronRight, Expand, X, User } from 'lucide-react';
import PageLayout from '@/components/Layout/PageLayout';
import { fetchApod } from '@/services/api';
import type { ApodResponse } from '@/types';

const APODPage = () => {
  const [apod, setApod] = useState<ApodResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [imageError, setImageError] = useState(false);

  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200';

  const formatDateForApi = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const fetchData = async (date: Date) => {
    setLoading(true);
    setImageError(false);
    const data = await fetchApod(formatDateForApi(date));
    setApod(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData(currentDate);
  }, [currentDate]);

  const goToPreviousDay = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    setCurrentDate(prev);
  };

  const goToNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    next.setHours(0, 0, 0, 0);
    // Don't allow navigating to future dates
    if (next <= today) {
      setCurrentDate(next);
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const today = new Date();
  const isToday = formatDateForApi(currentDate) === formatDateForApi(today);
  const isFutureDate = currentDate > today;

  if (loading && !apod) {
    return (
      <PageLayout title="Astronomy Picture of the Day" subtitle="Loading today's cosmic wonder...">
        <div className="glass-card p-6 animate-pulse">
          <div className="aspect-video bg-star-white/10 rounded-xl" />
          <div className="h-8 bg-star-white/10 rounded-lg mt-6 w-3/4" />
          <div className="h-4 bg-star-white/10 rounded-lg mt-4 w-1/4" />
          <div className="h-24 bg-star-white/10 rounded-lg mt-6" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Astronomy Picture of the Day" 
      subtitle="NASA's daily cosmic wonder"
    >
      {/* Date Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 mb-6"
      >
        <div className="flex items-center justify-between">
          <button
            onClick={goToPreviousDay}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-star-white/10 hover:bg-star-white/20 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-cosmic-glow" />
            <span className="font-heading text-lg">
              {currentDate.toLocaleDateString('en-US', { 
                weekday: 'short',
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </span>
            {!isToday && (
              <button
                onClick={goToToday}
                className="px-3 py-1 rounded-full bg-cosmic-glow/20 text-cosmic-glow text-sm hover:bg-cosmic-glow/30 transition-colors"
              >
                Today
              </button>
            )}
          </div>

          <button
            onClick={goToNextDay}
            disabled={isToday}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isToday 
                ? 'bg-star-white/5 text-muted-foreground cursor-not-allowed' 
                : 'bg-star-white/10 hover:bg-star-white/20'
            }`}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 glass-card p-4"
        >
          <div className="relative group">
            {apod?.media_type === 'video' ? (
              <div className="aspect-video rounded-xl overflow-hidden">
                <iframe
                  src={apod.url}
                  title={apod.title}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            ) : (
              <>
                <img
                  src={imageError ? FALLBACK_IMAGE : apod?.url}
                  alt={apod?.title}
                  className="w-full rounded-xl object-cover cursor-pointer"
                  onClick={() => setIsFullscreen(true)}
                  onError={() => setImageError(true)}
                />
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="absolute bottom-4 right-4 p-3 rounded-xl bg-space-navy/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-space-navy"
                >
                  <Expand className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </motion.div>

        {/* Info Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-aurora-pink/20 flex items-center justify-center">
              <Camera className="w-5 h-5 text-aurora-pink" />
            </div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              NASA APOD
            </span>
          </div>

          <h2 className="font-heading text-2xl text-star-white mb-4">
            {apod?.title}
          </h2>

          {apod?.copyright && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <User className="w-4 h-4" />
              <span>© {apod.copyright}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Calendar className="w-4 h-4" />
            <span>{apod?.date}</span>
          </div>

          {apod?.hdurl && apod.media_type === 'image' && (
            <a
              href={apod.hdurl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-cosmic-glow to-nebula-purple text-star-white font-semibold hover:opacity-90 transition-opacity"
            >
              <ExternalLink className="w-4 h-4" />
              View HD Image
            </a>
          )}
        </motion.div>
      </div>

      {/* Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 glass-card p-6"
      >
        <h3 className="font-heading text-lg text-star-white mb-4">About This Image</h3>
        <p className="text-star-white/80 leading-relaxed">
          {apod?.explanation}
        </p>
      </motion.div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && apod?.media_type === 'image' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-space-navy/95 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setIsFullscreen(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-7xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={apod.hdurl || apod.url}
                alt={apod.title}
                className="max-w-full max-h-[90vh] object-contain rounded-xl"
              />
              <button
                onClick={() => setIsFullscreen(false)}
                className="absolute top-4 right-4 p-3 rounded-xl bg-space-navy/80 backdrop-blur-sm hover:bg-space-navy transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-space-navy/90 to-transparent rounded-b-xl">
                <h3 className="font-heading text-xl text-star-white">{apod.title}</h3>
                {apod.copyright && (
                  <p className="text-sm text-star-white/70 mt-1">© {apod.copyright}</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageLayout>
  );
};

export default APODPage;
