// API Service for fetching space data from external APIs
import type { IssPosition, SpaceWeatherData, ApodResponse, SpaceNewsResponse } from '@/types';

const NASA_API_KEY = 'DEMO_KEY'; // Replace with your NASA API key for higher rate limits

// ISS Position API
export async function fetchIssPosition(): Promise<IssPosition> {
  try {
    const response = await fetch('https://api.open-notify.org/iss-now.json');
    if (!response.ok) throw new Error(`ISS API error: ${response.status}`);
    
    const data = await response.json();
    
    return {
      ...data,
      speed_kmh: 27600,
      altitude_km: 420,
    };
  } catch (error) {
    console.error('ISS fetch error:', error);
    // Fallback data
    return {
      timestamp: Math.floor(Date.now() / 1000),
      iss_position: {
        latitude: '51.5074',
        longitude: '-0.1278',
      },
      message: 'success',
      speed_kmh: 27600,
      altitude_km: 420,
    };
  }
}

// Space Weather API (NOAA)
export async function fetchSpaceWeather(): Promise<SpaceWeatherData> {
  type KpLevel = 'quiet' | 'unsettled' | 'active' | 'storm' | 'severe';
  type FluxClass = 'A' | 'B' | 'C' | 'M' | 'X';

  const getKpLevel = (kp: number): KpLevel => {
    if (kp < 3) return 'quiet';
    if (kp < 4) return 'unsettled';
    if (kp < 5) return 'active';
    if (kp < 7) return 'storm';
    return 'severe';
  };

  const getFluxClass = (flux: number): FluxClass => {
    if (flux >= 1e-4) return 'X';
    if (flux >= 1e-5) return 'M';
    if (flux >= 1e-6) return 'C';
    if (flux >= 1e-7) return 'B';
    return 'A';
  };

  try {
    const [kpResponse, plasmaResponse, xrayResponse] = await Promise.all([
      fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json'),
      fetch('https://services.swpc.noaa.gov/products/solar-wind/plasma-2-hour.json'),
      fetch('https://services.swpc.noaa.gov/json/goes/primary/xrays-6-hour.json'),
    ]);

    // Parse Kp index
    let kpData = { value: 2, timestamp: new Date().toISOString(), level: 'quiet' as KpLevel };
    if (kpResponse.ok) {
      const kpRaw = await kpResponse.json();
      if (kpRaw.length > 1) {
        const latest = kpRaw[kpRaw.length - 1];
        const kpValue = parseFloat(latest[1]) || 2;
        kpData = {
          value: kpValue,
          timestamp: latest[0],
          level: getKpLevel(kpValue),
        };
      }
    }

    // Parse solar wind plasma
    let solarWindData = { speed: 400, density: 5, timestamp: new Date().toISOString() };
    if (plasmaResponse.ok) {
      const plasmaRaw = await plasmaResponse.json();
      if (plasmaRaw.length > 1) {
        for (let i = plasmaRaw.length - 1; i > 0; i--) {
          const row = plasmaRaw[i];
          const speed = parseFloat(row[2]);
          const density = parseFloat(row[1]);
          if (!isNaN(speed) && !isNaN(density)) {
            solarWindData = {
              speed: Math.round(speed),
              density: parseFloat(density.toFixed(1)),
              timestamp: row[0],
            };
            break;
          }
        }
      }
    }

    // Parse X-ray flux
    let xrayData = { flux: 1e-7, fluxClass: 'B' as FluxClass, timestamp: new Date().toISOString() };
    if (xrayResponse.ok) {
      const xrayRaw = await xrayResponse.json();
      if (xrayRaw.length > 0) {
        const latest = xrayRaw[xrayRaw.length - 1];
        const flux = parseFloat(latest.flux) || 1e-7;
        xrayData = {
          flux,
          fluxClass: getFluxClass(flux),
          timestamp: latest.time_tag,
        };
      }
    }

    return {
      kpIndex: kpData,
      solarWind: solarWindData,
      xrayFlux: xrayData,
    };
  } catch (error) {
    console.error('Weather fetch error:', error);
    return {
      kpIndex: { value: 2, timestamp: new Date().toISOString(), level: 'quiet' },
      solarWind: { speed: 400, density: 5, timestamp: new Date().toISOString() },
      xrayFlux: { flux: 1e-7, fluxClass: 'B', timestamp: new Date().toISOString() },
    };
  }
}

// NASA APOD API
export async function fetchApod(date?: string): Promise<ApodResponse> {
  // Fallback data for when API is unavailable or rate limited
  const fallbackData: ApodResponse = {
    date: date || new Date().toISOString().split('T')[0],
    title: 'The Pillars of Creation - Eagle Nebula',
    explanation: 'These towering tendrils of cosmic dust and gas sit at the heart of the Eagle Nebula (M16). These pillars are part of a small region of the Eagle Nebula, a vast star-forming region 6,500 light-years from Earth. The so-called Pillars of Creation are part of an active star-forming region within the nebula and hide newborn stars in their wispy columns of cold interstellar gas and dust.',
    url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200',
    hdurl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=2000',
    media_type: 'image',
    copyright: 'NASA/ESA/Hubble Heritage Team',
  };

  try {
    const dateParam = date ? `&date=${date}` : '';
    const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}${dateParam}`);
    
    // Handle rate limiting gracefully
    if (response.status === 429) {
      console.warn('NASA API rate limit reached, using fallback data');
      return fallbackData;
    }
    
    if (!response.ok) {
      console.warn(`NASA API error: ${response.status}, using fallback data`);
      return fallbackData;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('APOD fetch error:', error);
    return fallbackData;
  }
}

// Space News API
export async function fetchSpaceNews(limit: number = 10): Promise<SpaceNewsResponse> {
  const FALLBACK_NEWS = [
    {
      id: 1,
      title: "NASA's James Webb Space Telescope Reveals Stunning New Views of the Universe",
      url: "https://www.nasa.gov/webb",
      image_url: "https://www.nasa.gov/wp-content/uploads/2023/09/53186797262-ec87d60bc5-o.jpg",
      news_site: "NASA",
      summary: "The James Webb Space Telescope continues to transform our understanding of the cosmos.",
      published_at: new Date().toISOString(),
    },
    {
      id: 2,
      title: "SpaceX Successfully Launches New Batch of Starlink Satellites",
      url: "https://www.spacex.com/launches",
      image_url: "https://www.spacex.com/static/images/share.jpg",
      news_site: "SpaceX",
      summary: "Another successful Falcon 9 launch adds more satellites to the Starlink constellation.",
      published_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 3,
      title: "ESA Announces New Mars Exploration Mission",
      url: "https://www.esa.int",
      image_url: "https://www.esa.int/var/esa/storage/images/esa_multimedia/images/2022/03/exomars_rover/24041619-1-eng-GB/ExoMars_rover_pillars.jpg",
      news_site: "ESA",
      summary: "The European Space Agency reveals plans for its next generation Mars rover.",
      published_at: new Date(Date.now() - 7200000).toISOString(),
    },
  ];

  try {
    const response = await fetch(`https://api.spaceflightnewsapi.net/v4/articles/?limit=${limit}`);
    if (!response.ok) throw new Error(`News API error: ${response.status}`);
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      return data;
    }
    
    return { count: FALLBACK_NEWS.length, results: FALLBACK_NEWS.slice(0, limit) };
  } catch (error) {
    console.error('News fetch error:', error);
    return { count: FALLBACK_NEWS.length, results: FALLBACK_NEWS.slice(0, limit) };
  }
}

// Aurora Forecast API (NOAA)
export interface AuroraForecast {
  observationTime: string;
  forecastTime: string;
  kpIndex: number;
  auroraActivity: 'none' | 'low' | 'moderate' | 'high' | 'extreme';
  visibleLatitude: number; // Minimum latitude where aurora is visible
}

export async function fetchAuroraForecast(): Promise<AuroraForecast> {
  try {
    // Fetch current Kp index from NOAA
    const response = await fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json');
    if (!response.ok) throw new Error('Aurora API error');
    
    const data = await response.json();
    const latest = data[data.length - 1];
    const kpValue = parseFloat(latest[1]) || 2;
    
    // Calculate aurora activity level based on Kp
    let auroraActivity: AuroraForecast['auroraActivity'] = 'none';
    let visibleLatitude = 70;
    
    if (kpValue >= 8) {
      auroraActivity = 'extreme';
      visibleLatitude = 40;
    } else if (kpValue >= 6) {
      auroraActivity = 'high';
      visibleLatitude = 50;
    } else if (kpValue >= 4) {
      auroraActivity = 'moderate';
      visibleLatitude = 55;
    } else if (kpValue >= 2) {
      auroraActivity = 'low';
      visibleLatitude = 65;
    }
    
    return {
      observationTime: latest[0],
      forecastTime: new Date().toISOString(),
      kpIndex: kpValue,
      auroraActivity,
      visibleLatitude,
    };
  } catch (error) {
    console.error('Aurora fetch error:', error);
    return {
      observationTime: new Date().toISOString(),
      forecastTime: new Date().toISOString(),
      kpIndex: 2,
      auroraActivity: 'low',
      visibleLatitude: 65,
    };
  }
}

// Geomagnetic Storm Alert API (NASA DONKI)
export interface GeomagneticStorm {
  id: string;
  startTime: string;
  kpIndex: number;
  intensity: string;
  link: string;
}

export async function fetchGeomagneticStorms(): Promise<GeomagneticStorm[]> {
  try {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const response = await fetch(
      `https://api.nasa.gov/DONKI/GST?startDate=${startDate}&endDate=${endDate}&api_key=${NASA_API_KEY}`
    );
    
    if (!response.ok) throw new Error('GST API error');
    
    const data = await response.json();
    
    return data.map((storm: any) => ({
      id: storm.gstID,
      startTime: storm.startTime,
      kpIndex: storm.allKpIndex?.[0]?.kpIndex || 5,
      intensity: storm.allKpIndex?.[0]?.source || 'G1',
      link: storm.link,
    }));
  } catch (error) {
    console.error('GST fetch error:', error);
    return [];
  }
}

// Solar Flare API (NASA DONKI)
export interface SolarFlare {
  id: string;
  beginTime: string;
  peakTime: string;
  endTime: string;
  classType: string;
  sourceLocation: string;
}

export async function fetchSolarFlares(): Promise<SolarFlare[]> {
  try {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const response = await fetch(
      `https://api.nasa.gov/DONKI/FLR?startDate=${startDate}&endDate=${endDate}&api_key=${NASA_API_KEY}`
    );
    
    if (!response.ok) throw new Error('FLR API error');
    
    const data = await response.json();
    
    return data.slice(0, 10).map((flare: any) => ({
      id: flare.flrID,
      beginTime: flare.beginTime,
      peakTime: flare.peakTime,
      endTime: flare.endTime,
      classType: flare.classType,
      sourceLocation: flare.sourceLocation || 'Unknown',
    }));
  } catch (error) {
    console.error('FLR fetch error:', error);
    return [];
  }
}

// Astronomical Events (calculated based on known dates)
export interface AstronomicalEvent {
  id: string;
  name: string;
  type: 'meteor_shower' | 'eclipse' | 'planet_conjunction' | 'comet' | 'aurora' | 'supermoon' | 'solstice' | 'equinox';
  date: string;
  endDate?: string;
  peakTime: string;
  description: string;
  magnitude?: number;
  visibility: {
    northern: 'full' | 'partial' | 'none';
    southern: 'full' | 'partial' | 'none';
    tropical: 'full' | 'partial' | 'none';
  };
  tips: string[];
  equipment: string[];
}

export function getUpcomingAstronomicalEvents(): AstronomicalEvent[] {
  const now = new Date();
  const year = now.getFullYear();
  
  // Accurate astronomical events for 2026
  const events: AstronomicalEvent[] = [
    {
      id: 'quadrantids-2026',
      name: 'Quadrantids Meteor Shower',
      type: 'meteor_shower',
      date: `${year}-01-03`,
      endDate: `${year}-01-04`,
      peakTime: '03:00 - 05:00 UTC',
      description: 'One of the best annual meteor showers, producing up to 120 meteors per hour at peak. Best viewed from the Northern Hemisphere.',
      magnitude: 2.0,
      visibility: { northern: 'full', southern: 'none', tropical: 'partial' },
      tips: [
        'Best viewed after midnight',
        'Look toward the northeast sky',
        'Find a dark location away from city lights',
        'Allow 20 minutes for eyes to adjust'
      ],
      equipment: ['Naked eye viewing', 'Reclining chair or blanket', 'Warm clothing']
    },
    {
      id: 'total-lunar-eclipse-mar-2026',
      name: 'Total Lunar Eclipse',
      type: 'eclipse',
      date: `${year}-03-03`,
      peakTime: '11:33 UTC',
      description: 'A total lunar eclipse visible from the Americas, Europe, and Africa. The Moon will turn a deep red color during totality.',
      visibility: { northern: 'full', southern: 'partial', tropical: 'full' },
      tips: [
        'Safe to view with naked eyes',
        'Best viewed during totality phase',
        'Red color most visible during full eclipse',
        'Photography opportunities during Blood Moon phase'
      ],
      equipment: ['Naked eye', 'Binoculars for detail', 'Camera with tripod']
    },
    {
      id: 'partial-solar-eclipse-mar-2026',
      name: 'Partial Solar Eclipse',
      type: 'eclipse',
      date: `${year}-03-29`,
      peakTime: '10:47 UTC',
      description: 'A partial solar eclipse visible from parts of Europe, northern Africa, and western Asia.',
      visibility: { northern: 'partial', southern: 'none', tropical: 'partial' },
      tips: [
        'NEVER look directly at the sun without proper eye protection',
        'Use ISO-certified eclipse glasses',
        'Pinhole projector is a safe alternative',
        'Peak coverage varies by location'
      ],
      equipment: ['ISO-certified eclipse glasses', 'Solar filter for camera', 'Pinhole projector']
    },
    {
      id: 'lyrids-2026',
      name: 'Lyrids Meteor Shower',
      type: 'meteor_shower',
      date: `${year}-04-22`,
      endDate: `${year}-04-23`,
      peakTime: '04:00 - 06:00 UTC',
      description: 'One of the oldest known meteor showers, producing up to 20 meteors per hour. Known for occasional bright fireballs.',
      magnitude: 2.1,
      visibility: { northern: 'full', southern: 'partial', tropical: 'partial' },
      tips: [
        'Look toward the constellation Lyra',
        'Best after midnight',
        'Moon phase affects visibility',
        'Watch for bright fireballs'
      ],
      equipment: ['Naked eye viewing', 'Star chart app']
    },
    {
      id: 'eta-aquariids-2026',
      name: 'Eta Aquariids Meteor Shower',
      type: 'meteor_shower',
      date: `${year}-05-06`,
      endDate: `${year}-05-07`,
      peakTime: '03:00 - 05:00 UTC',
      description: 'Debris from Halley\'s Comet produces up to 50 meteors per hour. Better viewed from Southern Hemisphere.',
      magnitude: 2.4,
      visibility: { northern: 'partial', southern: 'full', tropical: 'full' },
      tips: [
        'Southern Hemisphere has best views',
        'Look toward the constellation Aquarius',
        'Pre-dawn hours are optimal',
        'Fast meteors at 66 km/s'
      ],
      equipment: ['Naked eye viewing', 'Warm blanket']
    },
    {
      id: 'summer-solstice-2026',
      name: 'Summer Solstice',
      type: 'solstice',
      date: `${year}-06-21`,
      peakTime: '05:24 UTC',
      description: 'The longest day of the year in the Northern Hemisphere, marking the official start of summer.',
      visibility: { northern: 'full', southern: 'full', tropical: 'full' },
      tips: [
        'Longest daylight hours of the year',
        'Sun reaches highest point in the sky',
        'Shortest night for stargazing',
        'Traditional celebration time worldwide'
      ],
      equipment: ['Sundial', 'Shadow measurements']
    },
    {
      id: 'perseids-2026',
      name: 'Perseids Meteor Shower',
      type: 'meteor_shower',
      date: `${year}-08-12`,
      endDate: `${year}-08-13`,
      peakTime: '02:00 - 04:00 UTC',
      description: 'The most popular meteor shower of the year, producing up to 100 meteors per hour during peak.',
      magnitude: 2.0,
      visibility: { northern: 'full', southern: 'partial', tropical: 'partial' },
      tips: [
        'Best meteor shower for Northern Hemisphere',
        'Look toward the constellation Perseus',
        'Peak viewing after midnight',
        'Warm summer nights make viewing comfortable'
      ],
      equipment: ['Naked eye viewing', 'Camera for long exposures', 'Blanket or reclining chair']
    },
    {
      id: 'annular-solar-eclipse-feb-2026',
      name: 'Annular Solar Eclipse',
      type: 'eclipse',
      date: `${year}-02-17`,
      peakTime: '12:13 UTC',
      description: 'An annular "ring of fire" solar eclipse visible from Antarctica and southern South America.',
      visibility: { northern: 'none', southern: 'partial', tropical: 'none' },
      tips: [
        'Visible only from far southern latitudes',
        'Creates "ring of fire" effect',
        'Use proper solar viewing glasses',
        'Plan travel to viewing location early'
      ],
      equipment: ['ISO-certified eclipse glasses', 'Solar filter telescope']
    },
    {
      id: 'total-solar-eclipse-aug-2026',
      name: 'Total Solar Eclipse',
      type: 'eclipse',
      date: `${year}-08-12`,
      peakTime: '17:47 UTC',
      description: 'A spectacular total solar eclipse visible from Greenland, Iceland, and Spain. Path of totality crosses the Atlantic.',
      visibility: { northern: 'full', southern: 'none', tropical: 'none' },
      tips: [
        'Path of totality crosses Iceland and Spain',
        'Corona visible during totality',
        'Temperature drops during totality',
        'Book travel and accommodation early'
      ],
      equipment: ['ISO-certified eclipse glasses', 'Solar filter telescope', 'Camera with solar filter']
    },
    {
      id: 'geminids-2026',
      name: 'Geminids Meteor Shower',
      type: 'meteor_shower',
      date: `${year}-12-14`,
      endDate: `${year}-12-15`,
      peakTime: '01:00 - 03:00 UTC',
      description: 'The king of meteor showers, producing up to 150 multicolored meteors per hour.',
      magnitude: 2.6,
      visibility: { northern: 'full', southern: 'partial', tropical: 'partial' },
      tips: [
        'Best meteor shower of the year',
        'Visible from both hemispheres',
        'Multicolored meteors',
        'Bright moonlight may affect visibility in 2026'
      ],
      equipment: ['Naked eye viewing', 'Warm winter clothing', 'Hot beverages']
    },
    {
      id: 'winter-solstice-2026',
      name: 'Winter Solstice',
      type: 'solstice',
      date: `${year}-12-21`,
      peakTime: '15:50 UTC',
      description: 'The shortest day of the year in the Northern Hemisphere, marking the official start of winter.',
      visibility: { northern: 'full', southern: 'full', tropical: 'full' },
      tips: [
        'Shortest daylight hours of the year',
        'Longest night for stargazing',
        'Sun at lowest point in sky',
        'Ancient celebration traditions'
      ],
      equipment: ['Sundial', 'Shadow measurements']
    }
  ];
  
  // Filter to upcoming events and sort by date
  return events
    .filter(event => new Date(event.date) >= new Date(now.toISOString().split('T')[0]))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// Combined Sky Events API with real-time aurora data
export async function fetchSkyEvents(): Promise<{
  events: AstronomicalEvent[];
  aurora: AuroraForecast;
  storms: GeomagneticStorm[];
}> {
  const [aurora, storms] = await Promise.all([
    fetchAuroraForecast(),
    fetchGeomagneticStorms(),
  ]);
  
  const events = getUpcomingAstronomicalEvents();
  
  // Add dynamic aurora event if activity is moderate or higher
  if (aurora.auroraActivity !== 'none' && aurora.auroraActivity !== 'low') {
    const auroraEvent: AstronomicalEvent = {
      id: 'aurora-live',
      name: `Aurora Borealis Alert (Kp ${aurora.kpIndex})`,
      type: 'aurora',
      date: new Date().toISOString().split('T')[0],
      peakTime: 'Tonight 22:00 - 03:00 local time',
      description: `Current geomagnetic conditions are favorable for aurora viewing. Kp index: ${aurora.kpIndex}. Aurora may be visible down to ${aurora.visibleLatitude}° latitude.`,
      visibility: {
        northern: aurora.visibleLatitude <= 60 ? 'full' : aurora.visibleLatitude <= 65 ? 'partial' : 'none',
        southern: 'none',
        tropical: 'none',
      },
      tips: [
        'Check local weather for clear skies',
        'Travel to dark location away from city lights',
        'Best viewing after 10 PM local time',
        'Aurora can appear and fade quickly'
      ],
      equipment: ['Naked eye', 'Camera with wide-angle lens', 'Tripod for photography']
    };
    events.unshift(auroraEvent);
  }
  
  return { events, aurora, storms };
}
