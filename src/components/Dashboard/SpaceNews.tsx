import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, ExternalLink, Clock } from 'lucide-react';
import { fetchSpaceNews } from '@/services/api';
import { formatTimeAgo } from '@/lib/constants';
import type { SpaceNewsArticle } from '@/types';

const SpaceNews = () => {
  const [articles, setArticles] = useState<SpaceNewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchSpaceNews(6);
      setArticles(data.results);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-aurora-pink/20 flex items-center justify-center">
            <Newspaper className="w-5 h-5 text-aurora-pink" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Latest Updates</p>
            <h3 className="font-heading text-lg text-star-white">Space News</h3>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="w-24 h-20 bg-star-white/10 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-star-white/10 rounded w-full" />
                <div className="h-4 bg-star-white/10 rounded w-3/4" />
                <div className="h-3 bg-star-white/10 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (articles.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <p className="text-muted-foreground">No news available</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-aurora-pink/20 flex items-center justify-center">
            <Newspaper className="w-5 h-5 text-aurora-pink" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Latest Updates</p>
            <h3 className="font-heading text-lg text-star-white">Space News</h3>
          </div>
        </div>
      </div>

      {/* Articles List */}
      <div className="space-y-4">
        {articles.map((article, index) => (
          <motion.a
            key={article.id}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex gap-4 p-3 -mx-3 rounded-xl hover:bg-star-white/5 transition-colors group"
          >
            {/* Thumbnail */}
            {article.image_url && (
              <div className="w-24 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-space-deep">
                <img
                  src={article.image_url}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Meta */}
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-0.5 rounded-full bg-nebula-purple/20 text-nebula-purple text-xs font-medium">
                  {article.news_site}
                </span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {formatTimeAgo(article.published_at)}
                </div>
              </div>

              {/* Title */}
              <h4 className="font-medium text-star-white line-clamp-2 group-hover:text-cosmic-glow transition-colors">
                {article.title}
              </h4>
            </div>

            {/* Arrow */}
            <div className="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </div>
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
};

export default SpaceNews;
