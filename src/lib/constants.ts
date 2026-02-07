// Mission data for Dashboard
export const missions = [
  {
    id: 'artemis-2',
    name: 'Artemis II',
    description: 'First crewed mission around the Moon since Apollo 17. Four astronauts will orbit the Moon in the Orion spacecraft.',
    agency: 'NASA',
    status: 'UPCOMING' as const,
    launchDate: '2025-09-01',
    planet: 'Moon',
    achievements: ['First crewed lunar mission in 50+ years', 'Test Orion life support systems'],
  },
  {
    id: 'jwst',
    name: 'James Webb Space Telescope',
    description: 'The most powerful space telescope ever built, observing the universe in infrared light.',
    agency: 'NASA/ESA',
    status: 'ACTIVE' as const,
    launchDate: '2021-12-25',
    achievements: ['Deepest infrared image of universe', 'Exoplanet atmosphere analysis', 'Early galaxy observations'],
  },
  {
    id: 'iss',
    name: 'International Space Station',
    description: 'Orbiting laboratory and home to astronauts from around the world since 2000.',
    agency: 'International',
    status: 'ACTIVE' as const,
    launchDate: '1998-11-20',
    achievements: ['25+ years of continuous habitation', '3,000+ scientific experiments', 'Platform for commercial spaceflight'],
  },
  {
    id: 'perseverance',
    name: 'Mars Perseverance Rover',
    description: 'Searching for signs of ancient microbial life and collecting rock samples for future return to Earth.',
    agency: 'NASA',
    status: 'ACTIVE' as const,
    launchDate: '2020-07-30',
    planet: 'Mars',
    achievements: ['First powered flight on another planet (Ingenuity)', 'Sample collection for Mars Sample Return'],
  },
  {
    id: 'europa-clipper',
    name: 'Europa Clipper',
    description: "Mission to investigate whether Jupiter's moon Europa could harbor conditions for life.",
    agency: 'NASA',
    status: 'ACTIVE' as const,
    launchDate: '2024-10-14',
    planet: 'Jupiter',
    achievements: ['Largest planetary spacecraft ever built', 'Will conduct ~50 flybys of Europa'],
  },
];

// Human impact translations based on Kp index
export function getHumanImpact(kp: number): { title: string; description: string; severity: 'low' | 'medium' | 'high' | 'critical' } {
  if (kp < 3) {
    return {
      title: 'Quiet Conditions',
      description: 'Normal space weather. GPS and communications operating normally.',
      severity: 'low',
    };
  } else if (kp < 5) {
    return {
      title: 'Unsettled Activity',
      description: 'Minor aurora visible at high latitudes. Slight GPS fluctuations possible.',
      severity: 'medium',
    };
  } else if (kp < 7) {
    return {
      title: 'Geomagnetic Storm',
      description: 'Aurora visible at mid-latitudes. GPS accuracy may be degraded. HF radio affected.',
      severity: 'high',
    };
  } else {
    return {
      title: 'Severe Storm',
      description: 'Aurora visible far from poles. Navigation systems impacted. Power grid monitoring active.',
      severity: 'critical',
    };
  }
}

// Kp level categorization
export function getKpLevel(kp: number): 'quiet' | 'unsettled' | 'active' | 'storm' | 'severe' {
  if (kp < 3) return 'quiet';
  if (kp < 4) return 'unsettled';
  if (kp < 5) return 'active';
  if (kp < 7) return 'storm';
  return 'severe';
}

// Time formatting utilities
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
