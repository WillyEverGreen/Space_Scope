import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Calendar, User, X, ExternalLink } from 'lucide-react';
import { fetchApod } from '@/services/api';
import type { ApodResponse } from '@/types';

const ApodViewer = () => {
  const [apod, setApod] = useState<ApodResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchApod();
      setApod(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden"
      >
        <div className="aspect-video bg-star-white/5 animate-pulse" />
        <div className="p-6 space-y-4">
          <div className="h-6 bg-star-white/10 rounded w-2/3" />
          <div className="h-4 bg-star-white/10 rounded w-full" />
          <div className="h-4 bg-star-white/10 rounded w-3/4" />
        </div>
      </motion.div>
    );
  }

  if (!apod) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <p className="text-muted-foreground">Unable to load today's cosmic moment.</p>
      </motion.div>
    );
  }

  const isVideo = apod.media_type === 'video';

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-hover overflow-hidden cursor-pointer group"
        onClick={() => !isVideo && !imageError && setIsFullscreen(true)}
      >
        {/* Image/Video Container */}
        <div className="relative aspect-video w-full overflow-hidden bg-space-deep">
          {isVideo ? (
            <iframe
              src={apod.url}
              title={apod.title}
              className="w-full h-full"
              allowFullScreen
            />
          ) : (
            <>
              <img
                src={apod.url}
                alt={apod.title}
                className={`
                  w-full h-full object-cover 
                  transition-transform duration-700 
                  group-hover:scale-105
                  ${imageError ? 'hidden' : 'block'}
                `}
                onError={() => setImageError(true)}
                loading="lazy"
              />
              
              {imageError && (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6">
                  <Sparkles className="w-12 h-12 text-muted-foreground" />
                  <span className="text-muted-foreground text-sm">Image temporarily unavailable</span>
                </div>
              )}

              {/* Gradient Overlay */}
              {!imageError && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-space-deep via-transparent to-transparent opacity-80" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="px-5 py-2.5 rounded-full glass-card text-sm font-medium text-star-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      View Full Image
                    </span>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Header Badge */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cosmic-glow/20 text-cosmic-glow text-xs font-medium">
              <Sparkles className="w-3 h-3" />
              NASA APOD
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {apod.date}
            </div>
          </div>

          {/* Title */}
          <h3 className="font-heading text-xl text-star-white mb-3 group-hover:text-cosmic-glow transition-colors">
            {apod.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {apod.explanation}
          </p>

          {/* Footer */}
          {apod.copyright && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-4 border-t border-star-white/10">
              <User className="w-3 h-3" />
              <span>{apod.copyright}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-space-deep/95 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setIsFullscreen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-6xl w-full max-h-[90vh] overflow-hidden rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsFullscreen(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-space-deep/80 backdrop-blur-md flex items-center justify-center text-star-white hover:bg-space-deep transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* HD Image */}
              <img
                src={apod.hdurl || apod.url}
                alt={apod.title}
                className="w-full h-full object-contain"
              />

              {/* Info Footer */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-space-deep to-transparent">
                <h4 className="font-heading text-xl text-star-white mb-2">{apod.title}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2">{apod.explanation}</p>
                <a
                  href={`https://apod.nasa.gov/apod/ap${apod.date.replace(/-/g, '').slice(2)}.html`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 text-cosmic-glow text-sm hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  View on NASA APOD
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ApodViewer;
