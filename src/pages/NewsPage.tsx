import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, ExternalLink, Clock, Search, Filter, ChevronDown } from 'lucide-react';
import PageLayout from '@/components/Layout/PageLayout';
import { fetchSpaceNews } from '@/services/api';
import { formatTimeAgo } from '@/lib/constants';
import type { SpaceNewsArticle } from '@/types';

const NewsPage = () => {
  const [news, setNews] = useState<SpaceNewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await fetchSpaceNews();
      setNews(data.results);
      setLoading(false);
    };
    fetchData();
  }, []);

  const categories = ['all', 'NASA', 'SpaceX', 'Rocket', 'Satellite', 'Moon', 'Mars'];

  const filteredNews = news.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedCategory === 'all') return matchesSearch;
    
    return matchesSearch && (
      item.title.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      item.summary.toLowerCase().includes(selectedCategory.toLowerCase())
    );
  });

  const visibleNews = filteredNews.slice(0, visibleCount);

  if (loading) {
    return (
      <PageLayout title="Space News" subtitle="Loading latest stories...">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card overflow-hidden animate-pulse">
              <div className="h-48 bg-star-white/10" />
              <div className="p-4">
                <div className="h-6 bg-star-white/10 rounded-lg w-3/4" />
                <div className="h-4 bg-star-white/10 rounded-lg w-full mt-3" />
                <div className="h-4 bg-star-white/10 rounded-lg w-2/3 mt-2" />
              </div>
            </div>
          ))}
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Space News" 
      subtitle={`${filteredNews.length} stories from across the cosmos`}
    >
      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 mb-6"
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-star-white/10 border border-star-white/10 focus:border-cosmic-glow focus:outline-none transition-colors text-star-white placeholder:text-muted-foreground"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            <Filter className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-cosmic-glow text-star-white'
                    : 'bg-star-white/10 text-star-white/70 hover:bg-star-white/20'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Featured Article */}
      {visibleNews.length > 0 && (
        <motion.a
          href={visibleNews[0].url}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="block glass-card overflow-hidden mb-6 group hover:border-cosmic-glow/30 transition-colors"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-64 md:h-auto overflow-hidden">
              <img
                src={visibleNews[0].image_url}
                alt={visibleNews[0].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-6 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-aurora-pink/20 text-aurora-pink text-xs font-semibold">
                  Featured
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTimeAgo(visibleNews[0].published_at)}
                </span>
              </div>
              <h2 className="font-heading text-2xl text-star-white mb-3 group-hover:text-cosmic-glow transition-colors">
                {visibleNews[0].title}
              </h2>
              <p className="text-star-white/70 line-clamp-3 mb-4">
                {visibleNews[0].summary}
              </p>
              <div className="flex items-center gap-2 text-cosmic-glow">
                <span className="font-semibold">Read More</span>
                <ExternalLink className="w-4 h-4" />
              </div>
            </div>
          </div>
        </motion.a>
      )}

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleNews.slice(1).map((item, index) => (
          <motion.a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + (index * 0.05) }}
            className="glass-card overflow-hidden group hover:border-cosmic-glow/30 transition-colors"
          >
            <div className="h-48 overflow-hidden">
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Clock className="w-3 h-3" />
                <span>{formatTimeAgo(item.published_at)}</span>
                <span className="text-star-white/30">•</span>
                <span>{item.news_site}</span>
              </div>
              <h3 className="font-heading text-star-white line-clamp-2 mb-2 group-hover:text-cosmic-glow transition-colors">
                {item.title}
              </h3>
              <p className="text-sm text-star-white/60 line-clamp-2">
                {item.summary}
              </p>
            </div>
          </motion.a>
        ))}
      </div>

      {/* Load More */}
      {visibleCount < filteredNews.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center mt-8"
        >
          <button
            onClick={() => setVisibleCount((prev) => prev + 12)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-star-white/10 hover:bg-star-white/20 transition-colors font-semibold"
          >
            <span>Load More</span>
            <ChevronDown className="w-5 h-5" />
          </button>
        </motion.div>
      )}

      {/* Empty State */}
      {filteredNews.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-12 text-center"
        >
          <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-heading text-xl text-star-white mb-2">No News Found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </motion.div>
      )}
    </PageLayout>
  );
};

export default NewsPage;
