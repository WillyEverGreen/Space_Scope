import { motion } from 'framer-motion';
import { Rocket, Calendar, CheckCircle, Clock, Circle } from 'lucide-react';
import { missions } from '@/lib/constants';

const MissionsPanel = () => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Circle className="w-3 h-3 fill-green-500 text-green-500" />;
      case 'COMPLETED':
        return <CheckCircle className="w-3 h-3 text-cyan-400" />;
      case 'UPCOMING':
        return <Clock className="w-3 h-3 text-amber-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500/20 text-green-400';
      case 'COMPLETED':
        return 'bg-cyan-500/20 text-cyan-400';
      case 'UPCOMING':
        return 'bg-amber-500/20 text-amber-400';
      default:
        return 'bg-star-white/20 text-star-white';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-cosmic-glow/20 flex items-center justify-center">
          <Rocket className="w-5 h-5 text-cosmic-glow" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Space Exploration</p>
          <h3 className="font-heading text-lg text-star-white">Active Missions</h3>
        </div>
      </div>

      {/* Missions List */}
      <div className="space-y-3">
        {missions.slice(0, 5).map((mission, index) => (
          <motion.div
            key={mission.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-xl bg-star-white/5 border border-star-white/10 hover:border-cosmic-glow/30 transition-all group"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(mission.status)}
                <h4 className="font-heading text-star-white group-hover:text-cosmic-glow transition-colors">
                  {mission.name}
                </h4>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(mission.status)}`}>
                {mission.status}
              </span>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {mission.description}
            </p>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Agency:</span>
                <span className="text-star-white font-medium">{mission.agency}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {new Date(mission.launchDate).toLocaleDateString('en-US', { 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </div>
            </div>

            {/* Achievements */}
            {mission.achievements && mission.achievements.length > 0 && (
              <div className="mt-3 pt-3 border-t border-star-white/10">
                <div className="flex flex-wrap gap-2">
                  {mission.achievements.slice(0, 2).map((achievement, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 rounded-full bg-nebula-purple/10 text-nebula-purple"
                    >
                      {achievement}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default MissionsPanel;
