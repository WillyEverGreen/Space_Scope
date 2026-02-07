// SpaceScope TypeScript Definitions

// === API Response Types ===

export interface ApodResponse {
  date: string;
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: 'image' | 'video';
  copyright?: string;
  thumbnail_url?: string;
}

export interface IssPosition {
  timestamp: number;
  iss_position: {
    latitude: string;
    longitude: string;
  };
  message: string;
  speed_kmh?: number;
  altitude_km?: number;
}

export interface SpaceWeatherData {
  kpIndex: KpIndexData;
  solarWind: SolarWindData;
  xrayFlux: XrayFluxData;
}

export interface KpIndexData {
  value: number;
  timestamp: string;
  level: 'quiet' | 'unsettled' | 'active' | 'storm' | 'severe';
}

export interface SolarWindData {
  speed: number;
  density: number;
  temperature?: number;
  bz?: number;
  timestamp: string;
}

export interface XrayFluxData {
  flux: number;
  fluxClass: 'A' | 'B' | 'C' | 'M' | 'X';
  timestamp: string;
}

export interface SpaceNewsArticle {
  id: number;
  title: string;
  url: string;
  image_url: string;
  news_site: string;
  summary: string;
  published_at: string;
}

export interface SpaceNewsResponse {
  count: number;
  results: SpaceNewsArticle[];
}

// Mission Types
export type MissionStatus = 'ACTIVE' | 'COMPLETED' | 'UPCOMING';

export interface Mission {
  id: string;
  name: string;
  description: string;
  agency: string;
  status: MissionStatus;
  launchDate: string;
  planet?: string;
  imageUrl?: string;
  achievements?: string[];
}

// Sky Events Types
export type VisibilityLevel = 'full' | 'partial' | 'none';

export interface SkyEvent {
  id: string;
  name: string;
  type: 'meteor_shower' | 'eclipse' | 'planet_conjunction' | 'comet' | 'aurora' | 'supermoon';
  date: string;
  peakTime?: string;
  description: string;
  visibilityZones: VisibilityZone[];
  tips: string[];
  equipment?: string[];
  magnitude?: number;
  duration?: string;
}

export interface VisibilityZone {
  id: string;
  name: string;
  visibility: VisibilityLevel;
  coordinates: [number, number][]; // Array of [lat, lng] pairs forming a polygon
  bestViewingTime?: string;
  cloudCover?: number;
  lightPollution?: 'low' | 'medium' | 'high';
}

export interface PersonalizedEventInfo {
  eventId: string;
  userLocation: {
    lat: number;
    lng: number;
    name?: string;
  };
  visibility: VisibilityLevel;
  bestViewingTime: string;
  weatherForecast?: string;
  personalTips: string[];
  nearbyDarkSpots?: { name: string; distance: number; lat: number; lng: number }[];
}
