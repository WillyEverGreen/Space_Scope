import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Star, 
  Moon, 
  Sun, 
  Sparkles, 
  Eye, 
  EyeOff,
  Clock,
  Calendar,
  Navigation,
  Telescope,
  CloudOff,
  Info,
  ChevronRight,
  Target,
  Compass,
  X,
  Loader2,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap, useMapEvents, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PageLayout from '@/components/Layout/PageLayout';
import { fetchSkyEvents, type AstronomicalEvent, type AuroraForecast, type GeomagneticStorm } from '@/services/api';
import type { VisibilityLevel, PersonalizedEventInfo } from '@/types';

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Generate visibility zones based on event type
const getVisibilityZonesForEvent = (event: AstronomicalEvent | null) => {
  const zones = {
    full: [] as { id: string; name: string; coords: [number, number][] }[],
    partial: [] as { id: string; name: string; coords: [number, number][] }[],
  };

  if (!event) return zones;

  // Northern Hemisphere zones
  if (event.visibility.northern === 'full') {
    zones.full.push(
      { id: 'na-north', name: 'Northern North America', coords: [[50, -170], [50, -50], [72, -50], [72, -170]] },
      { id: 'eu-north', name: 'Northern Europe', coords: [[55, -10], [55, 60], [72, 60], [72, -10]] },
      { id: 'as-north', name: 'Northern Asia', coords: [[50, 60], [50, 180], [72, 180], [72, 60]] },
    );
  } else if (event.visibility.northern === 'partial') {
    zones.partial.push(
      { id: 'na-north', name: 'Northern North America', coords: [[50, -170], [50, -50], [72, -50], [72, -170]] },
      { id: 'eu-north', name: 'Northern Europe', coords: [[55, -10], [55, 60], [72, 60], [72, -10]] },
      { id: 'as-north', name: 'Northern Asia', coords: [[50, 60], [50, 180], [72, 180], [72, 60]] },
    );
  }

  // Mid-latitude zones
  if (event.visibility.northern === 'full') {
    zones.partial.push(
      { id: 'na-mid', name: 'Central North America', coords: [[25, -130], [25, -65], [50, -65], [50, -130]] },
      { id: 'eu-mid', name: 'Central Europe', coords: [[35, -10], [35, 45], [55, 45], [55, -10]] },
      { id: 'as-mid', name: 'Central Asia', coords: [[25, 60], [25, 145], [50, 145], [50, 60]] },
    );
  }

  // Tropical zones
  if (event.visibility.tropical === 'full') {
    zones.full.push(
      { id: 'tropics', name: 'Tropical Belt', coords: [[-23.5, -180], [-23.5, 180], [23.5, 180], [23.5, -180]] },
    );
  } else if (event.visibility.tropical === 'partial') {
    zones.partial.push(
      { id: 'tropics', name: 'Tropical Belt', coords: [[-23.5, -180], [-23.5, 180], [23.5, 180], [23.5, -180]] },
    );
  }

  // Southern Hemisphere zones
  if (event.visibility.southern === 'full') {
    zones.full.push(
      { id: 'sa-south', name: 'Southern South America', coords: [[-60, -80], [-60, -30], [-23.5, -30], [-23.5, -80]] },
      { id: 'au-south', name: 'Australia & New Zealand', coords: [[-50, 110], [-50, 180], [-10, 180], [-10, 110]] },
      { id: 'af-south', name: 'Southern Africa', coords: [[-35, 15], [-35, 50], [-10, 50], [-10, 15]] },
    );
  } else if (event.visibility.southern === 'partial') {
    zones.partial.push(
      { id: 'sa-south', name: 'Southern South America', coords: [[-60, -80], [-60, -30], [-23.5, -30], [-23.5, -80]] },
      { id: 'au-south', name: 'Australia & New Zealand', coords: [[-50, 110], [-50, 180], [-10, 180], [-10, 110]] },
      { id: 'af-south', name: 'Southern Africa', coords: [[-35, 15], [-35, 50], [-10, 50], [-10, 15]] },
    );
  }

  return zones;
};

const visibilityColors: Record<VisibilityLevel, string> = {
  full: '#22c55e',      // Green
  partial: '#eab308',  // Yellow
  none: '#6b7280',     // Grey
};

// Custom map event handler component
const MapEventHandler = ({ onLocationSelect, onZoomChange }: { 
  onLocationSelect: (lat: number, lng: number) => void;
  onZoomChange: (zoom: number) => void;
}) => {
  const map = useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
    zoomend: () => {
      onZoomChange(map.getZoom());
    }
  });
  return null;
};

// Location finder component
const LocationFinder = ({ onLocate }: { onLocate: (lat: number, lng: number) => void }) => {
  const map = useMap();
  
  const handleLocate = () => {
    map.locate({ setView: true, maxZoom: 10 });
    map.on('locationfound', (e) => {
      onLocate(e.latlng.lat, e.latlng.lng);
    });
  };
  
  return (
    <button
      onClick={handleLocate}
      className="absolute top-4 right-4 z-[1000] p-3 rounded-xl glass-card hover:bg-star-white/20 transition-colors"
      title="Find my location"
    >
      <Navigation className="w-5 h-5 text-cosmic-glow" />
    </button>
  );
};

const SkyEventsMapPage = () => {
  const [events, setEvents] = useState<AstronomicalEvent[]>([]);
  const [aurora, setAurora] = useState<AuroraForecast | null>(null);
  const [storms, setStorms] = useState<GeomagneticStorm[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<AstronomicalEvent | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [personalizedInfo, setPersonalizedInfo] = useState<PersonalizedEventInfo | null>(null);
  const [zoomLevel, setZoomLevel] = useState(2);
  const [showInfoCard, setShowInfoCard] = useState(false);
  const [locationName, setLocationName] = useState<string>('');

  // Fetch real data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchSkyEvents();
        setEvents(data.events);
        setAurora(data.aurora);
        setStorms(data.storms);
        if (data.events.length > 0) {
          setSelectedEvent(data.events[0]);
        }
      } catch (error) {
        console.error('Failed to fetch sky events:', error);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  // Get visibility for user's location based on selected event
  const getVisibilityForLocation = (lat: number, event: AstronomicalEvent | null): VisibilityLevel => {
    if (!event) return 'none';
    
    // Determine region based on latitude
    if (lat > 50) {
      return event.visibility.northern;
    } else if (lat > 23.5) {
      return event.visibility.northern === 'full' ? 'partial' : event.visibility.northern;
    } else if (lat > -23.5) {
      return event.visibility.tropical;
    } else if (lat > -50) {
      return event.visibility.southern === 'full' ? 'partial' : event.visibility.southern;
    } else {
      return event.visibility.southern;
    }
  };

  // Reverse geocoding to get location name
  const getLocationName = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`
      );
      const data = await response.json();
      return data.display_name?.split(',').slice(0, 2).join(', ') || 'Unknown Location';
    } catch {
      return 'Unknown Location';
    }
  };

  // Handle location selection
  const handleLocationSelect = async (lat: number, lng: number) => {
    setUserLocation({ lat, lng });
    const visibility = getVisibilityForLocation(lat, selectedEvent);
    const name = await getLocationName(lat, lng);
    setLocationName(name);
    
    // Generate personalized info
    const personalTips = generatePersonalTips(visibility, selectedEvent);
    const nearbyDarkSpots = generateNearbyDarkSpots(lat, lng);
    
    setPersonalizedInfo({
      eventId: selectedEvent?.id || '',
      userLocation: { lat, lng, name },
      visibility,
      bestViewingTime: selectedEvent?.peakTime || '22:00 - 02:00 local time',
      weatherForecast: aurora && aurora.kpIndex >= 4 ? `Aurora possible! Kp: ${aurora.kpIndex}` : 'Check local weather',
      personalTips,
      nearbyDarkSpots
    });
    
    setShowInfoCard(true);
  };

  // Generate personalized tips based on visibility
  const generatePersonalTips = (visibility: VisibilityLevel, event: AstronomicalEvent | null): string[] => {
    if (!event) return [];
    const baseTips = [...event.tips];
    
    if (visibility === 'full') {
      return [
        '🎉 You\'re in a prime viewing zone!',
        ...baseTips,
        'Consider inviting friends for a viewing party'
      ];
    } else if (visibility === 'partial') {
      return [
        '⚠️ Partial visibility from your location',
        'Travel to higher latitudes for better views if possible',
        ...baseTips.slice(0, 2),
        'Check local astronomy clubs for viewing events'
      ];
    } else {
      return [
        '😔 This event is not visible from your location',
        'Consider traveling to a visible region',
        'Watch live streams from optimal locations',
        'Check back for upcoming events in your area'
      ];
    }
  };

  // Generate nearby dark spots
  const generateNearbyDarkSpots = (lat: number, lng: number): { name: string; distance: number; lat: number; lng: number }[] => {
    // Simulated dark spots based on general location
    return [
      { name: 'Mountain Observatory Park', distance: 45, lat: lat + 0.5, lng: lng - 0.3 },
      { name: 'Lakeside Dark Sky Reserve', distance: 78, lat: lat + 0.8, lng: lng + 0.4 },
      { name: 'Rural Stargazing Point', distance: 32, lat: lat - 0.3, lng: lng + 0.2 }
    ];
  };

  const getEventIcon = (type: AstronomicalEvent['type']) => {
    switch (type) {
      case 'meteor_shower': return Sparkles;
      case 'eclipse': return Sun;
      case 'supermoon': return Moon;
      case 'aurora': return Star;
      case 'planet_conjunction': return Target;
      case 'comet': return Compass;
      case 'solstice':
      case 'equinox': return Sun;
      default: return Star;
    }
  };

  const getVisibilityText = (visibility: VisibilityLevel) => {
    switch (visibility) {
      case 'full': return 'Fully Visible';
      case 'partial': return 'Partially Visible';
      case 'none': return 'Not Visible';
    }
  };

  const getVisibilityBgColor = (visibility: VisibilityLevel) => {
    switch (visibility) {
      case 'full': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'partial': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'none': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const visibilityZones = getVisibilityZonesForEvent(selectedEvent);

  if (loading) {
    return (
      <PageLayout title="Sky Events Map" subtitle="Loading celestial events...">
        <div className="flex items-center justify-center h-[500px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-cosmic-glow animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Fetching astronomical data...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Sky Events Map" 
      subtitle="Discover celestial events and find the best viewing spots"
    >
      {/* Aurora Alert Banner */}
      {aurora && aurora.auroraActivity !== 'none' && aurora.auroraActivity !== 'low' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 mb-6 border border-green-500/30 bg-green-500/10"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <Zap className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex-1">
              <div className="font-heading text-green-400 flex items-center gap-2">
                Aurora Alert Active!
                <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-xs">
                  Kp {aurora.kpIndex.toFixed(1)}
                </span>
              </div>
              <p className="text-sm text-star-white/70">
                Geomagnetic activity is {aurora.auroraActivity}. Aurora may be visible down to {aurora.visibleLatitude}° latitude tonight.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Events Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 space-y-4"
        >
          <div className="glass-card p-4">
            <h3 className="font-heading text-lg text-star-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cosmic-glow" />
              Upcoming Events
              <span className="ml-auto text-xs text-muted-foreground">{events.length} events</span>
            </h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {events.map((event) => {
                const Icon = getEventIcon(event.type);
                const isSelected = selectedEvent?.id === event.id;
                const isLive = event.id === 'aurora-live';
                
                return (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className={`w-full p-3 rounded-xl text-left transition-all ${
                      isSelected 
                        ? 'bg-cosmic-glow/20 border border-cosmic-glow/50' 
                        : 'bg-star-white/5 hover:bg-star-white/10 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-cosmic-glow/30' : isLive ? 'bg-green-500/30' : 'bg-star-white/10'}`}>
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-cosmic-glow' : isLive ? 'text-green-400' : 'text-star-white/70'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium text-sm flex items-center gap-2 ${isSelected ? 'text-cosmic-glow' : 'text-star-white'}`}>
                          {event.name}
                          {isLive && (
                            <span className="px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px] uppercase font-bold">
                              Live
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="flex gap-1 mt-2">
                          {event.visibility.northern !== 'none' && (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                              event.visibility.northern === 'full' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                            }`}>N</span>
                          )}
                          {event.visibility.tropical !== 'none' && (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                              event.visibility.tropical === 'full' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                            }`}>T</span>
                          )}
                          {event.visibility.southern !== 'none' && (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                              event.visibility.southern === 'full' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                            }`}>S</span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-cosmic-glow' : 'text-muted-foreground'}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="glass-card p-4">
            <h3 className="font-heading text-sm text-star-white mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4 text-cosmic-glow" />
              Visibility Legend
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-green-500" />
                <span className="text-sm text-star-white/80">Fully Visible</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-yellow-500" />
                <span className="text-sm text-star-white/80">Partially Visible</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-gray-500" />
                <span className="text-sm text-star-white/80">Not Visible</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-star-white/10">
              <p className="text-xs text-muted-foreground">
                Click anywhere on the map or use the location button to see personalized viewing info.
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-star-white/10">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="text-green-400">N</span>=Northern,
                <span className="text-yellow-400">T</span>=Tropical,
                <span className="text-green-400">S</span>=Southern
              </p>
            </div>
          </div>

          {/* Geomagnetic Storms */}
          {storms.length > 0 && (
            <div className="glass-card p-4">
              <h3 className="font-heading text-sm text-star-white mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Recent Geomagnetic Storms
              </h3>
              <div className="space-y-2">
                {storms.slice(0, 3).map((storm) => (
                  <div key={storm.id} className="text-xs p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-center justify-between">
                      <span className="text-amber-400 font-medium">Kp {storm.kpIndex}</span>
                      <span className="text-muted-foreground">
                        {new Date(storm.startTime).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3 glass-card p-4 relative"
        >
          {selectedEvent && (
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading text-lg text-star-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-cosmic-glow" />
                  {selectedEvent.name}
                </h3>
                <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
              </div>
              {selectedEvent.peakTime && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cosmic-glow/20">
                  <Clock className="w-4 h-4 text-cosmic-glow" />
                  <span className="text-sm text-cosmic-glow">{selectedEvent.peakTime}</span>
                </div>
              )}
            </div>
          )}

          <div className="relative h-[500px] rounded-xl overflow-hidden border border-star-white/10">
            <MapContainer
              center={[30, 0]}
              zoom={2}
              className="h-full w-full"
              style={{ background: '#0a0a1a' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              
              {/* Full visibility zones */}
              {visibilityZones.full.map((zone) => (
                <Polygon
                  key={zone.id}
                  positions={zone.coords}
                  pathOptions={{
                    color: visibilityColors.full,
                    fillColor: visibilityColors.full,
                    fillOpacity: 0.3,
                    weight: 2
                  }}
                >
                  <Popup>
                    <div className="text-center">
                      <strong className="text-green-600">{zone.name}</strong><br />
                      <span className="text-sm">Full visibility</span>
                    </div>
                  </Popup>
                </Polygon>
              ))}
              
              {/* Partial visibility zones */}
              {visibilityZones.partial.map((zone) => (
                <Polygon
                  key={zone.id}
                  positions={zone.coords}
                  pathOptions={{
                    color: visibilityColors.partial,
                    fillColor: visibilityColors.partial,
                    fillOpacity: 0.25,
                    weight: 2
                  }}
                >
                  <Popup>
                    <div className="text-center">
                      <strong className="text-yellow-600">{zone.name}</strong><br />
                      <span className="text-sm">Partial visibility</span>
                    </div>
                  </Popup>
                </Polygon>
              ))}
              
              {/* User location marker */}
              {userLocation && (
                <Marker position={[userLocation.lat, userLocation.lng]}>
                  <Popup>
                    <div className="text-center">
                      <strong>{locationName || 'Your Location'}</strong>
                      <br />
                      <span className="text-sm">
                        {getVisibilityText(getVisibilityForLocation(userLocation.lat, selectedEvent))}
                      </span>
                    </div>
                  </Popup>
                </Marker>
              )}
              
              <MapEventHandler 
                onLocationSelect={handleLocationSelect}
                onZoomChange={setZoomLevel}
              />
              <LocationFinder onLocate={handleLocationSelect} />
            </MapContainer>
          </div>

          {/* Data source attribution */}
          <div className="mt-3 text-xs text-muted-foreground text-center">
            Data: NOAA Space Weather Prediction Center • NASA DONKI • Astronomical calculations
          </div>
        </motion.div>
      </div>

      {/* Personalized Info Card */}
      <AnimatePresence>
        {showInfoCard && personalizedInfo && selectedEvent && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50"
          >
            <div className="glass-card p-6 border border-cosmic-glow/30 shadow-2xl">
              <button
                onClick={() => setShowInfoCard(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-star-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              <div className="flex items-start gap-4 mb-4">
                <div className={`p-3 rounded-xl ${getVisibilityBgColor(personalizedInfo.visibility)} border`}>
                  {personalizedInfo.visibility === 'full' ? (
                    <Eye className="w-6 h-6" />
                  ) : personalizedInfo.visibility === 'partial' ? (
                    <Eye className="w-6 h-6" />
                  ) : (
                    <EyeOff className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-heading text-xl text-star-white">
                      What This Means For You
                    </h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getVisibilityBgColor(personalizedInfo.visibility)}`}>
                      {getVisibilityText(personalizedInfo.visibility)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{personalizedInfo.userLocation.name || locationName}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tips */}
                <div className="space-y-2">
                  <h5 className="font-medium text-star-white flex items-center gap-2">
                    <Info className="w-4 h-4 text-cosmic-glow" />
                    Personalized Tips
                  </h5>
                  <ul className="space-y-1.5">
                    {personalizedInfo.personalTips.slice(0, 4).map((tip, i) => (
                      <li key={i} className="text-sm text-star-white/70 flex items-start gap-2">
                        <span className="text-cosmic-glow mt-1">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Best Viewing Time & Aurora Info */}
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium text-star-white flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-cosmic-glow" />
                      Best Viewing Time
                    </h5>
                    <p className="text-sm text-cosmic-glow font-medium">{personalizedInfo.bestViewingTime}</p>
                  </div>
                  
                  {aurora && (
                    <div>
                      <h5 className="font-medium text-star-white flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-cosmic-glow" />
                        Aurora Conditions
                      </h5>
                      <p className="text-sm text-star-white/70">
                        Kp Index: <span className="text-cosmic-glow font-medium">{aurora.kpIndex.toFixed(1)}</span>
                        <span className="mx-2">•</span>
                        Activity: <span className="capitalize">{aurora.auroraActivity}</span>
                      </p>
                    </div>
                  )}
                  
                  {personalizedInfo.visibility !== 'full' && personalizedInfo.nearbyDarkSpots && (
                    <div>
                      <h5 className="font-medium text-star-white flex items-center gap-2 mb-2">
                        <CloudOff className="w-4 h-4 text-cosmic-glow" />
                        Nearby Dark Sky Spots
                      </h5>
                      <div className="space-y-1">
                        {personalizedInfo.nearbyDarkSpots.slice(0, 2).map((spot, i) => (
                          <div key={i} className="text-sm text-star-white/70 flex items-center justify-between">
                            <span>{spot.name}</span>
                            <span className="text-xs text-muted-foreground">{spot.distance} km</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Equipment suggestion */}
              {selectedEvent?.equipment && (
                <div className="mt-4 pt-4 border-t border-star-white/10">
                  <h5 className="font-medium text-star-white flex items-center gap-2 mb-2">
                    <Telescope className="w-4 h-4 text-cosmic-glow" />
                    Recommended Equipment
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.equipment.map((item, i) => (
                      <span key={i} className="px-2 py-1 rounded-lg bg-star-white/10 text-xs text-star-white/80">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageLayout>
  );
};

export default SkyEventsMapPage;
