import { useState } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Calendar, Building2, ChevronRight, CheckCircle, Globe, MoonStar, Satellite, Telescope } from 'lucide-react';
import PageLayout from '@/components/Layout/PageLayout';
import { missions } from '@/lib/constants';

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-500/20 text-green-400 border-green-500/30',
  UPCOMING: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  COMPLETED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const planetIcons: Record<string, React.ElementType> = {
  Moon: MoonStar,
  Mars: Globe,
  Jupiter: Satellite,
};

const MissionsPage = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [expandedMission, setExpandedMission] = useState<string | null>(null);

  const statuses = ['all', 'ACTIVE', 'UPCOMING', 'COMPLETED'];

  const filteredMissions = selectedStatus === 'all' 
    ? missions 
    : missions.filter((m) => m.status === selectedStatus);

  // Sort by launch date (newest first for active, oldest for others)
  const sortedMissions = [...filteredMissions].sort(
    (a, b) => new Date(b.launchDate).getTime() - new Date(a.launchDate).getTime()
  );

  const activeMissions = missions.filter((m) => m.status === 'ACTIVE').length;
  const upcomingMissions = missions.filter((m) => m.status === 'UPCOMING').length;

  return (
    <PageLayout 
      title="Space Missions" 
      subtitle="Humanity's ongoing exploration of the cosmos"
    >
      {/* Status Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 mb-6"
      >
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                selectedStatus === status
                  ? 'bg-cosmic-glow text-star-white'
                  : 'bg-star-white/10 text-star-white/70 hover:bg-star-white/20'
              }`}
            >
              {status === 'all' ? 'All Missions' : status}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
      >
        {[
          { label: 'Total Missions', value: missions.length, icon: Rocket },
          { label: 'Active', value: activeMissions, icon: Telescope },
          { label: 'Upcoming', value: upcomingMissions, icon: Calendar },
          { label: 'Agencies', value: '4+', icon: Building2 },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cosmic-glow/20 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-cosmic-glow" />
              </div>
              <div>
                <div className="font-heading text-2xl text-star-white">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Mission Cards */}
      <div className="space-y-4">
        {sortedMissions.map((mission, index) => {
          const isExpanded = expandedMission === mission.id;
          const Icon = mission.planet ? (planetIcons[mission.planet] || Globe) : Rocket;
          const statusColor = statusColors[mission.status] || statusColors.ACTIVE;

          return (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + (index * 0.05) }}
              className={`glass-card p-6 cursor-pointer transition-all hover:border-cosmic-glow/30 ${
                isExpanded ? 'border-cosmic-glow/30' : ''
              }`}
              onClick={() => setExpandedMission(isExpanded ? null : mission.id)}
            >
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl ${statusColor.split(' ')[0]} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-7 h-7 ${statusColor.split(' ')[1]}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor}`}>
                      {mission.status}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {mission.agency}
                    </span>
                  </div>
                  
                  <h3 className="font-heading text-xl text-star-white mb-1">{mission.name}</h3>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {mission.status === 'UPCOMING' ? 'Planned: ' : 'Launched: '}
                        {new Date(mission.launchDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                    {mission.planet && (
                      <div className="flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        <span>{mission.planet}</span>
                      </div>
                    )}
                  </div>

                  {/* Expanded Content */}
                  <motion.div
                    initial={false}
                    animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 mt-4 border-t border-star-white/10">
                      <p className="text-star-white/80 leading-relaxed mb-4">
                        {mission.description}
                      </p>
                      
                      {mission.achievements && mission.achievements.length > 0 && (
                        <>
                          <h4 className="font-semibold text-star-white mb-3 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            Key Achievements
                          </h4>
                          <ul className="space-y-2">
                            {mission.achievements.map((achievement, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-star-white/70">
                                <ChevronRight className="w-4 h-4 text-cosmic-glow flex-shrink-0 mt-0.5" />
                                {achievement}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  </motion.div>

                  {/* Expand Indicator */}
                  <div className="mt-4 flex items-center gap-1 text-sm text-cosmic-glow">
                    <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    <span>{isExpanded ? 'Show Less' : 'View Details'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredMissions.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-12 text-center"
        >
          <Rocket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-heading text-xl text-star-white mb-2">No Missions Found</h3>
          <p className="text-muted-foreground">
            Try selecting a different status filter
          </p>
        </motion.div>
      )}
    </PageLayout>
  );
};

export default MissionsPage;
