// API Service for fetching space data from external APIs
import type { IssPosition, SpaceWeatherData, ApodResponse, SpaceNewsResponse } from '@/types';

// In production NASA calls go through the /api/nasa serverless proxy, which holds the key
// (NASA_API_KEY on the host). In local development they go straight to api.nasa.gov using
// VITE_NASA_API_KEY from .env, falling back to the heavily throttled DEMO_KEY.
function nasaUrl(endpoint: 'apod' | 'flr' | 'gst', params: Record<string, string | undefined> = {}): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) query.set(key, value);

  if (import.meta.env.DEV) {
    const paths = { apod: 'planetary/apod', flr: 'DONKI/FLR', gst: 'DONKI/GST' };
    query.set('api_key', import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY');
    return `https://api.nasa.gov/${paths[endpoint]}?${query}`;
  }
  query.set('endpoint', endpoint);
  return `/api/nasa?${query}`;
}

const REQUEST_TIMEOUT_MS = 10000;

/** fetch with a hard timeout so a stalled upstream never leaves the UI waiting. */
async function request(url: string, init: RequestInit = {}): Promise<Response> {
  return fetch(url, { ...init, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
}

// ISS Position API (wheretheiss.at: HTTPS, CORS-enabled, includes altitude and velocity)
let lastIssPosition: IssPosition | null = null;

export async function fetchIssPosition(): Promise<IssPosition> {
  try {
    const response = await request('https://api.wheretheiss.at/v1/satellites/25544');
    if (!response.ok) throw new Error(`ISS API error: ${response.status}`);

    const data = await response.json();
    lastIssPosition = {
      timestamp: data.timestamp,
      iss_position: {
        latitude: String(data.latitude),
        longitude: String(data.longitude),
      },
      message: 'success',
      speed_kmh: Math.round(data.velocity),
      altitude_km: Math.round(data.altitude),
    };
    return lastIssPosition;
  } catch (error) {
    console.error('ISS fetch error:', error);
    // Prefer the last good reading over an invented position
    if (lastIssPosition) return { ...lastIssPosition, message: 'stale' };
    return {
      timestamp: Math.floor(Date.now() / 1000),
      iss_position: { latitude: '0', longitude: '0' },
      message: 'unavailable',
      speed_kmh: 27600,
      altitude_km: 420,
    };
  }
}

// Solar wind: speed from the small NOAA summary feed, density from the newest real-time record.
// The real-time file is ~2 MB, so only the first few KB are requested (newest records come first).
async function fetchSolarWind(): Promise<{ speed: number; density: number; timestamp: string }> {
  const [speedRes, rtswRes] = await Promise.all([
    request('https://services.swpc.noaa.gov/products/summary/solar-wind-speed.json'),
    request('https://services.swpc.noaa.gov/json/rtsw/rtsw_wind_1m.json', { headers: { Range: 'bytes=0-24000' } }),
  ]);
  if (!speedRes.ok) throw new Error(`Solar wind speed error: ${speedRes.status}`);

  const [{ proton_speed, time_tag }] = await speedRes.json();
  let density = NaN;
  if (rtswRes.ok) {
    const records = (await rtswRes.text()).match(/\{[^{}]*\}/g) ?? [];
    for (const raw of records) {
      try {
        const row = JSON.parse(raw);
        if (typeof row.proton_density === 'number' && row.proton_density >= 0) {
          density = row.proton_density;
          break;
        }
      } catch {
        // the final record is cut off by the Range request; ignore it
      }
    }
  }

  return {
    speed: Math.round(Number(proton_speed)),
    density: Number.isFinite(density) ? parseFloat(density.toFixed(1)) : 0,
    timestamp: time_tag,
  };
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
    // Each feed is independent: one failing must not blank the others
    const [kpResult, windResult, xrayResult] = await Promise.allSettled([
      request('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json'),
      fetchSolarWind(),
      request('https://services.swpc.noaa.gov/json/goes/primary/xrays-6-hour.json'),
    ]);

    // Kp index: array of { time_tag, Kp }, oldest first
    let kpData = { value: 2, timestamp: new Date().toISOString(), level: 'quiet' as KpLevel };
    if (kpResult.status === 'fulfilled' && kpResult.value.ok) {
      const kpRaw: { time_tag: string; Kp: number }[] = await kpResult.value.json();
      const latest = kpRaw[kpRaw.length - 1];
      if (latest && Number.isFinite(Number(latest.Kp))) {
        const kpValue = Number(latest.Kp);
        kpData = { value: kpValue, timestamp: latest.time_tag, level: getKpLevel(kpValue) };
      }
    }

    // Solar wind
    const solarWindData =
      windResult.status === 'fulfilled'
        ? windResult.value
        : { speed: 400, density: 5, timestamp: new Date().toISOString() };

    // X-ray flux: flare class is defined on the long (0.1-0.8 nm) channel
    let xrayData = { flux: 1e-7, fluxClass: 'B' as FluxClass, timestamp: new Date().toISOString() };
    if (xrayResult.status === 'fulfilled' && xrayResult.value.ok) {
      const xrayRaw: { flux: number; time_tag: string; energy: string }[] = await xrayResult.value.json();
      const longChannel = xrayRaw.filter((r) => r.energy === '0.1-0.8nm');
      const latest = longChannel[longChannel.length - 1];
      if (latest && Number(latest.flux) > 0) {
        const flux = Number(latest.flux);
        xrayData = { flux, fluxClass: getFluxClass(flux), timestamp: latest.time_tag };
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

interface ApodBasic {
  date: string;
  title: string;
  explanation: string;
  media_type: string;
  url: string;
  hdurl?: string;
  copyright?: string;
  credit?: string;
}

const stripHtml = (html: string) =>
  html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// NASA APOD API
export async function fetchApod(date?: string): Promise<ApodResponse> {
  // Fallback data for when API is unavailable or rate limited
  const fallbackData: ApodResponse = {
    date: date || new Date().toISOString().split('T')[0],
    title: "Today's picture is unavailable",
    explanation: "NASA's Astronomy Picture of the Day service is rate-limited or unreachable right now, so a stock night-sky photo is shown instead. Please try again in a few minutes.",
    url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200',
    hdurl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=2000',
    media_type: 'image',
  };


  // The legacy api.nasa.gov/planetary/apod endpoint now returns a "NASA Science" placeholder, so the
  // science.nasa.gov feed (latest 25 entries, newest first) is the source. For image entries its `url`
  // is the article page and `hdurl` is the actual picture. Video entries without a still are skipped.
  try {
    const response = await request('https://science.nasa.gov/wp-json/wp/v2/apod-basic?per_page=25');
    if (response.ok) {
      const entries: ApodBasic[] = await response.json();
      const entry = date ? entries.find((e) => e.date === date) : entries.find((e) => e.hdurl);
      if (entry?.hdurl) {
        return {
          date: entry.date,
          title: entry.title,
          explanation: stripHtml(entry.explanation).replace(/^Explanation:\s*/i, ''),
          url: entry.hdurl,
          hdurl: entry.hdurl,
          media_type: 'image',
          copyright: stripHtml(entry.copyright ?? entry.credit ?? '').replace(/^Image Credit:\s*/i, '') || undefined,
        };
      }
    }
  } catch (error) {
    console.warn('APOD fetch failed:', error);
  }
  return fallbackData;
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
    const response = await request(`https://api.spaceflightnewsapi.net/v4/articles/?limit=${limit}`);
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
    const response = await request('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json');
    if (!response.ok) throw new Error('Aurora API error');
    
    const data: { time_tag: string; Kp: number }[] = await response.json();
    const latest = data[data.length - 1];
    const kpValue = Number.isFinite(Number(latest?.Kp)) ? Number(latest.Kp) : 2;
    
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
      observationTime: latest?.time_tag ?? new Date().toISOString(),
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
    
    const response = await request(
      nasaUrl('gst', { startDate, endDate })
    );
    
    if (!response.ok) throw new Error('GST API error');
    
    const data = await response.json();
    
    return (data as DonkiStorm[]).map((storm) => ({
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

// Raw NASA DONKI payloads (only the fields we read)
interface DonkiStorm {
  gstID: string;
  startTime: string;
  link: string;
  allKpIndex?: { kpIndex: number; source: string }[];
}

interface DonkiFlare {
  flrID: string;
  beginTime: string;
  peakTime: string;
  endTime: string;
  classType: string;
  sourceLocation?: string;
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
    
    const response = await request(
      nasaUrl('flr', { startDate, endDate })
    );
    
    if (!response.ok) throw new Error('FLR API error');
    
    const data = await response.json();
    
    return (data as DonkiFlare[]).slice(0, 10).map((flare) => ({
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

type Visibility = AstronomicalEvent['visibility'];

interface RecurringEvent {
  id: string;
  name: string;
  type: AstronomicalEvent['type'];
  month: number; // 1-12
  day: number;
  endDay?: number;
  peakTime: string;
  description: string;
  magnitude?: number;
  visibility: Visibility;
  tips: string[];
  equipment: string[];
}

// Annual events recur on (almost) the same date every year, so they are generated for the
// current and next year instead of being tied to one year.
const RECURRING_EVENTS: RecurringEvent[] = [
  {
    id: 'quadrantids', name: 'Quadrantids Meteor Shower', type: 'meteor_shower', month: 1, day: 3, endDay: 4,
    peakTime: 'Peak in the pre-dawn hours',
    description: 'One of the strongest annual showers, with up to about 120 meteors per hour at a sharp, brief peak. Best viewed from the Northern Hemisphere.',
    magnitude: 2.0, visibility: { northern: 'full', southern: 'none', tropical: 'partial' },
    tips: ['Best viewed after midnight', 'Look toward the northeast sky', 'Find a dark location away from city lights', 'Allow 20 minutes for your eyes to adjust'],
    equipment: ['Naked eye viewing', 'Reclining chair or blanket', 'Warm clothing'],
  },
  {
    id: 'spring-equinox', name: 'March Equinox', type: 'equinox', month: 3, day: 20,
    peakTime: 'Date varies by a day each year',
    description: 'Day and night are nearly equal worldwide as the Sun crosses the celestial equator, marking the start of spring in the north and autumn in the south.',
    visibility: { northern: 'full', southern: 'full', tropical: 'full' },
    tips: ['The Sun rises almost due east and sets almost due west', 'Good day to calibrate a sundial or compass', 'Day length is close to 12 hours everywhere'],
    equipment: ['Compass', 'Sundial'],
  },
  {
    id: 'lyrids', name: 'Lyrids Meteor Shower', type: 'meteor_shower', month: 4, day: 22, endDay: 23,
    peakTime: 'Best after midnight',
    description: 'One of the oldest known showers, producing up to about 20 meteors per hour and the occasional bright fireball.',
    magnitude: 2.1, visibility: { northern: 'full', southern: 'partial', tropical: 'partial' },
    tips: ['Look toward the constellation Lyra', 'Best after midnight', 'Moonlight reduces how many meteors you see', 'Watch for bright fireballs'],
    equipment: ['Naked eye viewing', 'Star chart app'],
  },
  {
    id: 'eta-aquariids', name: 'Eta Aquariids Meteor Shower', type: 'meteor_shower', month: 5, day: 5, endDay: 6,
    peakTime: 'Pre-dawn hours',
    description: "Debris from Halley's Comet produces up to about 50 meteors per hour. Better viewed from the Southern Hemisphere and the tropics.",
    magnitude: 2.4, visibility: { northern: 'partial', southern: 'full', tropical: 'full' },
    tips: ['Southern latitudes have the best views', 'Look toward the constellation Aquarius', 'The pre-dawn hours are optimal', 'Meteors are fast, around 66 km/s'],
    equipment: ['Naked eye viewing', 'Warm blanket'],
  },
  {
    id: 'summer-solstice', name: 'June Solstice', type: 'solstice', month: 6, day: 21,
    peakTime: 'Date varies by a day each year',
    description: 'The longest day of the year in the Northern Hemisphere and the shortest in the Southern Hemisphere.',
    visibility: { northern: 'full', southern: 'full', tropical: 'full' },
    tips: ['Longest daylight of the year in the north', 'The Sun reaches its highest point in the sky', 'Shortest night for stargazing in the north'],
    equipment: ['Sundial', 'Shadow measurements'],
  },
  {
    id: 'perseids', name: 'Perseids Meteor Shower', type: 'meteor_shower', month: 8, day: 12, endDay: 13,
    peakTime: 'Best between midnight and dawn',
    description: 'The most popular shower of the year, producing up to about 100 meteors per hour at its peak.',
    magnitude: 2.0, visibility: { northern: 'full', southern: 'partial', tropical: 'partial' },
    tips: ['Look toward the constellation Perseus', 'Peak viewing is after midnight', 'Warm summer nights make long sessions comfortable', 'No equipment needed'],
    equipment: ['Naked eye viewing', 'Camera for long exposures', 'Blanket or reclining chair'],
  },
  {
    id: 'autumn-equinox', name: 'September Equinox', type: 'equinox', month: 9, day: 22,
    peakTime: 'Date varies by a day each year',
    description: 'Day and night are nearly equal worldwide, marking the start of autumn in the north and spring in the south.',
    visibility: { northern: 'full', southern: 'full', tropical: 'full' },
    tips: ['The Sun rises almost due east and sets almost due west', 'Good time to watch for early-season aurora at high latitudes', 'Day length is close to 12 hours everywhere'],
    equipment: ['Compass', 'Sundial'],
  },
  {
    id: 'orionids', name: 'Orionids Meteor Shower', type: 'meteor_shower', month: 10, day: 21, endDay: 22,
    peakTime: 'Best after midnight',
    description: "Another shower from Halley's Comet, producing around 20 fast meteors per hour that often leave persistent trains.",
    magnitude: 2.5, visibility: { northern: 'full', southern: 'full', tropical: 'full' },
    tips: ['Look toward the constellation Orion', 'Visible from both hemispheres', 'Meteors are fast and often leave glowing trails'],
    equipment: ['Naked eye viewing', 'Warm clothing'],
  },
  {
    id: 'leonids', name: 'Leonids Meteor Shower', type: 'meteor_shower', month: 11, day: 17, endDay: 18,
    peakTime: 'Best in the hours before dawn',
    description: 'Fast, bright meteors from comet Tempel-Tuttle, around 15 per hour in a typical year.',
    magnitude: 2.5, visibility: { northern: 'full', southern: 'full', tropical: 'full' },
    tips: ['Look toward the constellation Leo', 'Best after midnight', 'Meteors are very fast, around 71 km/s'],
    equipment: ['Naked eye viewing', 'Warm clothing'],
  },
  {
    id: 'geminids', name: 'Geminids Meteor Shower', type: 'meteor_shower', month: 12, day: 13, endDay: 14,
    peakTime: 'Active all night, peak near 2 AM',
    description: 'Often the best shower of the year, producing up to about 120 multicolored meteors per hour.',
    magnitude: 2.6, visibility: { northern: 'full', southern: 'partial', tropical: 'partial' },
    tips: ['Visible from late evening onward', 'Look toward the constellation Gemini', 'Multicolored meteors are common', 'Moonlight can wash out fainter meteors'],
    equipment: ['Naked eye viewing', 'Warm winter clothing', 'Hot beverages'],
  },
  {
    id: 'winter-solstice', name: 'December Solstice', type: 'solstice', month: 12, day: 21,
    peakTime: 'Date varies by a day each year',
    description: 'The shortest day of the year in the Northern Hemisphere and the longest in the Southern Hemisphere.',
    visibility: { northern: 'full', southern: 'full', tropical: 'full' },
    tips: ['Longest night for stargazing in the north', 'The Sun is at its lowest point in the sky', 'Longest daylight of the year in the south'],
    equipment: ['Sundial', 'Shadow measurements'],
  },
];

// One-off events with published dates
const ECLIPSES: AstronomicalEvent[] = [
  {
    id: 'annular-solar-eclipse-2026-02-17', name: 'Annular Solar Eclipse', type: 'eclipse', date: '2026-02-17',
    peakTime: 'Around 12:00 UTC',
    description: 'An annular "ring of fire" solar eclipse, centered on Antarctica with a partial eclipse visible from the far south of South America and Africa.',
    visibility: { northern: 'none', southern: 'partial', tropical: 'none' },
    tips: ['Visible only from far southern latitudes', 'Never look at the Sun without certified eclipse glasses', 'Plan travel to the viewing area early'],
    equipment: ['ISO-certified eclipse glasses', 'Solar filter for telescope or camera'],
  },
  {
    id: 'total-lunar-eclipse-2026-03-03', name: 'Total Lunar Eclipse', type: 'eclipse', date: '2026-03-03',
    peakTime: 'Around 11:30 UTC',
    description: 'A total lunar eclipse visible from the Pacific region, the Americas, Asia and Australia. The Moon turns a deep red during totality.',
    visibility: { northern: 'full', southern: 'full', tropical: 'full' },
    tips: ['Safe to watch with the naked eye', 'Totality lasts for around an hour', 'Binoculars show the red colour well'],
    equipment: ['Naked eye', 'Binoculars', 'Camera with tripod'],
  },
  {
    id: 'total-solar-eclipse-2026-08-12', name: 'Total Solar Eclipse', type: 'eclipse', date: '2026-08-12',
    peakTime: 'Around 17:45 UTC',
    description: 'A total solar eclipse crossing Greenland, Iceland and northern Spain, with a partial eclipse over much of Europe and the North Atlantic.',
    visibility: { northern: 'full', southern: 'none', tropical: 'none' },
    tips: ['The path of totality crosses Iceland and Spain', 'The Sun is low in the sky at totality, so find a clear western horizon', 'Never look at the Sun without certified eclipse glasses outside totality'],
    equipment: ['ISO-certified eclipse glasses', 'Solar filter telescope', 'Camera with solar filter'],
  },
  {
    id: 'partial-lunar-eclipse-2026-08-28', name: 'Partial Lunar Eclipse', type: 'eclipse', date: '2026-08-28',
    peakTime: 'Around 04:15 UTC',
    description: 'A deep partial lunar eclipse, with most of the Moon entering Earth\'s shadow. Visible from the Americas, Europe and Africa.',
    visibility: { northern: 'full', southern: 'full', tropical: 'full' },
    tips: ['Safe to watch with the naked eye', 'Look for the dark bite taken from the Moon', 'Binoculars improve the view'],
    equipment: ['Naked eye', 'Binoculars'],
  },
  {
    id: 'annular-solar-eclipse-2027-02-06', name: 'Annular Solar Eclipse', type: 'eclipse', date: '2027-02-06',
    peakTime: 'Around 16:00 UTC',
    description: 'An annular solar eclipse crossing Chile, Argentina and the South Atlantic, with a partial eclipse over parts of South America and Africa.',
    visibility: { northern: 'none', southern: 'full', tropical: 'partial' },
    tips: ['The ring phase is visible along a narrow path', 'Never look at the Sun without certified eclipse glasses'],
    equipment: ['ISO-certified eclipse glasses', 'Solar filter for telescope or camera'],
  },
  {
    id: 'total-solar-eclipse-2027-08-02', name: 'Total Solar Eclipse', type: 'eclipse', date: '2027-08-02',
    peakTime: 'Around 10:00 UTC',
    description: 'A long total solar eclipse crossing southern Spain, North Africa and the Middle East, with more than six minutes of totality near Luxor in Egypt.',
    visibility: { northern: 'full', southern: 'none', tropical: 'full' },
    tips: ['One of the longest totalities of the century', 'Book travel and accommodation early', 'Never look at the Sun without certified eclipse glasses outside totality'],
    equipment: ['ISO-certified eclipse glasses', 'Solar filter telescope', 'Camera with solar filter'],
  },
];

const isoDay = (d: Date) => d.toISOString().split('T')[0];
const pad = (n: number) => String(n).padStart(2, '0');

export function getUpcomingAstronomicalEvents(): AstronomicalEvent[] {
  const now = new Date();
  const today = isoDay(now);
  const year = now.getUTCFullYear();

  const recurring: AstronomicalEvent[] = [year, year + 1].flatMap((y) =>
    RECURRING_EVENTS.map(({ month, day, endDay, id, ...rest }) => ({
      ...rest,
      id: `${id}-${y}`,
      date: `${y}-${pad(month)}-${pad(day)}`,
      endDate: endDay ? `${y}-${pad(month)}-${pad(endDay)}` : undefined,
    })),
  );

  return [...recurring, ...ECLIPSES]
    .filter((event) => (event.endDate ?? event.date) >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
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
